import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import {
  ScoreJob,
  ScoreJobStatus,
} from 'src/databases/entities/score-job.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RecoveryWorkerService {
  private readonly logger = new Logger(RecoveryWorkerService.name);
  constructor(
    @InjectQueue('ScoreJobQueue')
    private scoreJobQueue: Queue,

    @InjectRepository(ScoreJob)
    private scoreJobRepo: Repository<ScoreJob>,
  ) {}

  async recoverJobs() {
    try {
      this.logger.log('Starting job recovery process...');

      const pending = await this.scoreJobRepo.find({
        select: ['id', 'submissionId'],
        where: { status: ScoreJobStatus.QUEUED },
      });

      for (const { id, submissionId } of pending) {
        await this.scoreJobQueue.add(
          'scoreJobHandler',
          {
            jobId: id,
            submissionId: submissionId,
          },
          { jobId: id, attempts: 3, backoff: { type: 'fixed', delay: 5000 } },
        );
      }

      this.logger.log('Job recovery process completed.');
    } catch (error) {
      this.logger.error('Error during job recovery:', error);
    }
  }
}
