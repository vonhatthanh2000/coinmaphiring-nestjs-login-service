import { User } from '@entities';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegiterUserDto } from './dtos';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegiterUserDto): Promise<User> {
    return this.authService.registerUserAccount(dto);
  }
}
