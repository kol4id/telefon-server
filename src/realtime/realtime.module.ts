import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [
    AuthModule,
    TokenModule,
  ],
  providers: [RealtimeGateway]

})
export class RealtimeModule {}
