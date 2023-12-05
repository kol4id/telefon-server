import { Module } from '@nestjs/common';
import { TrainiController } from './traini.controller';
import { MongoModule } from 'src/mongo/mongo.module';

@Module({
  imports: [MongoModule],
  controllers: [TrainiController]
})
export class TrainiModule {}
