import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule, UserModule } from '@modules';
import { User } from '@entities';
import { JwtModule } from '@nestjs/jwt';
import { GithubStrategy, JwtStrategy } from './strategies';
// import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserModule,
    MailModule,
    JwtModule,
  ],
  providers: [AuthService, JwtStrategy, GithubStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
