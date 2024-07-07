import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/http/global-exception.filter';
import { createValidationExceptionFactory } from './common/validation/validation-exception.factory';
import { AppConfig } from './configs/configs.type';
import { CronService } from './modules/cron/services/cron.service';
import { LoggerService } from './modules/logger/services/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');

  const cronService = app.get(CronService);
  await cronService.fetchExchangeRate();

  app.useGlobalFilters(new GlobalExceptionFilter(new LoggerService()));

  const config = new DocumentBuilder()
    .setTitle('Autoria Clone')
    .setDescription('The API documentation for a website for the sale of cars.')
    .setVersion('0.1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    })
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 2,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: createValidationExceptionFactory(),
    }),
  );

  await app.listen(appConfig.port, appConfig.host, () => {
    console.log(`Server running on http://${appConfig.host}:${appConfig.port}`);
    console.log(`Swagger running at http://localhost:${appConfig.port}/docs`);
  });
}
void bootstrap();
