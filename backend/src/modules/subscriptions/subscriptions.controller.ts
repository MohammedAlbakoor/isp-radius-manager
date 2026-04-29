import {
  Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/subscription.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse, paginatedResponse } from '../../common/utils/response.util';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private service: SubscriptionsService) {}

  @Get()
  @RequirePermissions('subscriptions.read')
  async findAll(@Query() query: PaginationDto & { status?: string }) {
    const result = await this.service.findAll(query);
    return paginatedResponse(result.data, result.total, result.page, result.limit);
  }

  @Post()
  @RequirePermissions('subscriptions.create')
  async create(@Body() dto: CreateSubscriptionDto, @CurrentUser('id') userId: string) {
    return successResponse(await this.service.create(dto, userId), 'Subscription created');
  }

  @Post(':id/renew')
  @RequirePermissions('subscriptions.create')
  async renew(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return successResponse(await this.service.renew(id, userId), 'Subscription renewed');
  }

  @Post(':id/cancel')
  @RequirePermissions('subscriptions.update')
  async cancel(@Param('id') id: string) {
    return successResponse(await this.service.cancel(id), 'Subscription cancelled');
  }
}
