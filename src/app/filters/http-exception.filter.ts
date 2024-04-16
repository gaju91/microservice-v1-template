import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { IErrorResponse } from './../interfaces/response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const errorResponse: IErrorResponse = {
            statusCode: status,
            error: {
                code: status,
                urlPath: request.url,
                timestamp: new Date().toISOString(),
                message: exception.response?.message || exception.message || 'Unexpected error occurred',
                details: exception.response?.error || [],
                debug: process.env.NODE_ENV === 'development' ? { stack: exception.stack } : undefined,
            },
        };

        response.status(status).json(errorResponse);
    }
}
