import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MongoModule } from 'src/mongo/mongo.module';
import { AuthModule } from 'src/auth/auth.module';
import { TokenService } from 'src/token/token.service';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [
    MongoModule,
    AuthModule,
    TokenModule
  ],
  providers: [MessagesService],
  controllers: [MessagesController]
})
export class MessagesModule {}
