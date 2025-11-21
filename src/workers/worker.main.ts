import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { RecoveryWorkerService } from './recovery/recovery.worker.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('WorkerBootstrap');
  const app = await NestFactory.createApplicationContext(WorkerModule);

  const recovery = app.get(RecoveryWorkerService);
  try {
    await recovery.recoverJobs();
    logger.log('Job recovery finished successfully');
  } catch (error) {
    logger.error('Error during job recovery', error.stack);
  }

  logger.log('Worker is running...');
}
bootstrap();
