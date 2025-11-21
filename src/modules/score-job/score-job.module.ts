import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreJobsController } from 'src/controllers/score-job.controller';
import { ScoreJob } from 'src/databases/entities/score-job.entity';
import { ScoreJobService } from './score-job.service';
import { BullModule } from '@nestjs/bullmq';
import { Submission } from 'src/databases/entities/submission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScoreJob, Submission]),
    BullModule.registerQueue({
      name: 'ScoreJobQueue',
    }),
  ],
  controllers: [ScoreJobsController],
  providers: [ScoreJobService],
  exports: [ScoreJobService],
})
export class ScoreJobModule {}
