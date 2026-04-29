import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RadiusSyncService } from './radius-sync.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { successResponse } from '../../common/utils/response.util';

@ApiTags('RADIUS')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('radius')
export class RadiusController {
  constructor(private radiusSyncService: RadiusSyncService) {}

  @Post('sync-all')
  @RequirePermissions('radius.manage')
  async syncAll() {
    const result = await this.radiusSyncService.syncAllAccounts();
    return successResponse(result, 'RADIUS sync completed');
  }

  @Post('sync-nas')
  @RequirePermissions('radius.manage')
  async syncNas() {
    await this.radiusSyncService.syncNas();
    return successResponse(null, 'NAS sync completed');
  }
}
