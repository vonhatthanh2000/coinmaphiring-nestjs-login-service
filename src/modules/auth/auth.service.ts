import { User } from '@entities';
import { UserStatus } from '@enums';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
} from '@environments';
import { AuthToken } from '@interfaces';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { hash, verify } from 'argon2';
import { AuthPayload } from 'src/interfaces/auth-payload.interface';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { RegiterUserDto } from './dtos';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUserAccount(dto: RegiterUserDto): Promise<User> {
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
    return user;
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

  async validateLocalLogin(
    email: string,
    password: string,
  ): Promise<AuthPayload | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'username', 'password'],
    });

    if (!user) return null;

    const compared = await verify(user.password, password);
    if (compared)
      return {
        id: user.id,
        name: user.username,
        email: user.email,
      };
    return null;
  }

  login(payload: AuthPayload): AuthToken {
    return this.generateToken(payload);
  }

  generateToken(payload: AuthPayload): AuthToken {
    const accessToken = this.jwtService.sign(payload, {
      secret: ACCESS_TOKEN_SECRET,
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: REFRESH_TOKEN_SECRET,
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
