import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InternetAccountsService } from './internet-accounts.service';
import { CreateInternetAccountDto, UpdateInternetAccountDto } from './dto/internet-account.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { successResponse, paginatedResponse } from '../../common/utils/response.util';

@ApiTags('Internet Accounts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('internet-accounts')
export class InternetAccountsController {
  constructor(private service: InternetAccountsService) {}

  @Get()
  @RequirePermissions('internet_accounts.read')
  async findAll(@Query() query: PaginationDto & { status?: string; customerId?: string }) {
    const result = await this.service.findAll(query);
    return paginatedResponse(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @RequirePermissions('internet_accounts.read')
  async findOne(@Param('id') id: string) {
    return successResponse(await this.service.findOne(id));
  }

  @Post()
  @RequirePermissions('internet_accounts.create')
  async create(@Body() dto: CreateInternetAccountDto) {
    return successResponse(await this.service.create(dto), 'Internet account created');
  }

  @Patch(':id')
  @RequirePermissions('internet_accounts.update')
  async update(@Param('id') id: string, @Body() dto: UpdateInternetAccountDto) {
    return successResponse(await this.service.update(id, dto), 'Internet account updated');
  }

  @Post(':id/activate')
  @RequirePermissions('internet_accounts.update')
  async activate(@Param('id') id: string) {
    return successResponse(await this.service.activate(id), 'Account activated');
  }

  @Post(':id/suspend')
  @RequirePermissions('internet_accounts.update')
  async suspend(@Param('id') id: string) {
    return successResponse(await this.service.suspend(id), 'Account suspended');
  }

  @Post(':id/disable')
  @RequirePermissions('internet_accounts.update')
  async disable(@Param('id') id: string) {
    return successResponse(await this.service.disable(id), 'Account disabled');
  }

  @Post(':id/reset-password')
  @RequirePermissions('internet_accounts.update')
  async resetPassword(@Param('id') id: string, @Body('password') password: string) {
    await this.service.resetPassword(id, password);
    return successResponse(null, 'Password reset successful');
  }

  @Post(':id/change-package')
  @RequirePermissions('internet_accounts.update')
  async changePackage(@Param('id') id: string, @Body('packageId') packageId: string) {
    return successResponse(await this.service.changePackage(id, packageId), 'Package changed');
  }

  @Get(':id/sessions')
  @RequirePermissions('internet_accounts.read')
  async getSessions(@Param('id') id: string) {
    return successResponse(await this.service.getSessions(id));
  }

  @Get(':id/usage')
  @RequirePermissions('internet_accounts.read')
  async getUsage(@Param('id') id: string) {
    return successResponse(await this.service.getUsage(id));
  }
}
