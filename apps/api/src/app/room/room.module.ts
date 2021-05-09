import { Module } from '@nestjs/common';
import { RoomService } from './service/room.service';
import { RoomGateway } from './gateways/room.gateway';

@Module({
  providers: [RoomService, RoomGateway],
})
export class RoomModule {}
