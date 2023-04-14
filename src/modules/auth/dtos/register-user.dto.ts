import { Match } from '@decorators';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegiterUserDto {
  @IsString()
  @MinLength(4)
  @MaxLength(30)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(120)
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{4,}$/, {
    message:
      'password must contain at least four characters, at least one number and both lower and uppercase letters',
  })
  password?: string;

  @IsString()
  @MinLength(4)
  @MaxLength(120)
  @Match('password', {
    message: 'password and confirmation password do not match',
  })
  passwordConfirm: string;

  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => (value ? value.toLowerCase() : ''))
  email: string;
}
