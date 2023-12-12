import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import fastifyCookie = require('@fastify/cookie');
import { IoAdapter } from '@nestjs/platform-socket.io';
import { SocketIOAdapter } from './realtime/socket-io-adapter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }))
  app.setGlobalPrefix('api');
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, document);

  app.useWebSocketAdapter(new SocketIOAdapter(app));

  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
    parseOptions: {},     // options for parsing cookies
  });
  await app.register(require('@fastify/multipart'))
  await app.listen(4200);
}
bootstrap();
