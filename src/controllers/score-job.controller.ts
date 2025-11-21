import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreateScoreJobDto, ScoreJobResponseDto } from 'src/dtos/score-job.dto';
import { ScoreJobService } from 'src/modules/score-job/score-job.service';

@Controller('score-jobs')
export class ScoreJobsController {
  constructor(private scoreJobsService: ScoreJobService) {}

  @Post()
  async create(
    @Body() createScoreJobDto: CreateScoreJobDto,
  ): Promise<ScoreJobResponseDto> {
    return this.scoreJobsService.createJob(createScoreJobDto);
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<ScoreJobResponseDto> {
    return this.scoreJobsService.getJob(id);
  }
}
