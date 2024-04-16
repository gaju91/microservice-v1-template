import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import { EnvironmentVariables } from './env.validation';

@Injectable()
export class EnvConfigService {
    private readonly logger = new Logger(EnvConfigService.name);
    private readonly envConfig: EnvironmentVariables;

    constructor(private configService: ConfigService) {
        this.envConfig = this.validateEnvConfig();
    }

    get(key: keyof EnvironmentVariables): any {
        return this.envConfig[key];
    }

    get app(){
        return {
            env: this.get('NODE_ENV') as string,
            port: this.get('PORT') as number,
            name: this.get('APP_NAME') as string,
            apiPrefix: this.get('APP_API_PREFIX') as string,
            debug: this.get('APP_DEBUG') as boolean
        }
    }

    get jwt(){
        return {
            secret: this.get('JWT_SECRET') as string,
            expiresIn: this.get('JWT_EXPIRES_IN') as string
        }
    }

    get db() {
        return {
            host: this.get('DB_HOST') as string,
            port: this.get('DB_PORT') as number,
            username: this.get('DB_USER') as string,
            password: this.get('DB_PASSWORD') as string,
            database: this.get('DB_NAME') as string
        }
    }

    get rabbitmq() {
        return {
            host: this.get('RABBITMQ_HOST') as string,
            port: this.get('RABBITMQ_PORT') as number,
            username: this.get('RABBITMQ_USERNAME') as string,
            password: this.get('RABBITMQ_PASSWORD') as string,
            queue: this.get('RABBITMQ_QUEUE') as string
        }
    }

    get microservices() {
        return {
            health: {
                host: this.get('HEALTH_SERVICE_BASE_URL') as string,
                port: this.get('HEALTH_SERVICE_API_PREFIX') as string
            }
        }
    }

    private validateEnvConfig(): EnvironmentVariables {
        const envConfig = plainToInstance(
            EnvironmentVariables, 
            process.env, { enableImplicitConversion: true }
        );

        const errors = validateSync(envConfig, { skipMissingProperties: false });
        if (errors.length > 0) {
            const errorsForLog = this.formatErrors(errors);
            this.logger.error(`Environment validation errors: ${errorsForLog}`);
            throw new Error('Environment validation error');
        }

        return envConfig;
    }

    private formatErrors(errors: ValidationError[]): string {
        return errors
            .map(error => {
                if (error.constraints) {
                    return Object.values(error.constraints).join('. ');
                }
                return `${error.property} validation error`;
            })
            .join(', ');
    }
}
