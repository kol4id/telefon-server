import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { Channel, ChannelSchema } from './schemas/channels.schema';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/сloudinary.module';
import { CloudinaryService } from 'src/cloudinary/сloudinary.service';
import { CompressModule } from 'src/compress/compress.module';
import { TokenModule } from 'src/token/token.module';
import { MongoModule } from 'src/mongo/mongo.module';

@Module({
  imports: [
    AuthModule,  
    CloudinaryModule,
    CompressModule,
    TokenModule,
    MongoModule
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService]
})
export class ChannelsModule {}
