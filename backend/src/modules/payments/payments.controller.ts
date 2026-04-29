import {
  Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse, paginatedResponse } from '../../common/utils/response.util';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @Get()
  @RequirePermissions('payments.read')
  async findAll(@Query() query: PaginationDto & { customerId?: string; status?: string }) {
    const result = await this.service.findAll(query);
    return paginatedResponse(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @RequirePermissions('payments.read')
  async findOne(@Param('id') id: string) {
    return successResponse(await this.service.findOne(id));
  }

  @Post()
  @RequirePermissions('payments.create')
  async create(@Body() dto: CreatePaymentDto, @CurrentUser('id') userId: string) {
    return successResponse(await this.service.create(dto, userId), 'Payment recorded');
  }

  @Post(':id/refund')
  @RequirePermissions('payments.refund')
  async refund(@Param('id') id: string) {
    return successResponse(await this.service.refund(id), 'Payment refunded');
  }
}
