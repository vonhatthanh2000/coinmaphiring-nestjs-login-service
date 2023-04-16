import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ACCESS_TOKEN_SECRET } from '@environments';
import { UserService } from 'src/modules/user/user.service';
import { User } from '@entities';
import { AuthPayload } from '@interfaces';
import { UserStatus } from '@enums';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: AuthPayload): Promise<User> {
    const user = await this.userService.findUser(payload);
    if (!user) {
      throw new UnauthorizedException();
    } else if (user.status !== UserStatus.ACTIVE)
      throw new Error('This account is not active yet');

    return user;
  }
}
