# 🧑‍💻 Microservice v1 Template

![alpha_ms drawio](https://github.com/gaju91/microservice-v1-template/assets/47264152/0d1af325-6901-4415-9b17-18e2496902cd)

## 📋 Overview

**Microservice v1 Template** is the cornerstone microservice 🏗️ template, Crafted with the power of Nest.js 🪶 and TypeScript ✨, it ensures flawless integration with our database 📚 and other microservices, maintaining a secure 🛡️ and efficient user management ecosystem.

## 🛠️ Tech Stack

- **Nest.js**: A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **TypeScript**: A superset of JavaScript that compiles to clean JavaScript output.

## 🧩 Database Communication Via Plugin

The **Database Plugin** 🗄️ enhances our microservice's capability to interact seamlessly with the database. It abstracts the complexities of direct database operations, providing a streamlined interface for:

- **Entity Management 📁**: Handling data models and relationships.
- **Repository Access 🔍**: Simplifying data access patterns.
- **Transactional Operations 🔄**: Ensuring data integrity during operations.

**Shared Module Plugin**: [Read More Here](https://github.com/gaju91/shared-module-template)

## 🚏 External Communication

### 🌐 HTTP Sync | BaseHttpService Documentation

The `BaseHttpService` is a core utility in our application, designed to streamline the process of making external HTTP requests. Built upon NestJS's `@nestjs/axios` module, it abstracts the complexity of Axios request configurations into a simple, reusable service.

### Features

- **Simplicity**: A single method to handle all types of HTTP requests (GET, POST, PUT, DELETE, etc.).
- **Error Handling**: Centralized error processing, converting Axios errors into NestJS `HttpExceptions`.
- **Flexibility**: Easily adjust request configurations to suit your needs.

### How to Use

1. **Injection**: First, ensure `BaseHttpService` is injectable in your desired service by including it in the `providers` array of your module.

   ```typescript
   // yourmodule.module.ts
   @Module({
     imports: [HttpModule],
     providers: [BaseHttpService],
   })
   export class YourModule {}
   ```

2. **Making Requests**: Utilize the `send` method of `BaseHttpService` to make HTTP requests. The method expects an `AxiosRequestConfig` object.

#### Making a GET Request

To fetch data from an external API:

```typescript
// yourservice.service.ts
async function fetchData() {
  const config: AxiosRequestConfig = {
    method: 'get',
    url: 'https://example.com/data',
  };
  
  try {
    const data = await this.baseHttpService.send(config);
    console.log(data);
  } catch (error) {
    // Handle errors as necessary
    console.error(error);
  }
}
```

#### Posting Data

To send data to an external API:

```typescript
async function postData() {
  const config: AxiosRequestConfig = {
    method: 'post',
    url: 'https://example.com/submit',
    data: { key: 'value' }, // The data to be posted
  };

  try {
    const response = await this.baseHttpService.send(config);
    console.log(response);
  } catch (error) {
    // Error handling
    console.error(error);
  }
}
```

### Error Handling

Errors in `BaseHttpService` are processed to throw `HttpExceptions`, which can then be caught and handled by NestJS's global exception filter or any custom exception filter you've implemented. This ensures a consistent error response structure across your application.

```typescript
catch (error) {
  throw new HttpException('An error occurred', HttpStatus.BAD_GATEWAY);
}
```

### 📚 Queue | Rabbit MQ

As we already did setup the sync communication layer with HTTP for internal communication in microservices.
So here we also have implemented the async communication via Rabbit MQ.
Let's learn more below: 

**Ensure you have RabbitMQ installed and running. For local development, you can easily run RabbitMQ using Docker:**

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

#### 1. **Common Messaging Layer Setup**

Create a generic service `messaging.service.ts` for publishing messages:

```typescript
// src/messaging/messaging.service.ts

import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class MessagingService {
    private client: ClientProxy;

    constructor() {
        this.client = ClientProxyFactory.create({
            transport: Transport.RMQ,
            options: {
                urls: ['amqp://guest:guest@localhost:5672'],
                queue: 'your_queue_name',
                queueOptions: { durable: false },
            },
        });
    }

    async publish(pattern: string, message: any): Promise<void> {
        await this.client.emit(pattern, message).toPromise();
    }
}
```

#### 2. **Configuration in `main.ts`**

Configure your NestJS application to connect to RabbitMQ in `main.ts`:

```typescript
// main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
            urls: ['amqp://guest:guest@localhost:5672'],
            queue: 'your_queue_name',
            queueOptions: { durable: false },
        },
    });

    await app.startAllMicroservicesAsync();
    await app.listen(3000);
}
bootstrap();
```

#### 3. **Registering the Messaging Service in a Module**

Include the `MessagingService` in your module (e.g., `AppModule`):

```typescript
// src/app.module.ts

import { Module } from '@nestjs/common';
import { MessagingService } from './messaging/messaging.service';

@Module({
    providers: [MessagingService],
})
export class AppModule {}
```

#### 4. **Testing: Publishing Messages**

Create a simple controller to publish messages:

```typescript
// src/app.controller.ts

import { Controller, Post } from '@nestjs/common';
import { MessagingService } from './messaging/messaging.service';

@Controller()
export class AppController {
    constructor(private readonly messagingService: MessagingService) {}

    @Post('publish')
    async publishMessage() {
        await this.messagingService.publish('test_pattern', { text: 'Hello RabbitMQ' });
        return { message: 'Message published' };
    }
}
```

#### 5. **Consuming Messages**

Consume messages by subscribing to the same pattern used for publishing:

```typescript
// src/app.controller.ts (or any other service/controller)

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
    // Other methods...

    @MessagePattern('test_pattern')
    async handleMessage(message: any) {
        console.log('Received message:', message);
    }
}
```

## ☃️ Internal Transformer Layers
### 🔄 Interceptor Implementation

The **TransformInterceptor** 💫 is a pivotal component that standardizes response formats:

- **Success Responses ✅**: Wraps all successful responses in a consistent structure, enriching client-side parsing.
- **Meta Information 📊**: Optionally includes pagination and additional metadata when relevant.

**Interceptor Implmentation**: [Checkout Code Here](https://github.com/gaju91/microservice-v1-template/blob/master/src/app/interceptor/response.interceptor.ts)


### 🚨 HTTP Exception Filter

Our **HttpExceptionFilter** 🛡️ customizes error handling across the microservice:

- **Error Formatting 📝**: Converts exceptions into a structured error response, aiding in debugging and user feedback.
- **Status Code Management 🚦**: Ensures appropriate HTTP status codes are returned, reflecting the nature of the error accurately.

**Filter Implmentation**: [Checkout Code Here](https://github.com/gaju91/microservice-v1-template/blob/master/src/app/filters/http-exception.filter.ts)


## 🚀 Getting Started

### Prerequisites

- Node.js and npm installed.

### Installation

1. **Clone the repo**:
   ```bash
   git clone https://github.com/gaju91/microservice-v1-template.git
   ```
2. **Install NPM packages**:
   ```bash
   cd microservice-v1-template
   npm install
   ```

### Running the Application

```bash
npm run start
```

## 🛠 Environment Configuration Service

Our application leverages NestJS's powerful configuration handling to manage environment variables 🌍, ensuring they are loaded, validated, and accessible in a type-safe manner throughout the application. This document outlines how to configure your environment variables and use the configuration service.

### Setting Up Your Environment Variables

1. **Environment Variables Template** 📄: A template of the required environment variables can be found in the `.env.template` file located at the root of the project. This file lists all the necessary environment variables along with a brief description for each. To set up your environment, copy this template to a new file named `.env` in the same directory.

    ```bash
    cp .env.template .env
    ```

2. **Configuring `.env` File** 🖊: Open the `.env` file with your favorite text editor and fill in the values for each environment variable according to your development or production settings.

### Configuration Classes

Environment variables are organized into a configuration class that represent logical sections of the application 🏗. These classes use decorators from `class-validator` 📏 for validation rules, ensuring that your application starts with valid configurations.

```typescript
// in src/common/config/env.validation.ts
import { IsString, IsNumber, IsBoolean } from 'class-validator';

export class Env {
  @IsString()
  NODE_ENV: string;

  @IsNumber()
  PORT: number;

  @IsString()
  APP_NAME: string;

  @IsBoolean()
  APP_DEBUG: boolean;
}
```

### Accessing Configuration

To access the configuration in your services or controllers, inject the `EnvConfigService` 💉 which abstracts the complexity of reading and validating environment variables. This service provides a single point of access for all your configuration needs.

```typescript
import { Injectable } from '@nestjs/common';
import { CustomConfigService } from './config/custom-config.service';

@Injectable()
export class AnyService {
  constructor(private configService: EnvConfigService) {
    console.log(`Application Name: ${this.configService.get('APP_NAME')}`);
  }
}
```

### CustomConfigService Methods
- Inside `src/common/config/envConfig.service.ts`
- `get(key: string)`: Retrieves the value of an environment variable by key 🔑.
- Categorized access methods like `app`, `db`, etc., which return typed configurations for different parts of the application 📦.


Certainly! Here's an enhanced version of the README section for Docker and Docker Compose, now with added emojis to make the guidance more engaging and visually appealing.

## 🐳 Docker and 🐙 Docker Compose Integration

This section outlines how to efficiently set up Docker and Docker Compose for your application, focusing especially on managing private npm packages 📦 and configuring `.npmrc` for authentication with GitHub Packages or other private registries 🔐.

### Docker Setup for Private npm Packages 🛠️

Building applications with dependencies on private npm packages requires Docker to authenticate with the npm registry to download these packages. Achieve this by configuring the `.npmrc` file and securely passing your npm authentication token during the build.

1. **Avoid Hardcoding Tokens**: Never hardcode your npm tokens in your Dockerfile or `.npmrc` 🚫. Instead, use build arguments to pass the token securely at build time.

2. **Dockerfile Configuration**:
    - Utilize an `ARG` for the npm token.
    - Dynamically create an `.npmrc` file during the build using the token.
    - Make sure the `.npmrc` file does not persist in the final image for security reasons 🔒.

Example Dockerfile snippet:
```Dockerfile
// src/Dockerfile
FROM node:20-alpine as builder

# Setup build ARG for NPM token
ARG NPM_AUTH_TOKEN

# 📝 Create .npmrc file dynamically
RUN echo "//npm.pkg.github.com/:_authToken=${NPM_AUTH_TOKEN}" >> .npmrc \
    && echo "@your-namespace:registry=https://npm.pkg.github.com" >> .npmrc

# Continue with your build steps...
```

**Execution Command**
```
docker build --build-arg NPM_AUTH_TOKEN=${NPM_AUTH_TOKEN} -t microservice-v1-template .
```

### Docker Compose for Development and Production 🚀
 Also added a docker comopse to run the conatiner smoothly and easily adding required variable from .env.
 Docker Compose can manage build arguments and runtime environment variables through a `.env` file.

1. **Leveraging `.env` Files**: Keep a `.env` file in the same directory as your `docker-compose.yml`. Docker Compose will automatically pick up the environment variables defined and use them in the service configuration.

2. **docker-compose.yml Configuration**:

- Example `docker-compose.yml`:
```yaml
// src/docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NPM_AUTH_TOKEN: ${NPM_AUTH_TOKEN}
    ports:
      - "3000:3000"
```

**Execution Command**
```
docker-compose up    -> For runnig container
docker-compose down  -> For dropping container
```

## 📚 Swagger Documentation in Microservice

In the Microservice, we've integrated Swagger to provide detailed and interactive API documentation. This helps developers and API consumers understand, test, and work with our API more efficiently. Here’s how we approach documentation, focusing on success and error responses.

### 🌟 Accessing Swagger UI

To explore our API documentation, navigate to:

```
http://localhost:3000/api
```

Make sure to replace `3000` with your service's port if it's different.

### 🛠 Custom Success Responses

Each API route defines its success response schema directly using the `@ApiResponse` decorator. This allows us to document the specific structure of the successful response for that endpoint, ensuring clarity and accuracy.

**Example: Defining a Custom Success Response**

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller('test')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiResponse({
    status: 200,
    description: 'A successful response',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        data: { type: 'string', example: 'Hello World' },
        meta: { type: 'object', example: {} },
      },
    },
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

### 🔒 Common ErrorResponse

For error handling, we leverage a common `IErrorResponse` interface across our services. In our Swagger documentation, we reference a generic error response schema for consistency and to provide clear guidance on error formats.

**Snippet: Common Error Response Interface**

```typescript
export interface IErrorResponse {
  statusCode: number;
  error: {
    code: number;
    urlPath: string;
    timestamp: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}
```

### ✨ Highlights

- **Interactive API Testing**: With Swagger UI, you can send requests to your API endpoints directly from the documentation, providing a hands-on experience.
- **Clear Endpoint Documentation**: Detailed documentation for each endpoint, including request parameters, request body schema, and response schemas.
- **Consistent Error Handling**: Utilization of a common error response format across endpoints, simplifying error handling and improving the consumer experience.
