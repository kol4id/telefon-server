import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CookieRefreshGuard } from './cookie-refresh.guard';
import { CookieAccessGuard } from './cookie-access.guard';
import { MongoModule } from 'src/mongo/mongo.module';
import { TokenModule } from 'src/token/token.module';


@Module({
  imports: [
    TokenModule,
    MongoModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, CookieRefreshGuard, CookieAccessGuard],
  exports: [AuthService, CookieRefreshGuard, CookieAccessGuard],
})
export class AuthModule {}