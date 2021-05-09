import { UserSessionModel } from '@planning-poker/api-interfaces';

export interface AuthRequest extends Request {
  user: UserSessionModel;
}
