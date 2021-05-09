import { RoomModel } from '@planning-poker/api-interfaces';

export function getRoomOutput(room: RoomModel): RoomModel {
  return {
    ...room,
    // refCounts: {},
    votes: room.show ? room.votes : {},
  };
}
