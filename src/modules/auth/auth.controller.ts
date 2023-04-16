import { CurrentUser } from '@decorators';
import { User } from '@entities';
import { GOOGLE_CLIENT_ID, HOME } from '@environments';
import { AuthToken, Request } from '@interfaces';
import {
  BadGatewayException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  LocalLoginDto,
  RegiterUserDto,
  TokenDataBodyDto,
  TokenDataCookieDto,
} from './dtos';
import { JwtAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegiterUserDto): Promise<User> {
    return this.authService.registerUserAccount(dto);
  }

  @Get('verify/:token')
  verifyEmail(
    @Param('token') token: string,
    @Query('redirectTo') redirectTo: string,
    @Res() res: Response,
  ) {
    const verified = this.authService.verifyUserAccount(token);
    const redirect = redirectTo || HOME;
    if (verified) {
      res.redirect(redirect);
    } else {
      // redirect to error UI
      res.redirect(`${redirect}/error`);
      res.status(HttpStatus.NOT_FOUND).send();
    }
  }

  @Post('login')
  async login(@Body() dto: LocalLoginDto): Promise<AuthToken> {
    const isEmail = this.authService.checkIfEmail(dto.username);
    if (isEmail) {
      dto.email = dto.username;
      delete dto.username;
    }
    return this.authService.localLogin(dto);
  }

  @Post('google/login')
  async googleLogin(@Body() token: TokenDataBodyDto): Promise<AuthToken> {
    const clientId = GOOGLE_CLIENT_ID;
    if (token.clientId !== clientId)
      throw new BadGatewayException('The client ID not valid!');
    return this.authService.authenticateGoogleUser(token.credential);
  }

  @Post('google/callback')
  async handleGoogleRedirectPost(
    @Req() req: Request,
    @Body() tokenData: TokenDataCookieDto,
  ): Promise<AuthToken> {
    const csrfToken = req.cookies['g_csrf_token'];
    if (!csrfToken) throw new BadGatewayException('No CSRF token in Cookie.');
    if (tokenData.g_csrf_token !== csrfToken)
      throw new BadGatewayException('Failed to verify double submit cookie.');

    return this.authService.authenticateGoogleUser(tokenData.credential);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.changePassword(user.id, dto);
    res.clearCookie('accessToken');
  }

  @Delete('logout')
  logout(@Res() res: Response): unknown {
    res.clearCookie('accessToken');

    return res.status(HttpStatus.OK).send({ status: true });
  }
}
