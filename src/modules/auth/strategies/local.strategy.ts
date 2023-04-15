import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AuthPayload } from '@interfaces';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<AuthPayload> {
    const payload = await this.authService.validateLocalLogin(email, password);
    if (!payload) {
      throw new UnauthorizedException('Email or password is incorrect');
    }
    return payload;
  }
}
