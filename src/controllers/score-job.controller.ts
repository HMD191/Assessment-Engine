import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateScoreJobDto, ScoreJobResponseDto } from 'src/dtos/score-job.dto';
import { ScoreJobService } from 'src/modules/score-job/score-job.service';

@ApiTags('score-jobs')
@Controller('score-jobs')
export class ScoreJobsController {
  constructor(private scoreJobsService: ScoreJobService) {}

  @Post()
  @ApiBody({ type: CreateScoreJobDto })
  @ApiResponse({
    description: 'Score job created successfully.',
    type: ScoreJobResponseDto,
  })
  async create(
    @Body() createScoreJobDto: CreateScoreJobDto,
  ): Promise<ScoreJobResponseDto> {
    return this.scoreJobsService.createJob(createScoreJobDto);
  }

  @Get(':id')
  @ApiResponse({
    description: 'Score job retrieved successfully.',
    type: ScoreJobResponseDto,
  })
  async getOne(@Param('id') id: string): Promise<ScoreJobResponseDto> {
    return this.scoreJobsService.getJob(id);
  }
}
