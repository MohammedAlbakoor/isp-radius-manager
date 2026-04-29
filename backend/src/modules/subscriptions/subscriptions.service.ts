import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RadiusSyncService } from '../radius/radius-sync.service';
import { CreateSubscriptionDto } from './dto/subscription.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private radiusSync: RadiusSyncService,
  ) {}

  async findAll(query: PaginationDto & { status?: string }) {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        include: {
          internetAccount: { include: { customer: true } },
          package: true,
          createdBy: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async create(dto: CreateSubscriptionDto, createdById?: string) {
    const account = await this.prisma.internetAccount.findUnique({
      where: { id: dto.internetAccountId },
      include: { package: true },
    });
    if (!account) throw new NotFoundException('Internet account not found');

    const pkg = dto.packageId
      ? await this.prisma.package.findUnique({ where: { id: dto.packageId } })
      : account.package;
    if (!pkg) throw new NotFoundException('Package not found');

    const activeSubscription = await this.prisma.subscription.findFirst({
      where: {
        internetAccountId: dto.internetAccountId,
        status: 'active',
      },
      orderBy: { endsAt: 'desc' },
    });

    let startsAt: Date;
    if (activeSubscription && activeSubscription.endsAt > new Date()) {
      startsAt = activeSubscription.endsAt;
    } else {
      startsAt = new Date();
    }

    const endsAt = new Date(startsAt);
    endsAt.setDate(endsAt.getDate() + pkg.durationDays);

    const subscription = await this.prisma.subscription.create({
      data: {
        internetAccountId: dto.internetAccountId,
        packageId: pkg.id,
        startsAt,
        endsAt,
        status: startsAt <= new Date() ? 'active' : 'pending',
        autoRenew: dto.autoRenew || false,
        createdById,
        notes: dto.notes,
      },
      include: {
        internetAccount: { include: { customer: true } },
        package: true,
      },
    });

    await this.prisma.internetAccount.update({
      where: { id: dto.internetAccountId },
      data: {
        status: 'active',
        expiresAt: endsAt,
        packageId: pkg.id,
      },
    });

    await this.radiusSync.syncAccount(dto.internetAccountId);

    return subscription;
  }

  async renew(id: string, createdById?: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: { internetAccount: true, package: true },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');

    return this.create(
      {
        internetAccountId: subscription.internetAccountId,
        packageId: subscription.packageId,
        autoRenew: subscription.autoRenew,
      },
      createdById,
    );
  }

  async cancel(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');
    if (subscription.status === 'cancelled') {
      throw new BadRequestException('Subscription is already cancelled');
    }

    return this.prisma.subscription.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }
}
