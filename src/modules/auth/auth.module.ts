import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule, UserModule } from '@modules';
import { User } from '@entities';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UserModule, MailModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
