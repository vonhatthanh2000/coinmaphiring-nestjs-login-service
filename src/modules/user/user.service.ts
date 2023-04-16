import { User } from '@entities';
import { AuthPayload } from '@interfaces';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserResponse } from './dtos';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async existByEmail(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) return true;
    return false;
  }

  async existByUsername(username: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { username },
    });
    if (user) return true;
    return false;
  }

  findByUsername(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }

  findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async findUser(dto: AuthPayload): Promise<User> {
    return this.userRepository.findOne({
      where: { id: dto.id, email: dto.email },
    });
  }

  getUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
