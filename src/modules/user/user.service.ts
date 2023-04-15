import { User } from '@entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
}
