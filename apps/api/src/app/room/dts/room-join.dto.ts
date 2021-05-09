import { IsString } from 'class-validator';

export class RoomJoinDto {
  @IsString()
  id!: string;
}
