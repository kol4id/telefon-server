import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { CloudinaryModule } from 'src/cloudinary/сloudinary.module';
import { CompressModule } from 'src/compress/compress.module';

@Module({
  imports: [
    CloudinaryModule,
    CompressModule
  ],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
