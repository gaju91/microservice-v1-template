import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BaseHttpService {
  constructor(private httpService: HttpService) {}

  async send<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await firstValueFrom(this.httpService.request<T>(config));
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: AxiosError): never {
    if (error.response) {
      throw new HttpException(error.response.data, error.response.status);
    } else if (error.request) {
      throw new HttpException('No response received', HttpStatus.GATEWAY_TIMEOUT);
    } else {
      throw new HttpException('Error setting up request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
