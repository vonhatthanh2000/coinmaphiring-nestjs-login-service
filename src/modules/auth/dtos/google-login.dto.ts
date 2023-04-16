import { IsString, IsNotEmpty } from 'class-validator';

export class TokenDataBodyDto {
  @IsString()
  @IsNotEmpty()
  credential: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;
}

export default TokenDataBodyDto;
