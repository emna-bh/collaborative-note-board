import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { ActivityService } from './activity.service';
import { QueryActivitiesDto } from './dto/query-activities.dto';

@ApiTags('activities')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: 'List recent board activity' })
  @ApiResponse({ status: 200, description: 'Recent activities returned' })
  findAll(@Query() query: QueryActivitiesDto) {
    return this.activityService.findLatest(query.limit);
  }
}
