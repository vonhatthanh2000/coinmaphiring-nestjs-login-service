import { Match } from '@decorators';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(120)
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{4,}$/, {
    message:
      'password must contain at least four characters, at least one number and both lower and uppercase letters',
  })
  @ApiProperty({ example: '******' })
  password?: string;

  @IsString()
  @MinLength(4)
  @MaxLength(120)
  @Match('password', {
    message: 'password and confirmation password do not match',
  })
  @ApiProperty({ example: '******' })
  passwordConfirm: string;
}
