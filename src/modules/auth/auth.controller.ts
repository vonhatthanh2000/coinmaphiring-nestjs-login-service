import { User } from '@entities';
import { HOME } from '@environments';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalLoginDto, RegiterUserDto } from './dtos';

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

  // @Post('login')
  // login(@Body() dto: LocalLoginDto) {
  //   return this.authService.login(dto);
  // }
}
