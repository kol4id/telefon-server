import { Module } from '@nestjs/common';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/сloudinary.module';
import { CompressModule } from 'src/compress/compress.module';
import { TokenModule } from 'src/token/token.module';
import { MongoModule } from 'src/mongo/mongo.module';
import { UserModule } from 'src/user/user.module';
import { MediaModule } from 'src/media/media.module';

@Module({
  imports: [
    AuthModule,  
    MediaModule,
    CompressModule,
    TokenModule,
    MongoModule,
    UserModule
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService],
  exports: [ChannelsService]
})
export class ChannelsModule {}
