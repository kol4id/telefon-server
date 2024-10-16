import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MongoModule } from 'src/mongo/mongo.module';
import { AuthModule } from 'src/auth/auth.module';
import { TokenModule } from 'src/token/token.module';
import { ChannelsModule } from 'src/channels/channels.module';
import { UserModule } from 'src/user/user.module';
import { MediaModule } from 'src/media/media.module';

@Module({
  imports: [
    MongoModule,
    AuthModule,
    TokenModule,
    MediaModule,
    ChannelsModule,
    UserModule
  ],
  providers: [MessagesService],
  exports: [MessagesService],
  controllers: [MessagesController]
})
export class MessagesModule {}
