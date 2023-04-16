import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LocalLoginDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  username!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  email!: string;

  @IsString()
  @ApiProperty({ type: String })
  password!: string;
}
