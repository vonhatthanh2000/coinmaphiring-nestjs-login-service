import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SetupSwagger } from '@config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  SetupSwagger(app);

  app.enableCors({
    origin: 'http://localhost:3000',
  });

  await app.listen(3001);
}
bootstrap();
