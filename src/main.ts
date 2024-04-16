import { NestFactory } from '@nestjs/core';
import { DatabaseModule } from '@yournamespace/shared-module-template'
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { AppModule } from './app.module';
import { TransformInterceptor } from './app/interceptor/response.interceptor';
import { HttpExceptionFilter } from './app/filters/http-exception.filter';
import { EnvConfigService } from './common/config/envConfig.service';
import { SuccessResponse, ValidationError, InternalServerError } from './common/dto/response.dto';

(async function () {

  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const configService = app.get(EnvConfigService);

  // Holding this till we setup the database and rabbitmq in services
  if (configService.app.env === 'local') {
    DatabaseModule.initialize({
      type: 'postgres',
      ...configService.db,
    });

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${configService.rabbitmq.host}:${configService.rabbitmq.port}`],
        queue: configService.rabbitmq.queue,
        queueOptions: {
          durable: false
        },
      },
    });
  
    await app.startAllMicroservices();
  }

  app.setGlobalPrefix(configService.app.apiPrefix);

  const config = new DocumentBuilder()
    .setTitle('🙋‍♂️⚙️ Microservice API Docs')
    .setDescription(
  `🚀 **Welcome to the Microservice Project API Documentation!**
      This API is the backbone of the Microservice project, designed to provide a secure and efficient 
      Dive into our detailed documentation for insights on integrating with our endpoints!`
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [
      SuccessResponse,
      ValidationError,
      InternalServerError
    ],
  });


  const theme = new SwaggerTheme();
  SwaggerModule.setup('api', app, document, { explorer: true, customCss: theme.getBuffer(SwaggerThemeNameEnum.NORD_DARK) });

  // save documentation to file
  await app.listen(configService.app.port);
}());