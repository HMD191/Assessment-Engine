import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { RecoveryWorkerService } from './recovery/recovery.worker.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);

  const recovery = app.get(RecoveryWorkerService);
  await recovery.recoverJobs();

  console.log('Worker is running...');
}
bootstrap();
