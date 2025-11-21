import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
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
import { Repository, DataSource } from 'typeorm';
import { ScoreJob } from 'src/databases/entities/score-job.entity';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,

    @InjectRepository(ScoreJob)
    private readonly scoreJobRepo: Repository<ScoreJob>,

    private readonly dataSource: DataSource,
  ) {}

  async createSubmission(
    submissionDto: SubmissionCreateDto,
  ): Promise<SubmissionResponseDto> {
    try {
      const sub = this.submissionRepo.create({
        learnerId: submissionDto.learnerId,
        simulationId: submissionDto.simulationId,
        status: SubmissionStatus.IN_PROGRESS,
      });
      const savedData = await this.submissionRepo.save(sub);

      console.log('Created submission:', savedData);
      return { submissionId: savedData.id, status: savedData.status };
    } catch (error) {
      console.error('Error creating submission:', error);
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

      console.log('Updated submission:', saved);
      return { submissionId: saved.id, status: saved.status };
    } catch (error) {
      console.error('Error updating submission:', error);
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

      console.log('Submitted submission:', savedSubmission);
      return {
        submissionId: savedSubmission.id,
        status: savedSubmission.status,
      };
    } catch (error) {
      console.error('Error submitting submission:', error);
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

    //   console.log('Submit successfully:', result);
    //   return { submissionId: result.id, status: result.status };
    // } catch (error) {
    //   console.error('Submit failed:', error);
    //   throw new InternalServerErrorException('Failed to submit submission');
    // }
  }
}
