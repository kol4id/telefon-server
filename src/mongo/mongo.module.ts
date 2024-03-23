import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { UserRepository } from './mongo-user.service';
import { ChannelRepository } from './mongo-channel.service';
import { Channel, ChannelSchema } from './shemas/channel.schema';
import { Message, MessageSchema } from './shemas/message.schema';
import { MongoParser } from 'src/mongo/mongoObjectParser';
import { MessageRepository } from './mongo-message.service';
import { LastRead, LastReadSchema } from './shemas/lastRead.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: User.name, schema: UserSchema},
            {name: Channel.name, schema: ChannelSchema}, 
            {name: Message.name, schema: MessageSchema},
            {name: LastRead.name, schema: LastReadSchema}
        ]),
    ],
    providers: [UserRepository, ChannelRepository, MessageRepository, MongoParser],
    exports: [UserRepository, ChannelRepository, MessageRepository, MongoParser],
})
export class MongoModule {}
