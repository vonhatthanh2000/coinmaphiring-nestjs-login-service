import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    type: String,
    minLength: 8,
    maxLength: 32,
    example: 'Abcd1234',
  })
  @IsString()
  @Length(4, 120)
  readonly oldPassword: string;

  @ApiProperty({
    type: String,
    minLength: 4,
    maxLength: 120,
    example: 'Abcd1234',
    description:
      'Password must contain at least one uppercase letter, one lowercase letter and one number',
  })
  @MinLength(4, {
    message: 'Length of password is too short. Minimum length is 4',
  })
  @MaxLength(120, {
    message: 'Length of password is too long. Maximum length is 120',
  })
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{4,}$/, {
    message:
      'password must contain at least four characters, at least one number and both lower and uppercase letters',
  })
  @ValidateIf((o) => o.newPassword !== o.oldPassword, {
    message: 'New password must be different from old password',
  })
  readonly newPassword: string;
}
