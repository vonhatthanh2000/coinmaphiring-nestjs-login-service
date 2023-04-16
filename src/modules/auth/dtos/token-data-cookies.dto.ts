import { IsString, IsNotEmpty } from 'class-validator';

export class TokenDataCookieDto {
  @IsString()
  @IsNotEmpty()
  credential: string;

  @IsString()
  @IsNotEmpty()
  g_csrf_token: string;
}

export default TokenDataCookieDto;
