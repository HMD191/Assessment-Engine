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
import { ScoreJobService } from 'src/modules/score-job/score-job.service';
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
    const existedSubmission = await this.submissionRepo.exists({
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

    const sub = this.submissionRepo.create({
      learnerId: submissionDto.learnerId,
      simulationId: submissionDto.simulationId,
      status: SubmissionStatus.IN_PROGRESS,
    });
    const savedData = await this.submissionRepo.save(sub);

    this.logger.log('Created submission:', savedData);
    return { submissionId: savedData.id, status: savedData.status };
  }

  async update(
    id: string,
    updateDto: SubmissionUpdateDto,
  ): Promise<SubmissionResponseDto> {
    const submission = await this.submissionRepo.findOne({ where: { id } });

    if (!submission) {
      this.logger.warn(`Submission not found with id: ${id}`);
      throw new NotFoundException('Submission not found');
    }
    if (submission.status === SubmissionStatus.SUBMITTED) {
      this.logger.warn(`Cannot update a submitted submission with id: ${id}`);
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
  }

  async submit(
    id: string,
    submitDto: SubmissionSubmitDto,
  ): Promise<SubmissionResponseDto> {
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
      try {
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
      } catch (error) {
        this.logger.error(
          `Error creating score job for submission ${savedSubmission.id}:`,
          error.message,
        );
        throw new InternalServerErrorException(
          'Failed to create score job: ' + error.message,
        );
      }
    }

    return {
      submissionId: savedSubmission.id,
      status: savedSubmission.status,
    };
  }
}
