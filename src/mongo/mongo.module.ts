import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { MongoUserService } from './mongo-user.service';
import { MongoChannelService } from './mongo-channel.service';
import { Channel, ChannelSchema } from './shemas/channels.schema';

@Module({
    imports: [MongooseModule.forFeature([{name: User.name, schema: UserSchema}, {name: Channel.name, schema: ChannelSchema}])],
    providers: [MongoUserService, MongoChannelService],
    exports: [MongoUserService, MongoChannelService],
})
export class MongoModule {}
