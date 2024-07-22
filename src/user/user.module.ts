import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongoModule } from 'src/mongo/mongo.module';
import { AuthModule } from 'src/auth/auth.module';
import { TokenModule } from 'src/token/token.module';
import { CloudinaryModule } from 'src/cloudinary/сloudinary.module';
import { MediaModule } from 'src/media/media.module';

@Module({
  imports: [
    MongoModule,
    AuthModule,
    TokenModule,
    MediaModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
