import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  SubmissionStatus,
  Submission,
} from 'src/databases/entities/submission.entity';
import {
  SubmissionCreateDto,
  SubmissionResponseDto,
  SubmissionSubmitDto,
  SubmissionUpdateDto,
} from 'src/dtos/submission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScoreJobService } from '../score-job/score-job.service';
import { CreateScoreJobDto } from 'src/dtos/score-job.dto';

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name);

  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,

    private readonly scoreJobService: ScoreJobService,
  ) {}

  async create(
    submissionDto: SubmissionCreateDto,
  ): Promise<SubmissionResponseDto> {
    const existedSubmission = await this.submissionRepo.findOne({
      select: ['id'],
      where: {
        learnerId: submissionDto.learnerId,
        simulationId: submissionDto.simulationId,
      },
    });

    if (existedSubmission) {
      this.logger.warn(
        `Submission already exists for learnerId: ${submissionDto.learnerId}, simulationId: ${submissionDto.simulationId}`,
      );
      throw new ConflictException(
        'A submission already exists for this learner and simulation',
      );
    }

    try {
      const sub = this.submissionRepo.create({
        learnerId: submissionDto.learnerId,
        simulationId: submissionDto.simulationId,
        status: SubmissionStatus.IN_PROGRESS,
      });
      const savedData = await this.submissionRepo.save(sub);

      this.logger.log('Created submission:', savedData);
      return { submissionId: savedData.id, status: savedData.status };
    } catch (error) {
      this.logger.error('Error creating submission:', error);
      throw new InternalServerErrorException('Failed to create submission');
    }
  }

  async update(
    id: string,
    updateDto: SubmissionUpdateDto,
  ): Promise<SubmissionResponseDto> {
    try {
      const submission = await this.submissionRepo.findOne({ where: { id } });

      if (!submission) throw new NotFoundException('Submission not found');
      if (submission.status === SubmissionStatus.SUBMITTED) {
        throw new ConflictException('Cannot update a submitted submission');
      }

      // ASSUME: data has a complete structure (data must have enough fields)
      submission.data = {
        ...(submission.data ?? {}),
        ...(updateDto.data ?? {}),
      };
      const saved = await this.submissionRepo.save(submission);

      this.logger.log('Updated submission:', saved);
      return { submissionId: saved.id, status: saved.status };
    } catch (error) {
      this.logger.error('Error updating submission:', error);
      throw new InternalServerErrorException('Failed to update submission');
    }
  }

  async submit(
    id: string,
    submitDto: SubmissionSubmitDto,
  ): Promise<SubmissionResponseDto> {
    try {
      const submission = await this.submissionRepo.findOne({ where: { id } });

      if (!submission) throw new NotFoundException('Submission not found');
      if (submission.status === SubmissionStatus.SUBMITTED) {
        return { submissionId: submission.id, status: submission.status };
      }

      submission.status = SubmissionStatus.SUBMITTED;
      submission.data = {
        ...(submission.data ?? {}),
        ...(submitDto.data ?? {}),
      };
      const savedSubmission = await this.submissionRepo.save(submission);
      this.logger.log('Submitted submission:', savedSubmission);

      if (submitDto.scoreNow) {
        const createdJobObject: CreateScoreJobDto = {
          submissionId: savedSubmission.id,
          learnerId: savedSubmission.learnerId,
          simulationId: savedSubmission.simulationId,
          data: savedSubmission.data,
        };
        await this.scoreJobService.createJob(createdJobObject);

        this.logger.log(
          'Created score job for submission:',
          savedSubmission.id,
        );
      }

      return {
        submissionId: savedSubmission.id,
        status: savedSubmission.status,
      };
    } catch (error) {
      this.logger.error('Error submitting submission:', error);
      throw new InternalServerErrorException('Failed to submit submission');
    }
  }
}
