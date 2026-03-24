import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private client: RedisClientType;
    private isConnected = false;

    constructor(private configService: ConfigService) {
        this.initializeRedis();
    }

    private async initializeRedis() {
        try {
            const redisUrl = this.configService.get<string>('REDIS_URL');

            if (!redisUrl) {
                this.logger.warn('Redis URL not configured. Caching will be disabled.');
                return;
            }

            this.client = createClient({
                url: redisUrl,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            this.logger.error('Max reconnection attempts reached');
                            return new Error('Max reconnection attempts reached');
                        }
                        return Math.min(retries * 100, 3000);
                    },
                },
            });

            this.client.on('error', (err) => {
                this.logger.error('Redis Client Error:', err);
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                this.logger.log('Redis client connecting...');
            });

            this.client.on('ready', () => {
                this.logger.log('Redis client connected and ready');
                this.isConnected = true;
            });

            this.client.on('reconnecting', () => {
                this.logger.warn('Redis client reconnecting...');
            });

            await this.client.connect();
        } catch (error) {
            this.logger.error('Failed to initialize Redis:', error);
            this.isConnected = false;
        }
    }

    async get<T>(key: string): Promise<T | null> {
        if (!this.isConnected) {
            return null;
        }

        try {
            const data = await this.client.get(key);
            if (!data) {
                return null;
            }
            return JSON.parse(data) as T;
        } catch (error) {
            this.logger.error(`Error getting key ${key}:`, error);
            return null;
        }
    }

    async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
        } catch (error) {
            this.logger.error(`Error setting key ${key}:`, error);
        }
    }

    async del(key: string): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            await this.client.del(key);
        } catch (error) {
            this.logger.error(`Error deleting key ${key}:`, error);
        }
    }

    async delPattern(pattern: string): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
            }
        } catch (error) {
            this.logger.error(`Error deleting pattern ${pattern}:`, error);
        }
    }

    async exists(key: string): Promise<boolean> {
        if (!this.isConnected) {
            return false;
        }

        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            this.logger.error(`Error checking existence of key ${key}:`, error);
            return false;
        }
    }

    async onModuleDestroy() {
        if (this.isConnected && this.client) {
            await this.client.quit();
            this.logger.log('Redis client disconnected');
        }
    }

    isReady(): boolean {
        return this.isConnected;
    }
}
