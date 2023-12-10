import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CookieRefreshGuard } from './cookie-refresh.guard';
import { CookieAccessGuard } from './cookie-access.guard';
import { MongoModule } from 'src/mongo/mongo.module';
import { TokenModule } from 'src/token/token.module';
import { SocketMiddleware } from './web-sockets.mw';

@Module({
  imports: [
    TokenModule,
    MongoModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, CookieRefreshGuard, CookieAccessGuard, SocketMiddleware],
  exports: [AuthService, CookieRefreshGuard, CookieAccessGuard, SocketMiddleware],
})
export class AuthModule {}