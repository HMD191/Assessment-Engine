import { Body, Controller, HttpCode, Param, Patch, Post } from '@nestjs/common';
import {
  SubmissionCreateDto,
  SubmissionResponseDto,
  SubmissionUpdateDto,
} from 'src/dtos/submission.dto';

import { SubmissionService } from 'src/modules/submission/submission.service';

@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async createSubmission(
    @Body() dto: SubmissionCreateDto,
  ): Promise<SubmissionResponseDto> {
    return this.submissionService.createSubmission(dto);
  }

  @Patch(':id')
  async updateSubmission(
    @Param('id') id: string,
    @Body() updateDto: SubmissionUpdateDto,
  ): Promise<SubmissionResponseDto> {
    return this.submissionService.updateSubmission(id, updateDto);
  }

  @Post(':id/submit')
  @HttpCode(200)
  async submitSubmission(
    @Param('id') id: string,
  ): Promise<SubmissionResponseDto> {
    return this.submissionService.submitSubmission(id);
  }
}
