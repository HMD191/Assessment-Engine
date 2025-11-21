import { IsOptional, IsObject, IsString, IsNotEmpty } from 'class-validator';

class SubmissionCreateDto {
  @IsNotEmpty({ message: 'learnerId is required' })
  @IsString({ message: 'learnerId must be a string' })
  learnerId: string;

  @IsNotEmpty({ message: 'simulationId is required' })
  @IsString({ message: 'simulationId must be a string' })
  simulationId: string;
}

class SubmissionUpdateDto {
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}

class SubmissionResponseDto {
  @IsString({ message: 'submissionId must be a string' })
  submissionId: string;

  @IsString({ message: 'status must be a string' })
  status: 'IN_PROGRESS' | 'SUBMITTED';
}

export { SubmissionCreateDto, SubmissionUpdateDto, SubmissionResponseDto };
