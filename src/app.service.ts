import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { BaseHttpService } from './common/base-http.service';
import { MessagingService } from './common/messaging.service';
@Injectable()
export class AppService {
  constructor(
    private readonly baseHttpService: BaseHttpService,
    private readonly messagingService: MessagingService,
  ) { }

  getHello(): string {
    return 'Hello World!';
  }

  async getTestExternal() {
    return this.baseHttpService.send({
      url: 'TEST_EXTERNAL_URL',
      method: 'TEST_EXTERNAL_METHOD',
    } as AxiosRequestConfig);
  }

  async testMessageQueue() {
    return await this.messagingService.publish('hello', { message: 'Hello World!' });
  }

}
