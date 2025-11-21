import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScoringWorkerModule } from './scoring/scoring.worker.module';
import Joi from 'joi';
import { DatabaseModule } from 'src/databases/db.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),

        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().allow('').optional(),
      }),
    }),
    DatabaseModule,
    ScoringWorkerModule,
  ],
})
export class WorkerModule {}
