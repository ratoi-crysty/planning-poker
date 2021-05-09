import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getSecret } from '../utils/secret';
import { UserSessionModel } from '@planning-poker/api-interfaces';
import { Socket } from 'socket.io';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req: Request | Socket): string | null => this.jwtExtractor(req),
      ignoreExpiration: false,
      secretOrKey: getSecret(),
    });
  }

  validate(payload: UserSessionModel): UserSessionModel {
    return payload;
  }

  protected jwtExtractor(req: Request | Socket): string | null {
    return ExtractJwt.fromUrlQueryParameter('jwt_bearer')(
      this.isSocket(req)
        ? req.handshake as unknown as Request
        : req
    )
  }

  protected isSocket(req: Request | Socket): req is Socket {
    return req.constructor.name === 'Socket';
  }
}
