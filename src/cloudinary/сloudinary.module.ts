import { Module } from '@nestjs/common';
import { CloudinaryService } from './сloudinary.service';
import { CloudinaryProvider } from './cloudinary.provider';
import { CompressModule } from 'src/compress/compress.module';

@Module({
  imports: [CompressModule],
  providers: [CloudinaryService, CloudinaryProvider],
  exports: [CloudinaryService]
})
export class CloudinaryModule {}
