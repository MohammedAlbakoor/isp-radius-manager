import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RoutersService } from './routers.service';
import { CreateRouterDto, UpdateRouterDto } from './dto/router.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { successResponse, paginatedResponse } from '../../common/utils/response.util';

@ApiTags('Routers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('routers')
export class RoutersController {
  constructor(private service: RoutersService) {}

  @Get()
  @RequirePermissions('routers.read')
  async findAll(@Query() query: PaginationDto) {
    const result = await this.service.findAll(query);
    return paginatedResponse(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @RequirePermissions('routers.read')
  async findOne(@Param('id') id: string) {
    return successResponse(await this.service.findOne(id));
  }

  @Post()
  @RequirePermissions('routers.create')
  async create(@Body() dto: CreateRouterDto) {
    return successResponse(await this.service.create(dto), 'Router created');
  }

  @Patch(':id')
  @RequirePermissions('routers.update')
  async update(@Param('id') id: string, @Body() dto: UpdateRouterDto) {
    return successResponse(await this.service.update(id, dto), 'Router updated');
  }

  @Delete(':id')
  @RequirePermissions('routers.delete')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return successResponse(null, 'Router deactivated');
  }

  @Post(':id/test-connection')
  @RequirePermissions('routers.manage')
  async testConnection(@Param('id') id: string) {
    const result = await this.service.testConnection(id);
    return successResponse(result, 'Connection successful');
  }

  @Get(':id/setup-commands')
  @RequirePermissions('routers.read')
  async getSetupCommands(@Param('id') id: string) {
    const router = await this.service.findOne(id);
    const commands = this.service.getSetupCommands(router);
    return successResponse(commands);
  }
}
