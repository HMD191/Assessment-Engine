import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import {
  ScoreJob,
  ScoreJobStatus,
} from 'src/databases/entities/score-job.entity';
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
    console.log('Processing score job:', job);
    const { jobId, submissionId } = job.data;
    console.log(`Scoring submission ${submissionId} for job ${jobId}`);

    const record = await this.scoreJobRepo.findOne({
      where: { id: jobId },
    });
    if (!record) {
      console.error(`ScoreJob with id ${jobId} not found`);
      return;
    }

    try {
      await this.scoreJobRepo.update(jobId, { status: ScoreJobStatus.RUNNING });

      const dataForScoring = record.data;

      console.log('-----------SCORING LOGIC START-----------');
      console.log('Do something with data:', dataForScoring);

      await new Promise((resolve) => setTimeout(resolve, 60000));
      const score = Math.floor(Math.random() * 100); //random score for example
      const feedback = 'Fake feedback'; //static feedback for example

      console.log('-----------SCORING LOGIC END-----------');

      await this.scoreJobRepo.update(jobId, {
        status: ScoreJobStatus.DONE,
        score,
        feedback,
      });

      console.log(`Scoring completed for job ${jobId}: score=${score}`);
    } catch (err) {
      await this.scoreJobRepo.update(jobId, {
        status: ScoreJobStatus.ERROR,
        errorMessage: err.message,
      });
    }
  }
}
