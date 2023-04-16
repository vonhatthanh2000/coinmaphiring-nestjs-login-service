import { RESET_PASSWORD_TOKEN_SECRET } from '@environments';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtResetPasswordStrategy extends PassportStrategy(
  Strategy,
  'jwt-reset-password',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: RESET_PASSWORD_TOKEN_SECRET,
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(payload: any) {
    return { id: payload.sub, verifyToken: payload.key };
  }
}
