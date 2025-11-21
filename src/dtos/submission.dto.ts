import {
  IsOptional,
  IsObject,
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { SubmissionStatus } from 'src/databases/entities/submission.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SubmissionCreateDto {
  @ApiProperty({
    description: 'Learner ID',
    example: 'learner-uuid-123',
  })
  @IsNotEmpty({ message: 'learnerId is required' })
  @IsString({ message: 'learnerId must be a string' })
  learnerId: string;

  @ApiProperty({
    description: 'Simulation ID',
    example: 'simulation-uuid-456',
  })
  @IsNotEmpty({ message: 'simulationId is required' })
  @IsString({ message: 'simulationId must be a string' })
  simulationId: string;
}

class SubmissionUpdateDto {
  @ApiProperty({
    description: 'Submission data to update',
    example: { answer1: 'A', answer2: 'B' },
  })
  @IsObject({ message: 'data must be an object' })
  data: Record<string, any>;
}

class SubmissionSubmitDto {
  @ApiPropertyOptional({
    description: 'Whether to trigger scoring immediately',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'scoreNow must be a boolean' })
  scoreNow?: boolean;

  @ApiPropertyOptional({
    description: 'Additional submission data',
    example: { answer1: 'A', answer2: 'B' },
  })
  @IsObject({ message: 'data must be an object' })
  data?: Record<string, any>;
}

class SubmissionResponseDto {
  @ApiProperty({
    description: 'Submission ID',
    example: 'submission-uuid-789',
  })
  @IsString({ message: 'submissionId must be a string' })
  submissionId: string;

  @ApiProperty({
    description: 'Submission Status',
    example: SubmissionStatus.IN_PROGRESS,
  })
  @IsEnum(SubmissionStatus, {
    message: 'status must be a valid SubmissionStatus',
  })
  status: SubmissionStatus;
}

export {
  SubmissionCreateDto,
  SubmissionUpdateDto,
  SubmissionResponseDto,
  SubmissionSubmitDto,
};
