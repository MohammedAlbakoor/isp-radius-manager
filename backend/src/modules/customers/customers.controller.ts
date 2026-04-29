import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { successResponse, paginatedResponse } from '../../common/utils/response.util';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('customers')
export class CustomersController {
  constructor(private service: CustomersService) {}

  @Get()
  @RequirePermissions('customers.read')
  async findAll(@Query() query: PaginationDto) {
    const result = await this.service.findAll(query);
    return paginatedResponse(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @RequirePermissions('customers.read')
  async findOne(@Param('id') id: string) {
    return successResponse(await this.service.findOne(id));
  }

  @Post()
  @RequirePermissions('customers.create')
  async create(@Body() dto: CreateCustomerDto) {
    return successResponse(await this.service.create(dto), 'Customer created');
  }

  @Patch(':id')
  @RequirePermissions('customers.update')
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return successResponse(await this.service.update(id, dto), 'Customer updated');
  }

  @Delete(':id')
  @RequirePermissions('customers.delete')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return successResponse(null, 'Customer deleted');
  }
}
