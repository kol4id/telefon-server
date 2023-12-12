import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { MongoUserService } from './mongo-user.service';
import { MongoChannelService } from './mongo-channel.service';
import { Channel, ChannelSchema } from './shemas/channel.schema';
import { Message, MessageSchema } from './shemas/message.schema';
import { MongoParser } from 'src/mongo/mongoObjectParser';
import { MongoMessageService } from './mongo-message.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: User.name, schema: UserSchema},
            {name: Channel.name, schema: ChannelSchema}, 
            {name: Message.name, schema: MessageSchema}
        ]),
    ],
    providers: [MongoUserService, MongoChannelService, MongoMessageService, MongoParser],
    exports: [MongoUserService, MongoChannelService, MongoMessageService, MongoParser],
})
export class MongoModule {}
