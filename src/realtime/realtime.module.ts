import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { TokenModule } from 'src/token/token.module';
import { MongoModule } from 'src/mongo/mongo.module';
import { RealtimeService } from './realtime.service';
import { MessagesModule } from 'src/messages/messages.module';
import { UserModule } from 'src/user/user.module';
import { ChannelsModule } from 'src/channels/channels.module';
import { MediaModule } from 'src/media/media.module';

@Module({
  imports: [
    AuthModule,
    TokenModule,
    MongoModule,
    ChannelsModule,
    MessagesModule,
    UserModule,
    MediaModule
  ],
  providers: [RealtimeGateway, RealtimeService],
  exports: [RealtimeGateway],

})
export class RealtimeModule {}
