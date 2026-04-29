import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { successResponse, paginatedResponse } from '../../common/utils/response.util';

@ApiTags('Sessions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private service: SessionsService) {}

  @Get('active')
  @RequirePermissions('sessions.read')
  async getActiveSessions(@Query() query: PaginationDto) {
    const result = await this.service.getActiveSessions(query);
    return paginatedResponse(result.data, result.total, result.page, result.limit);
  }

  @Get('history')
  @RequirePermissions('sessions.read')
  async getSessionHistory(@Query() query: PaginationDto & { username?: string }) {
    const result = await this.service.getSessionHistory(query);
    return paginatedResponse(result.data, result.total, result.page, result.limit);
  }

  @Post(':id/disconnect')
  @RequirePermissions('sessions.disconnect')
  async disconnect(@Param('id') id: string) {
    return successResponse(await this.service.disconnectSession(id), 'User disconnected');
  }
}
