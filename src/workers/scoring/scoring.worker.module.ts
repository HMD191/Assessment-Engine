import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ScoreJob } from 'src/databases/entities/score-job.entity';
import { ScoringWorkerService } from './scoring.worker.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScoreJob]),
    BullModule.registerQueue({ name: 'ScoreJobQueue' }),
  ],
  providers: [ScoringWorkerService],
})
export class ScoringWorkerModule {}
