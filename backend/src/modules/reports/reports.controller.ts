import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { successResponse } from '../../common/utils/response.util';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('dashboard')
  @RequirePermissions('reports.read')
  async getDashboard() {
    return successResponse(await this.service.getDashboard());
  }

  @Get('revenue')
  @RequirePermissions('reports.read')
  async getRevenue(@Query('period') period: 'day' | 'week' | 'month') {
    return successResponse(await this.service.getRevenueReport(period));
  }

  @Get('usage')
  @RequirePermissions('reports.read')
  async getUsage() {
    return successResponse(await this.service.getUsageReport());
  }

  @Get('expired-subscriptions')
  @RequirePermissions('reports.read')
  async getExpiredSubscriptions() {
    return successResponse(await this.service.getExpiredSubscriptions());
  }

  @Get('router-health')
  @RequirePermissions('reports.read')
  async getRouterHealth() {
    return successResponse(await this.service.getRouterHealth());
  }
}
