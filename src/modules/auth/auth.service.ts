import { User } from '@entities';
import { UserStatus } from '@enums';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'argon2';
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
}
