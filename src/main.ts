import { NestFactory } from '@nestjs/core';
import { Get, ValidationPipe } from '@nestjs/common'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import fastifyCookie = require('@fastify/cookie');
import * as fastifyMulter from '@fastify/multipart'
import { SocketIOAdapter } from './realtime/socket-io-adapter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { METHODS } from 'http';
import pino from 'pino';
import pinoPretty from 'pino-pretty';
import { Logger } from './logger/logger.service';



async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }))

  app.enableCors({
    preflightContinue: true,
    credentials: true,
    origin: '*',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  });


// [process.env.FRONTEND_URL_PROD, process.env.FRONTEND_URL_DEV, `${process.env.FRONTEND_URL_DEV}/`]
  const config = new DocumentBuilder()
    .setTitle('telefon example')
    .setDescription('The telefon API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('', app, document);

  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
    parseOptions: {},     // options for parsing cookies
  });

  await app.register(fastifyMulter, {
    limits:{
      fileSize: 10_485_760,
      files: 10,
    }
  })

  app.useWebSocketAdapter(new SocketIOAdapter(app));
  await app.listen(4200, '0.0.0.0');
}
bootstrap();
