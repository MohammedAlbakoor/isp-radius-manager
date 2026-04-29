import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse } from '../../common/utils/response.util';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('settings')
export class SettingsController {
  constructor(private service: SettingsService) {}

  @Get()
  @RequirePermissions('settings.read')
  async getAll() {
    return successResponse(await this.service.getAll());
  }

  @Patch()
  @RequirePermissions('settings.update')
  async update(
    @Body() body: Record<string, unknown>,
    @CurrentUser('id') userId: string,
  ) {
    return successResponse(
      await this.service.updateMultiple(body, userId),
      'Settings updated',
    );
  }
}
