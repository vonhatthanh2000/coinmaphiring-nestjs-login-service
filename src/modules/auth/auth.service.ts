import { User } from '@entities';
import { UserStatus } from '@enums';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET,
  GOOGLE_CALLBACK_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
  RESET_PASSWORD_TOKEN_SECRET,
} from '@environments';
import { AuthPayload, AuthToken } from '@interfaces';
import {
  BadGatewayException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Profile as GithubProfile } from 'passport-github2';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { hash, verify } from 'argon2';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import {
  ChangePasswordDto,
  LocalLoginDto,
  RegiterUserDto,
  ResetPasswordDto,
} from './dtos';
import { google } from 'googleapis';
import { Logger } from 'winston';
import { OAuth2Client } from 'google-auth-library';
import { UserResponse } from '../user/dtos';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class AuthService {
  private oauthClient: OAuth2Client;

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {
    this.oauthClient = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_CALLBACK_URL,
    );
  }

  async registerUserAccount(dto: RegiterUserDto): Promise<UserResponse> {
    if (await this.userService.existByEmail(dto.email))
      throw new Error('Email already exists');
    if (await this.userService.existByUsername(dto.username))
      throw new Error('Username already exists');
    // Create user account
    const verifyToken = Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substr(0, 5)
      .toUpperCase();
    const userInput = await this.userRepository.create({
      ...dto,
      password: await hash(dto.password),
      verifyToken,
      status: UserStatus.VERIFY_EMAIL,
    });
    const user = await this.userRepository.save(userInput);
    // Send email to user
    await this.mailService.sendUserConfirmationEmail(user, verifyToken);
    return await this.userService.getUserResponse(user);
  }

  async verifyUserAccount(token: string): Promise<boolean> {
    const splitToken = token.split('-');
    const verifyToken = splitToken.pop().toUpperCase();
    const userId = splitToken.join('-');

    // Change user status to active
    const updated = await this.userRepository.update(
      { id: userId, verifyToken },
      {
        status: UserStatus.ACTIVE,
      },
    );
    if (updated.affected) return true;
  }

  // login(payload: LocalLoginDto): AuthToken {
  //   return this.generateToken(payload);
  // }

  async localLogin(dto: LocalLoginDto): Promise<AuthToken> {
    const user = await this.validateLocalLogin(dto);
    if (user) return this.generateToken(user.id, user.email);
    throw new UnauthorizedException('Invalid email or password');
  }

  async validateLocalLogin(dto: LocalLoginDto): Promise<User> {
    const { username, email, password } = dto;

    const query = {} as LocalLoginDto;
    if (username) query.username = username;
    if (email) query.email = email;
    const user = await this.userRepository.findOneOrFail({ where: query });
    const validation = await verify(user.password, password);
    if (!validation) throw new UnauthorizedException('Invalid password');
    return user;
  }

  generateToken(userId: string, email: string): AuthToken {
    const accessToken = this.jwtService.sign(
      { id: userId, email },
      {
        secret: ACCESS_TOKEN_SECRET,
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, email },
      {
        secret: REFRESH_TOKEN_SECRET,
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  checkIfEmail(email: string): boolean {
    // Regular expression to check if string is email
    const regexExp =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;

    return regexExp.test(email);
  }

  // Authen by google
  async authenticateGoogleUser(token: string): Promise<AuthToken> {
    const ticket = await this.oauthClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const tokenInfo = ticket.getPayload();
    if (tokenInfo?.email && tokenInfo?.name) {
      const { email, name } = tokenInfo;
      const user = await this.validateGoogleUser(email);
      if (user) {
        return this.generateToken(user.id, user.email);
      }
    }

    throw new BadGatewayException('Verify token fail!');
  }

  async validateGoogleUser(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) return user;

    const verifyToken = Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substr(0, 5)
      .toUpperCase();
    const newUser = await this.userRepository.create({
      email,
      verifyToken,
      status: UserStatus.ACTIVE,
    });

    return await this.userRepository.save(newUser);
  }

  async validateGithubUser(
    accessToken: string,
    githubProfile: GithubProfile,
  ): Promise<AuthPayload> {
    if (!githubProfile.emails) {
      this.logger.error(
        `Github profile doesn't have email: ${JSON.stringify(githubProfile)}`,
      );
      throw new Error('Email is required');
    }

    if (githubProfile.emails.at(0) === undefined) {
      this.logger.error(
        `Github profile doesn't have email: ${JSON.stringify(githubProfile)}`,
      );
      throw new Error('Email is required');
    }

    const email = githubProfile.emails.at(0).value;
    let user = await this.userService.findByEmail(email);
    if (user) {
      if (user.status !== UserStatus.ACTIVE)
        await this.userRepository.update(
          { id: user.id },
          { status: UserStatus.ACTIVE },
        );
    } else {
      const verifyToken = Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substr(0, 5)
        .toUpperCase();

      const newUser = await this.userRepository.create({
        email,
        verifyToken,
        status: UserStatus.ACTIVE,
      });
      user = await this.userRepository.save(newUser);
    }
    return {
      email: email,
      id: user.id,
      name: githubProfile.displayName,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<User> {
    const user = await this.userRepository.findOneOrFail({
      where: {
        id: userId,
      },
    });
    const validation = await verify(user.password, dto.oldPassword);
    if (!validation) throw new UnauthorizedException('Invalid password');
    user.password = await hash(dto.newPassword);
    return await this.userRepository.save(user);
  }

  async requestResetPassword(email: string): Promise<boolean> {
    const user = await this.userService.findByEmail(email);
    const resetToken = this.generateResetPasswordToken(
      user.id,
      user.verifyToken,
    );

    // send mail to reset password
    await this.mailService.sendUserResetPassword(user, resetToken);
    return true;
  }

  async resetPassword(
    userId,
    verifyToken,
    dto: ResetPasswordDto,
  ): Promise<boolean> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId, verifyToken },
    });
    const newVerifyToken = Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substr(0, 5)
      .toUpperCase();
    await this.userRepository.update(
      { id: user.id },
      { verifyToken: newVerifyToken, password: await hash(dto.password) },
    );
    return true;
  }

  generateResetPasswordToken(userId: string, verifyToken: string): string {
    return this.jwtService.sign(
      {
        sub: userId,
        key: verifyToken,
      },
      {
        secret: RESET_PASSWORD_TOKEN_SECRET,
        expiresIn: '1h',
      },
    );
  }
}
