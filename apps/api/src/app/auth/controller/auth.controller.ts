import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LoginDts } from '../dts/login.dts';
import { AuthRequest } from '../models/auth-request';
import { UserSessionModel } from '@planning-poker/api-interfaces';

@Controller('auth')
export class AuthController {
  constructor(protected authService: AuthService) {
  }

  @Post('login')
  login(@Body() body: LoginDts): Observable<{ accessToken: string }> {
    return this.authService.login(body.name);
  }

  @Get('test')
  @UseGuards(JwtAuthGuard)
  test(@Req() req: AuthRequest): UserSessionModel {
    return req.user;
  }
}
