import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './configs/configs.type';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/http/global-exception.filter';
import { LoggerService } from './modules/logger/logger.service';
import { createValidationExceptionFactory } from './common/validation/validation-exception.factory';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const appConfig = configService.get<AppConfig>('app');

    app.useGlobalFilters(new GlobalExceptionFilter(new LoggerService))

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
  const document: OpenAPIObject = SwaggerModule.createDocument(app, config); //Swagger documentation
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

  await app.listen(appConfig.port,appConfig.host,()=>{
    console.log(`Server running on http://${appConfig.host}:${appConfig.port}`);
    console.log(
      `Swagger running at http://localhost:${appConfig.port}/docs`,
    );
  });
}
void bootstrap();
