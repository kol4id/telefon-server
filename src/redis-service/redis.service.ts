import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}
    
    async set(key: string, value: string | Buffer | number): Promise<any>{
        return this.redisClient.set(key, value);
    }

    async setTwoWay(key: string, value: string | Buffer | number): Promise<any>{
        const result = Promise.all([
            this.redisClient.set(key, value),
            this.redisClient.set(String(value), key)]);
        if (result[0] && result[1]) return true;
    }

    async get(key: string): Promise<string>{
        return this.redisClient.get(key);
    }

    async del(...args: [...keys: string[]]): Promise<number>{
        return this.redisClient.del(...args);
    }

    async getMany(...args: [...keys: string[]]): Promise<string[]>{
        return this.redisClient.mget(...args);
    }
}
