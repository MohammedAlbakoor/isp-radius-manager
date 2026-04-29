import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminUsersService } from './admin-users.service';
import { CreateAdminUserDto, UpdateAdminUserDto } from './dto/admin-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { successResponse, paginatedResponse } from '../../common/utils/response.util';

@ApiTags('Admin Users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('admin-users')
export class AdminUsersController {
  constructor(private service: AdminUsersService) {}

  @Get()
  @RequirePermissions('admin_users.read')
  async findAll(@Query() query: PaginationDto) {
    const result = await this.service.findAll(query);
    return paginatedResponse(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @RequirePermissions('admin_users.read')
  async findOne(@Param('id') id: string) {
    return successResponse(await this.service.findOne(id));
  }

  @Post()
  @RequirePermissions('admin_users.create')
  async create(@Body() dto: CreateAdminUserDto) {
    return successResponse(await this.service.create(dto), 'Admin user created');
  }

  @Patch(':id')
  @RequirePermissions('admin_users.update')
  async update(@Param('id') id: string, @Body() dto: UpdateAdminUserDto) {
    return successResponse(await this.service.update(id, dto), 'Admin user updated');
  }

  @Delete(':id')
  @RequirePermissions('admin_users.delete')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return successResponse(null, 'Admin user deactivated');
  }
}
