export interface ISuccessResponse<T> {
    statusCode: number;
    data: T;
    meta?: {
        page?: number;
        pageSize?: number;
        totalPages?: number;
        totalResults?: number;
    };
}

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
        debug?: {
            stack: string;
        };
    };
}
