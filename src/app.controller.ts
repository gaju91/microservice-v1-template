import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';
import { ApiAcceptedResponse, ApiResponse } from '@nestjs/swagger';

@Controller('test')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @ApiResponse({
    status: 200,
    description: 'A successful response',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        data: {
          type: 'string', 
          example: 'Hello World'
        },
        meta: {
          type: 'object',
          example: {}
        },
      },
      required: ['statusCode', 'data'],
    },
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-microservice-communication')
  async getExternalData() {
    return this.appService.getTestExternal();
  }

  /**
   * Tests the message queue.
   * @returns {Promise<any>} The message queue test result.
   */
  @Get('test-message-queue')
  async testMessageQueue() {
    return this.appService.testMessageQueue();
  }

  /**
   * Handles the test message queue.
   * @param {any} data The data to handle.
   */
  @MessagePattern('hello')
  async testMessageQueueHandler(data: any) {
    console.log(data);
  }
}
