import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { UserSessionModel } from '@planning-poker/api-interfaces';

@Injectable()
export class AuthService {
  constructor(protected jwtService: JwtService) {
  }

  login(name: string): Observable<{ accessToken: string }> {
    const user: Omit<UserSessionModel, 'exp' | 'iat'> = {
      id: uuidv4(),
      name,
    };

    return of<{ accessToken: string }>({
      accessToken: this.jwtService.sign(user),
    });
  }
}
