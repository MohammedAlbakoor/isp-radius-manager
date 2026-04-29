import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { paginatedResponse } from '../../common/utils/response.util';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private service: AuditLogsService) {}

  @Get()
  @RequirePermissions('audit_logs.read')
  async findAll(@Query() query: PaginationDto & { entityType?: string; actorId?: string }) {
    const result = await this.service.findAll(query);
    return paginatedResponse(result.data, result.total, result.page, result.limit);
  }
}
