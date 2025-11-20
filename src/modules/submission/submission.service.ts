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
import { Repository } from 'typeorm';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,
  ) {}

  async createSubmission(
    submissionDto: SubmissionCreateDto,
  ): Promise<SubmissionResponseDto> {
    try {
      const sub = this.submissionRepo.create({
        userId: submissionDto.userId,
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

      //assume data has a complete structure (data must have enough fields)
      submission.data = { ...submission.data, ...(updateDto.data ?? {}) };
      submission.updatedAt = new Date();
      const saved = await this.submissionRepo.save(submission);

      console.log('Updated submission:', saved);
      return { submissionId: saved.id, status: saved.status };
    } catch (error) {
      console.error('Error updating submission:', error);
      throw new InternalServerErrorException('Failed to update submission');
    }
  }

  async submitSubmission(id: string): Promise<SubmissionResponseDto> {
    // transactional update + enqueue job
    const submission = await this.submissionRepo.findOne({ where: { id } });

    if (!submission) throw new NotFoundException('Submission not found');
    if (submission.status === SubmissionStatus.SUBMITTED) {
      return { submissionId: submission.id, status: submission.status };
    }

    submission.status = SubmissionStatus.SUBMITTED;
    submission.updatedAt = new Date();

    const queryRunner =
      this.submissionRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(submission);
      //add submission into job queue for scoring

      await queryRunner.commitTransaction();

      console.log('Submitted submission:', submission);
      return { submissionId: submission.id, status: submission.status };
    } catch (error) {
      console.error('Error submitting submission:', error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to submit submission');
    } finally {
      await queryRunner.release();
    }

    // // trigger scoring job (nếu dùng queue)
    // if (this.scoringQueue) {
    //   await this.scoringQueue.add('scoreSubmission', { submissionId: sub.id });
    // }
  }
}
