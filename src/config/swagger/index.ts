import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SetupSwagger = (app: INestApplication): void => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Login API')
    .setDescription('Login API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, document);
};
