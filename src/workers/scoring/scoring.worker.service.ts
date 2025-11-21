import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import {
  ScoreJob,
  ScoreJobStatus,
} from 'src/databases/entities/score-job.entity';
import { ScoreDto } from 'src/dtos/score-job.dto';
import { Repository } from 'typeorm';

@Processor('ScoreJobQueue', { concurrency: 1 })
export class ScoringWorkerService extends WorkerHost {
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
        console.warn('Unknown job name:', job.name);
        return;
    }
  }

  async scoreJobHandler(job: Job) {
    const { jobId, submissionId } = job.data;

    const record = await this.scoreJobRepo.findOne({
      where: { id: jobId },
    });
    if (!record) {
      console.error(`ScoreJob with id ${jobId} not found`);
      return;
    }

    try {
      console.log(`Scoring submission ${submissionId} for job ${jobId}`);
      await this.scoreJobRepo.update(jobId, { status: ScoreJobStatus.RUNNING });

      //what if server restarts here? job should be re-queued and re-processed

      const dataForScoring = record.data;

      console.log('-----------SCORING LOGIC START-----------');
      console.log('Do something with data:', dataForScoring);

      const { score, feedback } = await this.getScore(dataForScoring);

      console.log('-----------SCORING LOGIC END-----------');

      await this.scoreJobRepo.update(jobId, {
        status: ScoreJobStatus.DONE,
        score,
        feedback,
      });

      console.log(`Scoring completed for job ${jobId}: score=${score}`);
    } catch (err) {
      console.error(`Error scoring job ${jobId}:`, err);
      await this.scoreJobRepo.update(jobId, {
        status: ScoreJobStatus.ERROR,
        errorMessage: err.message,
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getScore(data: any): Promise<ScoreDto> {
    const timeoutMs = 60000;

    await new Promise((resolve) => setTimeout(resolve, timeoutMs));
    const score = Math.random() * 100;
    const feedback = `fake feedback.`;

    return { score, feedback };
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    console.log(`Job ${job.id} is now active; data:`, job.data);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`Job ${job.id} has completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    console.log(`Job ${job.id} has failed with error:`, err);
  }
}
