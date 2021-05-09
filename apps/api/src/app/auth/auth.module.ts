import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { getSecret } from './utils/secret';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthController } from './controller/auth.controller';

@Module({
  imports: [JwtModule.register({
    secret: getSecret(),
    signOptions: {
      expiresIn: '30d',
    },
  })],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
})
export class AuthModule {

}
