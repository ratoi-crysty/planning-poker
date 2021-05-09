import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDts {
  @IsNotEmpty()
  @IsString()
  name!: string;
}
