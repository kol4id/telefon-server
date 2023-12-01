import { Module } from '@nestjs/common';
import { CloudinaryService } from './сloudinary.service';
import { CloudinaryProvider } from './cloudinary.provider';

@Module({
  providers: [CloudinaryService, CloudinaryProvider]
})
export class CloudinaryModule {}
