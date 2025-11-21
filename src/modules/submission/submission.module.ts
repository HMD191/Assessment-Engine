import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { SubmissionController } from 'src/controllers/submission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from 'src/databases/entities/submission.entity';
import { ScoreJob } from 'src/databases/entities/score-job.entity';
import { ScoreJobModule } from '../score-job/score-job.module';

@Module({
  imports: [TypeOrmModule.forFeature([Submission, ScoreJob]), ScoreJobModule],
  controllers: [SubmissionController],
  exports: [SubmissionService],
  providers: [SubmissionService],
})
export class SubmissionModule {}
