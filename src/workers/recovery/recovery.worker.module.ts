import { Module } from '@nestjs/common';
import { RecoveryWorkerService } from './recovery.worker.service';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreJob } from 'src/databases/entities/score-job.entity';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'ScoreJobQueue' }),
    TypeOrmModule.forFeature([ScoreJob]),
  ],
  providers: [RecoveryWorkerService],
  exports: [RecoveryWorkerService],
})
export class RecoveryWorkerModule {}
