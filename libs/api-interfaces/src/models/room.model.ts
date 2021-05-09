import { UserModel } from './user.model';

export interface RoomModel {
  id: string;
  owner: string;
  show: boolean;
  usersList: string[];
  users: Record<string, UserModel>;
  refCounts: Record<string, number>;
  votes: Record<string, number>;
  voted: Record<string, boolean>;
}
