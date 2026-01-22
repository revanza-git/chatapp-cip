import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: false
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const additionalOrigins = [
    'http://localhost:3000',
    'http://frontend:3000',
    'http://127.0.0.1:3000',
    'https://chatapp-frontend-production-c45e.up.railway.app'
  ];

  const allowedOrigins = Array.from(new Set([frontendUrl, ...additionalOrigins]));

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization'],
    exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length']
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false
    })
  );

  const port = parseInt(process.env.PORT || '8080', 10);
  await app.listen(port);
  console.log(`🚀 NestJS server running on :${port}`);
}

bootstrap();
