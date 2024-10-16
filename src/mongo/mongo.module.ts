import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './shemas/user.schema';
import { UserRepository } from './mongo-user.service';
import { ChannelRepository } from './mongo-channel.service';
import { Channel, ChannelSchema } from './shemas/channel.schema';
import { Message, MessageSchema } from './shemas/message.schema';
import { MongoParser } from 'src/mongo/mongoObjectParser';
import { MessageRepository } from './mongo-message.service';
import { ChatRepository } from './mongo-chat.service';
import { Chat, ChatSchema } from './shemas/chat.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: User.name, schema: UserSchema},
            {name: Channel.name, schema: ChannelSchema},
            {name: Chat.name, schema: ChatSchema}, 
            {name: Message.name, schema: MessageSchema},
        ]),
    ],
    providers: [UserRepository, ChannelRepository, ChatRepository, MessageRepository, MongoParser],
    exports: [UserRepository, ChannelRepository, ChatRepository, MessageRepository, MongoParser],
})
export class MongoModule {}
