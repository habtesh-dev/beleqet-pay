import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { AppModule } from './app.module';
import { rawBodyMiddleware } from './common/middleware/raw-body.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Webhook routes need the exact raw byte buffer to verify HMAC signatures,
  // so this middleware runs BEFORE the JSON body parser.
  app.use(rawBodyMiddleware);
  app.use(json());

  app.enableCors({ origin: process.env.DASHBOARD_ORIGIN ?? '*' });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[beleqet-pay-api] listening on :${port}`);
}

bootstrap();
