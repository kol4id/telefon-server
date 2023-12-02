import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { Channel, ChannelSchema } from './schemas/channels.schema';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/сloudinary.module';
import { CloudinaryService } from 'src/cloudinary/сloudinary.service';
import { CompressService } from 'src/compress/compress.service';
import { ParseObjectPipe } from './pipes/parse-object.pipe';


@Module({
  imports: [
    AuthModule,  
    CloudinaryModule,
    MongooseModule.forFeature([{name: Channel.name, schema: ChannelSchema}])
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService, CloudinaryService, CompressService, ParseObjectPipe]
})
export class ChannelsModule {}
