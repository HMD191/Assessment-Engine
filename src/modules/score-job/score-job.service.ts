import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ScoreJob,
  ScoreJobStatus,
} from 'src/databases/entities/score-job.entity';
import { CreateScoreJobDto, ScoreJobResponseDto } from 'src/dtos/score-job.dto';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import {
  Submission,
  SubmissionStatus,
} from 'src/databases/entities/submission.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class ScoreJobService {
  private readonly logger = new Logger(ScoreJobService.name);

  constructor(
    @InjectRepository(ScoreJob)
    private scoreJobRepo: Repository<ScoreJob>,

    @InjectRepository(Submission)
    private submissionRepo: Repository<Submission>,

    @InjectQueue('ScoreJobQueue')
    private scoreJobQueue: Queue,
  ) {}

  async createJob(
    createScoreJobDto: CreateScoreJobDto,
  ): Promise<ScoreJobResponseDto> {
    try {
      const submission = await this.submissionRepo.findOne({
        select: ['id', 'status'],
        where: {
          learnerId: createScoreJobDto.learnerId,
          simulationId: createScoreJobDto.simulationId,
        },
      });

      if (!submission) {
        throw new NotFoundException(
          'Submission not found for the given learner and simulation',
        );
      }

      if (submission.status !== SubmissionStatus.SUBMITTED) {
        throw new ConflictException(
          'Submission is not in SUBMITTED status, cannot create score job',
        );
      }

      const jobInfo = this.scoreJobRepo.create({
        learnerId: createScoreJobDto.learnerId,
        simulationId: createScoreJobDto.simulationId,
        submissionId: submission.id,
        data: createScoreJobDto.data,
        status: ScoreJobStatus.QUEUED,
      });

      // Transaction
      const savedJob = await this.scoreJobRepo.manager.transaction(
        async (manager) => {
          const saved = await manager.save(jobInfo);
          await manager.update(Submission, submission.id, {
            latestScoreJobId: saved.id,
          });

          return saved;
        },
      );

      await this.scoreJobQueue.add(
        'scoreJobHandler',
        {
          jobId: savedJob.id,
          submissionId: submission.id,
        },
        {
          jobId: savedJob.id,
          attempts: 3,
          backoff: { type: 'fixed', delay: 5000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      this.logger.log(`Created score job ${savedJob.id}`);
      return { jobId: savedJob.id, status: savedJob.status };
    } catch (error) {
      this.logger.error(
        `Error creating score job: ${error.message}`,
        error.stack,
      );

      if (error instanceof NotFoundException) throw error;
      if (error instanceof ConflictException) throw error;

      throw new InternalServerErrorException('Failed to create score job');
    }
  }

  async getJob(id: string): Promise<ScoreJobResponseDto> {
    const job = await this.scoreJobRepo.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');

    const response: ScoreJobResponseDto = {
      jobId: job.id,
      status: job.status,
    };

    if (job.status === ScoreJobStatus.DONE) {
      response.score = job.score;
      response.feedback = job.feedback;
    }

    this.logger.log('Fetched score job:', response);
    return response;
  }
}
