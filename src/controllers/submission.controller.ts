import { Body, Controller, HttpCode, Param, Patch, Post } from '@nestjs/common';
import {
  SubmissionCreateDto,
  SubmissionResponseDto,
  SubmissionSubmitDto,
  SubmissionUpdateDto,
} from 'src/dtos/submission.dto';

import { SubmissionService } from 'src/modules/submission/submission.service';

@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async create(
    @Body() dto: SubmissionCreateDto,
  ): Promise<SubmissionResponseDto> {
    return this.submissionService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: SubmissionUpdateDto,
  ): Promise<SubmissionResponseDto> {
    return this.submissionService.update(id, updateDto);
  }

  @Post(':id/submit')
  @HttpCode(200)
  async submit(
    @Param('id') id: string,
    @Body() submitDto: SubmissionSubmitDto,
  ): Promise<SubmissionResponseDto> {
    return this.submissionService.submit(id, submitDto);
  }
}
