import { User } from '@entities';
import { UserStatus } from '@enums';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
} from '@environments';
import { AuthToken } from '@interfaces';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { hash, verify } from 'argon2';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { LocalLoginDto, RegiterUserDto } from './dtos';

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

  login(payload: LocalLoginDto): AuthToken {
    return this.generateToken(payload);
  }

  async localLogin(dto: LocalLoginDto): Promise<AuthToken> {
    const isValidated = await this.validateLocalLogin(dto);
    if (isValidated) return this.generateToken(dto);
    throw new UnauthorizedException('Invalid email or password');
  }

  async validateLocalLogin(dto: LocalLoginDto): Promise<boolean> {
    const { username, email, password } = dto;

    const query = {} as LocalLoginDto;
    if (username) query.username = username;
    if (email) query.email = email;
    const user = await this.userRepository.findOneOrFail({ where: query });
    return verify(user.password, password);
  }

  generateToken(payload: LocalLoginDto): AuthToken {
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

  checkIfEmail(email: string): boolean {
    // Regular expression to check if string is email
    const regexExp =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;

    return regexExp.test(email);
  }
}
