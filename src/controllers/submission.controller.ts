import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  SubmissionCreateDto,
  SubmissionResponseDto,
  SubmissionSubmitDto,
  SubmissionUpdateDto,
} from 'src/dtos/submission.dto';

import { SubmissionService } from 'src/modules/submission/submission.service';

@ApiTags('submissions')
@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  @ApiBody({ type: SubmissionCreateDto })
  @ApiResponse({
    description: 'Submission created successfully.',
    type: SubmissionResponseDto,
  })
  async create(
    @Body() dto: SubmissionCreateDto,
  ): Promise<SubmissionResponseDto> {
    return this.submissionService.create(dto);
  }

  @Patch(':id')
  @ApiBody({ type: SubmissionUpdateDto })
  @ApiResponse({
    description: 'Submission updated successfully.',
    type: SubmissionResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: SubmissionUpdateDto,
  ): Promise<SubmissionResponseDto> {
    return this.submissionService.update(id, updateDto);
  }

  @Post(':id/submit')
  @ApiBody({ type: SubmissionSubmitDto })
  @ApiResponse({
    description: 'Submission submitted successfully.',
    type: SubmissionResponseDto,
  })
  async submit(
    @Param('id') id: string,
    @Body() submitDto: SubmissionSubmitDto,
  ): Promise<SubmissionResponseDto> {
    return this.submissionService.submit(id, submitDto);
  }
}
