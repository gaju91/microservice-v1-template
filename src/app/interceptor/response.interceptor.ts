import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ISuccessResponse } from './../interfaces/response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ISuccessResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ISuccessResponse<T>> {
    return next.handle().pipe(
      map(data => {
        const { meta, ...rest } = data as any;
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          data: rest,
          meta: typeof data === 'object'
            ? data['meta']
            : undefined,
        }
      })
    );
  }
}
