import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { TokenModule } from 'src/token/token.module';
import { Redis } from 'ioredis';
import { MongoModule } from 'src/mongo/mongo.module';

@Module({
  imports: [
    AuthModule,
    TokenModule,
    MongoModule
  ],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],

})
export class RealtimeModule {}
