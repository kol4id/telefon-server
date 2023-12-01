import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChannelsModule } from './channels/channels.module';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/сloudinary.module';
import { CompressModule } from './compress/compress.module';

@Module({
  imports: [ 
    ChannelsModule,
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.db_URI),
    CloudinaryModule,
    CompressModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
