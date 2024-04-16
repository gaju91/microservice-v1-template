// src/messaging/messaging.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { EnvConfigService } from './config/envConfig.service';

@Injectable()
export class MessagingService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(MessagingService.name);
    private client: any;

    constructor(
        readonly envConfigService: EnvConfigService
    ) {
        this.client = envConfigService.app.env === 'local'
            ? ClientProxyFactory.create({
                transport: Transport.RMQ,
                options: {
                    urls: [`amqp://${envConfigService.rabbitmq.host}:${envConfigService.rabbitmq.port}`],
                    queue: envConfigService.rabbitmq.queue,
                    queueOptions: {
                        durable: false,
                    },
                },
            })
            : {
                emit: async () => { },
                connect: async () => { },
                close: async () => { },
            }
    }

    async onModuleInit() {
        try {
            await this.client.connect();
            this.logger.log('Connected to the message queue.');
        }
        catch (e) {
            this.logger.error(e);
        }
    }

    onModuleDestroy() {
        this.client.close();
    }

    async publish(pattern: string, data: any): Promise<void> {
        await firstValueFrom(this.client.emit(pattern, data));
    }
}
