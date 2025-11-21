import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScoreJobStatus } from 'src/databases/entities/score-job.entity';

class CreateScoreJobDto {
  @ApiProperty({ description: 'Learner ID', example: 'learner-uuid-123' })
  @IsString({ message: 'learnerId must be a string' })
  readonly learnerId: string;

  @ApiProperty({ description: 'Simulation ID', example: 'simulation-uuid-456' })
  @IsString({ message: 'simulationId must be a string' })
  readonly simulationId: string;

  @ApiProperty({
    description: 'Data to be scored',
    example: { answer1: 'A', answer2: 'B' },
  })
  @IsObject({ message: 'data must be an object' })
  readonly data: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Optional submission ID',
    example: 'submission-uuid-789',
  })
  @IsOptional()
  @IsString({ message: 'submissionId must be a string' })
  readonly submissionId?: string;
}

class ScoreJobResponseDto {
  @ApiProperty({ description: 'Job ID', example: 'job-uuid-123' })
  @IsString({ message: 'jobId must be a string' })
  jobId: string;

  @ApiProperty({ description: 'Job Status', example: ScoreJobStatus.QUEUED })
  @IsEnum(ScoreJobStatus, { message: 'status must be a valid ScoreJobStatus' })
  status: ScoreJobStatus;

  @ApiPropertyOptional({ description: 'Score value', example: 87.5 })
  @IsNumber({}, { message: 'score must be a number' })
  score?: number;

  @ApiPropertyOptional({
    description: 'Feedback from scoring',
    example: 'Good job!',
  })
  @IsString({ message: 'feedback must be a string' })
  feedback?: string;
}

class ScoreDto {
  @ApiProperty({ description: 'Score value', example: 87.5 })
  @IsNumber({}, { message: 'score must be a number' })
  score: number;

  @ApiProperty({ description: 'Feedback from scoring', example: 'Good job!' })
  @IsString({ message: 'feedback must be a string' })
  feedback: string;
}

export { CreateScoreJobDto, ScoreJobResponseDto, ScoreDto };
