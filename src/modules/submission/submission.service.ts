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
  SubmissionUpdateDto,
} from 'src/dtos/submission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name);

  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,
  ) {}

  async createSubmission(
    submissionDto: SubmissionCreateDto,
  ): Promise<SubmissionResponseDto> {
    const existedSubmission = await this.submissionRepo.findOne({
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

  async updateSubmission(
    id: string,
    updateDto: SubmissionUpdateDto,
  ): Promise<SubmissionResponseDto> {
    try {
      const submission = await this.submissionRepo.findOne({ where: { id } });

      if (!submission) throw new NotFoundException('Submission not found');
      if (submission.status === SubmissionStatus.SUBMITTED) {
        throw new ConflictException('Cannot update a submitted submission');
      }

      //ASSUME: data has a complete structure (data must have enough fields)
      submission.data = { ...submission.data, ...(updateDto.data ?? {}) };
      const saved = await this.submissionRepo.save(submission);

      this.logger.log('Updated submission:', saved);
      return { submissionId: saved.id, status: saved.status };
    } catch (error) {
      this.logger.error('Error updating submission:', error);
      throw new InternalServerErrorException('Failed to update submission');
    }
  }

  async submitSubmission(id: string): Promise<SubmissionResponseDto> {
    try {
      const submission = await this.submissionRepo.findOne({ where: { id } });

      if (!submission) throw new NotFoundException('Submission not found');
      if (submission.status === SubmissionStatus.SUBMITTED) {
        return { submissionId: submission.id, status: submission.status };
      }

      submission.status = SubmissionStatus.SUBMITTED;
      const savedSubmission = await this.submissionRepo.save(submission);

      this.logger.log('Submitted submission:', savedSubmission);
      return {
        submissionId: savedSubmission.id,
        status: savedSubmission.status,
      };
    } catch (error) {
      this.logger.error('Error submitting submission:', error);
      throw new InternalServerErrorException('Failed to submit submission');
    }
    // const scoreJob = this.scoreJobRepo.create({
    //   submissionId: submission.id,
    //   learnerId: submission.learnerId,
    //   simulationId: submission.simulationId,
    //   status: ScoreJobStatus.QUEUED,
    // });

    // try {
    //   const result = await this.dataSource.transaction(async (manager) => {
    //     const savedSubmission = await manager.save(submission);
    //     // await manager.save(scoreJob);

    //     return savedSubmission;
    //   });

    //   this.logger.log('Submit successfully:', result);
    //   return { submissionId: result.id, status: result.status };
    // } catch (error) {
    //   this.logger.error('Submit failed:', error);
    //   throw new InternalServerErrorException('Failed to submit submission');
    // }
  }
}
