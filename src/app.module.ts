import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChannelsModule } from './channels/channels.module';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/сloudinary.module';
import { CompressModule } from './compress/compress.module';
import { MongoModule } from './mongo/mongo.module';
import { TrainiModule } from './traini/traini.module';
import { TokenModule } from './token/token.module';
import { RealtimeModule } from './realtime/realtime.module';
import { MessagesModule } from './messages/messages.module';
import { UserModule } from './user/user.module';
import { UpdatesModule } from './updates/updates.module';
import { MediaModule } from './media/media.module';
import { LoggerModule } from './logger/logger.module';
import { ChatsModule } from './chats/chats.module';
import { RedisModule } from './redis-service/redis.module';


@Module({
  imports: [ 
    ChannelsModule,
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_LOCAL), 
    CloudinaryModule,
    CompressModule,
    MongoModule,
    TrainiModule,
    TokenModule,
    RealtimeModule,
    MessagesModule,
    UserModule,
    UpdatesModule,
    MediaModule,
    LoggerModule,
    ChatsModule,
    RedisModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
// process.env.IS_DOCKER ? process.env.DB_DOCKER : process.env.DB_LOCAL