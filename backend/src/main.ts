import * as dotenv from 'dotenv';
dotenv.config();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.enableCors({
    origin: frontendOrigin,
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Collaborative note board API')
    .setDescription('API documentation for the backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');

  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    console.log(
      `==> Firebase Auth Emulator enabled at http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`,
    );
  }

  console.log(`==> CORS enabled for ${frontendOrigin}`);
  console.log(`==> Server running on http://localhost:${port}`);
  console.log(`==> Swagger available at http://localhost:${port}/api`);
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
