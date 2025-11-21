import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ScoreJob,
  ScoreJobStatus,
} from 'src/databases/entities/score-job.entity';
import { CreateScoreJobDto, ScoreJobResponseDto } from 'src/dtos/score-job.dto';
import { DataSource, Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import {
  Submission,
  SubmissionStatus,
} from 'src/databases/entities/submission.entity';

@Injectable()
export class ScoreJobService {
  constructor(
    @InjectRepository(ScoreJob)
    private scoreJobRepo: Repository<ScoreJob>,

    @InjectRepository(Submission)
    private submissionRepo: Repository<Submission>,

    @InjectQueue('ScoreJobQueue')
    private scoreJobQueue: Queue,

    private readonly dataSource: DataSource,
  ) {}

  async createJob(
    createScoreJobDto: CreateScoreJobDto,
  ): Promise<ScoreJobResponseDto> {
    try {
      const submission = await this.submissionRepo.findOne({
        where: {
          learnerId: createScoreJobDto.learnerId,
          simulationId: createScoreJobDto.simulationId,
        },
      });

      if (!submission) {
        throw new Error(
          'Submission not found for the given learner and simulation',
        );
      }

      if (submission.status !== SubmissionStatus.SUBMITTED) {
        throw new Error('Submission is not in SUBMITTED status');
      }

      const existingJob = await this.scoreJobRepo.findOne({
        where: {
          submissionId: submission.id,
        },
      });

      if (existingJob) {
        throw new Error('A score job is already queued for this submission');
      }

      const jobInfo = this.scoreJobRepo.create({
        learnerId: createScoreJobDto.learnerId,
        simulationId: createScoreJobDto.simulationId,
        submissionId: submission.id,
        data: createScoreJobDto.data,
        status: ScoreJobStatus.QUEUED,
      });

      const savedJob = await this.scoreJobRepo.save(jobInfo);

      await this.scoreJobQueue.add(
        'scoreJobHandler',
        {
          jobId: savedJob.id,
          submissionId: submission.id,
          //data can be huge, so only pass submissionId and load data in db later
        },
        {
          jobId: savedJob.id,
          attempts: 3,
          backoff: { type: 'fixed', delay: 5000 },
        },
      );

      console.log('Created score job:', savedJob);
      return { jobId: savedJob.id, status: savedJob.status };
    } catch (error) {
      console.error('Error creating score job:', error);
      throw error;
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

    return response;
  }
}
