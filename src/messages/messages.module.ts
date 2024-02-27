import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MongoModule } from 'src/mongo/mongo.module';
import { AuthModule } from 'src/auth/auth.module';
import { TokenModule } from 'src/token/token.module';
import { CloudinaryModule } from 'src/cloudinary/сloudinary.module';
import { RealtimeModule } from 'src/realtime/realtime.module';

@Module({
  imports: [
    MongoModule,
    AuthModule,
    TokenModule,
    CloudinaryModule,
    RealtimeModule
  ],
  providers: [MessagesService],
  controllers: [MessagesController]
})
export class MessagesModule {}
