import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PackagesService } from './packages.service';
import { CreatePackageDto, UpdatePackageDto } from './dto/package.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { successResponse, paginatedResponse } from '../../common/utils/response.util';

@ApiTags('Packages')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('packages')
export class PackagesController {
  constructor(private service: PackagesService) {}

  @Get()
  @RequirePermissions('packages.read')
  async findAll(@Query() query: PaginationDto) {
    const result = await this.service.findAll(query);
    return paginatedResponse(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @RequirePermissions('packages.read')
  async findOne(@Param('id') id: string) {
    return successResponse(await this.service.findOne(id));
  }

  @Post()
  @RequirePermissions('packages.create')
  async create(@Body() dto: CreatePackageDto) {
    return successResponse(await this.service.create(dto), 'Package created');
  }

  @Patch(':id')
  @RequirePermissions('packages.update')
  async update(@Param('id') id: string, @Body() dto: UpdatePackageDto) {
    return successResponse(await this.service.update(id, dto), 'Package updated');
  }

  @Delete(':id')
  @RequirePermissions('packages.delete')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return successResponse(null, 'Package deactivated');
  }
}
