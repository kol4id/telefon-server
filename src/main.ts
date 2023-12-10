import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import fastifyCookie = require('@fastify/cookie');
import { IoAdapter } from '@nestjs/platform-socket.io';
import { SocketIOAdapter } from './realtime/socket-io-adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  app.useGlobalPipes(new ValidationPipe())
  app.setGlobalPrefix('api');
  app.enableCors();

  app.useWebSocketAdapter(new SocketIOAdapter(app));

  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
    parseOptions: {},     // options for parsing cookies
  });
  await app.register(require('@fastify/multipart'))
  await app.listen(4200);
}
bootstrap();
