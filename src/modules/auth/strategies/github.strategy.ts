import { Strategy, Profile } from 'passport-github2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import {
  GITHUB_CALLBACK_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} from '@environments';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK_URL,
      scope: ['user:email', 'read:user'],
    });
  }

  // Github not return refresh token
  async validate(
    accessToken: string,
    _: string,
    profile: Profile,
    // eslint-disable-next-line @typescript-eslint/ban-types
    verified: Function,
  ): Promise<void> {
    const payload = await this.authService.validateGithubUser(
      accessToken,
      profile,
    );
    verified(null, payload);
  }
}
