import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { TokenModule } from 'src/token/token.module';
import { MongoModule } from 'src/mongo/mongo.module';

@Module({
  imports: [
    TokenModule,
    MongoModule
  ],
  controllers: [ChatsController],
  providers: [ChatsService]
})
export class ChatsModule {}
