import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import {
  ScoreJob,
  ScoreJobStatus,
} from 'src/databases/entities/score-job.entity';
import { ScoreDto } from 'src/dtos/score-job.dto';
import { Repository } from 'typeorm';

const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '2', 10);
@Processor('ScoreJobQueue', { concurrency: WORKER_CONCURRENCY })
export class ScoringWorkerService extends WorkerHost {
  private readonly logger = new Logger(ScoringWorkerService.name);

  constructor(
    @InjectRepository(ScoreJob)
    private scoreJobRepo: Repository<ScoreJob>,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case 'scoreJobHandler':
        await this.scoreJobHandler(job);
        break;
      default:
        this.logger.warn('Unknown job name:', job.name);
        return;
    }
  }

  private async scoreJobHandler(job: Job) {
    const { jobId, submissionId } = job.data;

    const record = await this.scoreJobRepo.findOne({
      select: ['id', 'data'],
      where: { id: jobId },
    });
    if (!record) {
      this.logger.error(`ScoreJob with id ${jobId} not found`);
      return;
    }

    try {
      this.logger.log(`Scoring submission ${submissionId} for job ${jobId}`);
      await this.scoreJobRepo.update(jobId, { status: ScoreJobStatus.RUNNING });

      const dataForScoring = record.data;

      this.logger.log('-----------SCORING LOGIC START-----------');
      this.logger.log('Do something with data:', dataForScoring);

      const { score, feedback } = await this.getScore(dataForScoring);

      this.logger.log('-----------SCORING LOGIC END-----------');

      await this.scoreJobRepo.update(jobId, {
        status: ScoreJobStatus.DONE,
        score,
        feedback,
      });

      this.logger.log(`Scoring completed for job ${jobId}: score=${score}`);
    } catch (err) {
      this.logger.error(`Error scoring job ${jobId}:`, err);
      await this.scoreJobRepo.update(jobId, {
        status: ScoreJobStatus.ERROR,
        errorMessage: err.message,
      });
    }
  }

  // fake scoring function
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async getScore(data: any): Promise<ScoreDto> {
    const timeoutMs = 60000;

    await new Promise((resolve) => setTimeout(resolve, timeoutMs));
    const score = Math.random() * 100;
    const feedback = `fake feedback.`;

    return { score, feedback };
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Job ${job.id} is now active; data:`, job.data);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} has completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.log(`Job ${job.id} has failed with error:`, err);
  }
}
