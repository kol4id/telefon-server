import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [{
    provide: 'REDIS_CLIENT',
    useFactory: () => new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    }),
  },
  RedisService],
  exports:[RedisService]
})
export class RedisModule {}
