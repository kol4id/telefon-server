import { Module } from '@nestjs/common';
import { CompressService } from './compress.service';

@Module({
  providers: [CompressService]
})
export class CompressModule {}
