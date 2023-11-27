import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { Channel, ChannelSchema } from './schemas/channels.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,  
    MongooseModule.forFeature([{name: Channel.name, schema: ChannelSchema}])
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService]
})
export class ChannelsModule {}
