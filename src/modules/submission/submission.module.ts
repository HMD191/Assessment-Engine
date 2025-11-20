import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { SubmissionController } from 'src/controllers/submission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from 'src/databases/entities/submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Submission])],
  controllers: [SubmissionController],
  exports: [SubmissionService],
  providers: [SubmissionService],
})
export class SubmissionModule {}
