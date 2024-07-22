import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { TokenModule } from 'src/token/token.module';
import { Redis } from 'ioredis';
import { MongoModule } from 'src/mongo/mongo.module';
import { RealtimeService } from './realtime.service';
import { MessagesModule } from 'src/messages/messages.module';
import { MessageRepository } from 'src/mongo/mongo-message.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    AuthModule,
    TokenModule,
    MongoModule,
    UserModule
  ],
  providers: [RealtimeGateway, RealtimeService],
  exports: [RealtimeGateway],

})
export class RealtimeModule {}
