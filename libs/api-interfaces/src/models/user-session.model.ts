import { UserModel } from '@planning-poker/api-interfaces';

export interface UserSessionModel extends UserModel {
  iat: number;
  exp: number;
}
