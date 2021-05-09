import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { RoomModel, UserModel, UserSessionModel } from '@planning-poker/api-interfaces';
import { v4 as uuidv4 } from 'uuid';
import { WsException } from '@nestjs/websockets';
import { omit } from 'lodash';

@Injectable()
export class RoomService {
  protected readonly rooms$ = new BehaviorSubject<Record<string, RoomModel>>({});
  protected leaveRoomTimers: Record<string, NodeJS.Timer> = {};

  getRooms$(): Observable<Record<string, RoomModel>> {
    return this.rooms$.asObservable();
  }

  getRoomByUser(user: UserModel): RoomModel | undefined {
    return Object.values(this.rooms$.getValue())
      .find((room) => room.usersList.includes(user.id));
  }

  vote(userId: string, roomId: string, vote: number | undefined) {
    const rooms: Record<string, RoomModel> = this.rooms$.getValue();
    const room: RoomModel = rooms[roomId];

    this.rooms$.next({
      ...rooms,
      [roomId]: {
        ...room,
        voted: {
          ...room.voted,
          [userId]: !!vote,
        },
        votes: vote
          ? {
            ...room.votes,
            [userId]: vote,
          }
          : omit(room.votes, userId),
      },
    });
  }

  show(userId: string, roomId: string) {
    const rooms: Record<string, RoomModel> = this.rooms$.getValue();
    const room: RoomModel = rooms[roomId];

    this.rooms$.next({
      ...rooms,
      [roomId]: {
        ...room,
        show: true,
      },
    });
  }

  reset(userId: string, roomId: string) {
    const rooms: Record<string, RoomModel> = this.rooms$.getValue();
    const room: RoomModel = rooms[roomId];

    this.rooms$.next({
      ...rooms,
      [roomId]: {
        ...room,
        show: false,
        votes: {},
        voted: {},
      },
    });
  }

  createRoom(user: UserSessionModel): RoomModel {
    const room: RoomModel = {
      id: uuidv4(),
      owner: user.id,
      show: false,
      usersList: [],
      refCounts: {},
      users: {},
      voted: {},
      votes: {},
    };

    this.rooms$.next({
      ...this.rooms$.getValue(),
      [room.id]: room,
    });

    return room;
  }

  joinRoom(id: string, user: UserModel): void {
    const rooms: Record<string, RoomModel> = this.rooms$.getValue();
    let room: RoomModel = rooms[id];
    clearTimeout(this.leaveRoomTimers[user.id]);

    if (!room) {
      throw new WsException({ status: 404, message: 'Room was not found' });
    }

    if (room.users[user.id]) {
      room = {
        ...room,
        refCounts: {
          ...room.refCounts,
          [user.id]: room.refCounts[user.id] + 1,
        },
      };
    } else {
      room = {
        ...room,
        usersList: [...room.usersList, user.id],
        users: { ...room.users, [user.id]: user },
        refCounts: {
          ...room.refCounts,
          [user.id]: 1,
        },
      };
    }

    this.rooms$.next({
      ...rooms,
      [id]: room,
    });
  }

  leaveRoom(id: string, user: UserModel): void {
    let rooms: Record<string, RoomModel> = this.rooms$.getValue();
    let room: RoomModel = rooms[id];

    if (!room) {
      throw new WsException({ status: 404, message: 'Room was not found' });
    }

    room = {
      ...room,
      refCounts: {
        ...room.refCounts,
        [user.id]: room.refCounts[user.id] - 1,
      },
    };

    this.rooms$.next({
      ...rooms,
      [id]: room,
    });

    if (!room.refCounts[user.id]) {
      this.leaveRoomTimers[user.id] = setTimeout(() => {
        rooms = this.rooms$.getValue();
        room = rooms[id];

        this.rooms$.next({
          ...rooms,
          [id]: {
            ...room,
            usersList: room.usersList.filter((item: string) => item !== user.id),
            users: omit(room.users, user.id),
          },
        });
      }, 1000);
    }
  }

  getRoomValue(id: string): RoomModel | undefined {
    return this.rooms$.getValue()[id];
  }
}
