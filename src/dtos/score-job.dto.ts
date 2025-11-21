import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

class CreateScoreJobDto {
  @IsString({ message: 'learnerId must be a string' })
  readonly learnerId: string;

  @IsString({ message: 'simulationId must be a string' })
  readonly simulationId: string;

  @IsObject({ message: 'data must be an object' })
  readonly data: Record<string, any>;

  @IsOptional()
  @IsString({ message: 'submissionId must be a string' })
  readonly submissionId?: string;
}

class ScoreJobResponseDto {
  @IsString({ message: 'jobId must be a string' })
  jobId: string;

  @IsString({ message: 'status must be a string' })
  status: string;

  @IsNumber({}, { message: 'score must be a number' })
  score?: number;

  @IsString({ message: 'feedback must be a string' })
  feedback?: string;
}

class ScoreDto {
  @IsNumber({}, { message: 'score must be a number' })
  score: number;

  @IsString({ message: 'feedback must be a string' })
  feedback: string;
}

export { CreateScoreJobDto, ScoreJobResponseDto, ScoreDto };
