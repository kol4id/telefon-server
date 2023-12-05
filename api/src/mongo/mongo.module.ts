import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { MongoUserService } from './mongo-user.service';
import { MongoChannelService } from './mongo-channel.service';

@Module({
    imports: [MongooseModule.forFeature([{name: User.name, schema: UserSchema}])],
    providers: [MongoUserService, MongoChannelService],
    exports: [MongoUserService, MongoChannelService],
})
export class MongoModule {}
