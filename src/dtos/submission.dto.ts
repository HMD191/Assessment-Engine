import { IsOptional, IsObject, IsNumber, IsString } from 'class-validator';

class SubmissionCreateDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  simulationId: number;
}

class SubmissionUpdateDto {
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}

class SubmissionResponseDto {
  @IsNumber()
  submissionId: string;

  @IsString()
  status: 'IN_PROGRESS' | 'SUBMITTED';
}

export { SubmissionCreateDto, SubmissionUpdateDto, SubmissionResponseDto };
