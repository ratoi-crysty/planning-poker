import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse
} from '@nestjs/websockets';
import { Req, UseGuards } from '@nestjs/common';
import { AuthRequest } from '../../auth/models/auth-request';
import { RoomModel } from '@planning-poker/api-interfaces';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoomService } from '../service/room.service';
import { RoomJoinDto } from '../dts/room-join.dto';
import { Socket } from 'socket.io';
import { getRoomOutput } from '../utils/room.utils';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@UseGuards(JwtAuthGuard)
@WebSocketGateway({ namespace: 'api/room' })
export class RoomGateway {
  @WebSocketServer() socket!: Socket;

  constructor(protected roomService: RoomService) {
  }

  @SubscribeMessage('create')
  create(@Req() req: AuthRequest): RoomModel {
    return getRoomOutput(this.roomService.createRoom(req.user));
  }

  @SubscribeMessage('join')
  join(@Req() req: AuthRequest, @MessageBody() data: RoomJoinDto, @ConnectedSocket() socket: Socket): WsResponse<RoomModel | undefined> {
    this.socket.adapter.add(socket.id, data.id);

    try {
      this.roomService.joinRoom(data.id, req.user);
    } catch (e) {
      if (e instanceof WsException) {
        return {
          event: 'updated',
          data: undefined
        };
      }

      throw e;
    }

    const subscription: Subscription = this.roomService.getRooms$()
      .pipe(
        map((rooms: Record<string, RoomModel>): RoomModel => rooms[data.id]),
        distinctUntilChanged()
      )
      .subscribe((room: RoomModel) => {
        socket.emit('updated', getRoomOutput(room));
      });

    socket.on('disconnect', () => {
      this.roomService.leaveRoom(data.id, req.user);
      this.socket.adapter.del(socket.id, data.id);
      subscription.unsubscribe();
    });

    const room: RoomModel | undefined = this.roomService.getRoomValue(data.id);

    return {
      event: '0',
      data: room && getRoomOutput(room)
    };
  }

  @SubscribeMessage('vote')
  vote(@Req() req: AuthRequest, @MessageBody() vote: number | undefined): void {
    this.roomService.vote(req.user.id, this.getEditableRoom(req).id, vote);
  }

  @SubscribeMessage('show')
  show(@Req() req: AuthRequest): void {
    const room: RoomModel = this.getOwnerRoom(req);
    this.roomService.show(req.user.id, room.id);
  }

  @SubscribeMessage('reset')
  reset(@Req() req: AuthRequest) {
    const room: RoomModel = this.getOwnerRoom(req);
    this.roomService.reset(req.user.id, room.id);
  }

  @SubscribeMessage('get-voted')
  getVoted(@Req() req: AuthRequest): number | undefined {
    return this.roomService.getRoomByUser(req.user)?.votes[req.user.id];
  }

  protected getEditableRoom(req: AuthRequest): RoomModel {
    const room: RoomModel | undefined = this.roomService.getRoomByUser(req.user);

    if (!room) {
      throw new WsException({ status: 401 });
    } else if (room.show) {
      throw new WsException({ status: 400 });
    }

    return room;
  }

  protected getOwnerRoom(req: AuthRequest): RoomModel {
    const room: RoomModel | undefined = this.roomService.getRoomByUser(req.user);

    if (!room) {
      throw new WsException({ status: 401 });
    } else if (room.owner !== req.user.id) {
      throw new WsException({ status: 403, message: 'You are not the owner of the room' });
    }

    return room;
  }
}
