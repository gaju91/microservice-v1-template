import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class MetaData {
  @ApiProperty({ example: 1, required: false})
  page?: number;

  @ApiProperty({ example: 10, required: false})
  pageSize?: number;

  @ApiProperty({ example: 5, required: false})
  totalPages?: number;

  @ApiProperty({ example: 50, required: false})
  totalResults?: number;
}

export class SuccessResponse<T> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({
    type: 'object | array | string | number | boolean | null',
    examples: [
      { id: 1, username: 'test' },
      [{ id: 1, username: 'test' }],
      'Hello World!',
      1,
      true,
      null,
    ],
  })
  data: T;

  @ApiProperty({ type: MetaData, required: false})
  @IsOptional()
  meta?: MetaData;
}

class ErrorDetail {
  @ApiProperty({ example: 'username' })
  field: string;

  @ApiProperty({ example: 'Username is required.' })
  message: string;
}

class Error {
  @ApiProperty({ example: 404 })
  code: number;

  @ApiProperty({ example: '/docs/error/404' })
  urlPath: string;

  @ApiProperty({ example: '2021-01-01T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 'Resource not found' })
  message: string;

  @ApiProperty({ type: ErrorDetail, required: false })
  @IsOptional()
  details?: ErrorDetail[];

  @ApiProperty({ example: 'stacktrace' })
  stack: string;

}

export class ValidationError {
  @ApiProperty({ example: 422 })
  statusCode: number;

  @ApiProperty({
    type: Error,
    example: {
      code: 422,
      urlPath: '/examples',
      timestamp: '2021-01-01T00:00:00.000Z',
      message: 'Validation failed',
      details: [{ field: 'username', message: 'Username is required.' }],
      debug: { stack: 'stacktrace' },
    },
  })
  error: Error
}

export class InternalServerError {
  @ApiProperty({ example: 500 })
  statusCode: number;

  @ApiProperty({
    type: Error,
    example: {
      code: 500,
      urlPath: '/examples',
      timestamp: '2021-01-01T00:00:00.000Z',
      message: 'Internal server error',
      debug: { stack: 'stacktrace' },
    },
  })
  error: Error
}
