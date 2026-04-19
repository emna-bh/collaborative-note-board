import { Controller, Get, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { CurrentUserDecorator } from '../../common/decorators/current-user.decorator';
import * as currentUserInterface from '../auth/interfaces/current-user.interface';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('test-auth')
@ApiBearerAuth()
@Controller('test-auth')
export class HealthController {
  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns the authenticated user',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing or invalid token',
  })
  getMe(@CurrentUserDecorator() user: currentUserInterface.CurrentUser) {
    return user;
  }
}
