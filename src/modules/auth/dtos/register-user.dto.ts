import { Match } from '@decorators';
import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(120)
  @ApiProperty()
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{4,}$/, {
    message:
      'password must contain at least four characters, at least one number and both lower and uppercase letters',
  })
  password?: string;

  @IsString()
  @MinLength(4)
  @MaxLength(120)
  @ApiProperty()
  @Match('password', {
    message: 'password and confirmation password do not match',
  })
  passwordConfirm: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  @Transform(({ value }) => (value ? value.toLowerCase() : ''))
  email: string;
}
