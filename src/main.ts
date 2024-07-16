import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  // 允许来自 http://localhost:3000 的请求

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true, // 允许发送 Cookie
  });
  await app.listen(7000);
}
bootstrap();
