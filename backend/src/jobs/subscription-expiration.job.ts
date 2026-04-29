import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RadiusSyncService } from '../modules/radius/radius-sync.service';
import { NotificationsService } from '../modules/notifications/notifications.service';

@Injectable()
export class SubscriptionExpirationJob {
  private readonly logger = new Logger(SubscriptionExpirationJob.name);

  constructor(
    private prisma: PrismaService,
    private radiusSync: RadiusSyncService,
    private notifications: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredSubscriptions() {
    this.logger.log('Checking for expired subscriptions...');

    const expiredSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'active',
        endsAt: { lte: new Date() },
      },
      include: {
        internetAccount: { include: { customer: true } },
      },
    });

    for (const sub of expiredSubscriptions) {
      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.subscription.update({
            where: { id: sub.id },
            data: { status: 'expired' },
          });

          const hasActiveSub = await tx.subscription.findFirst({
            where: {
              internetAccountId: sub.internetAccountId,
              status: 'active',
              endsAt: { gt: new Date() },
              id: { not: sub.id },
            },
          });

          if (!hasActiveSub) {
            await tx.internetAccount.update({
              where: { id: sub.internetAccountId },
              data: { status: 'expired' },
            });
          }
        });

        await this.radiusSync.removeAccount(sub.internetAccountId);

        await this.notifications.createNotification({
          type: 'subscription_expired',
          recipientType: 'admin',
          title: 'اشتراك منتهي',
          message: `انتهى اشتراك ${sub.internetAccount.customer.fullName} (${sub.internetAccount.username})`,
        });

        this.logger.log(`Expired subscription for ${sub.internetAccount.username}`);
      } catch (error) {
        this.logger.error(`Failed to expire subscription ${sub.id}`, error);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async notifyExpiringSubscriptions() {
    this.logger.log('Checking for expiring subscriptions...');

    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const expiringSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'active',
        endsAt: {
          gt: new Date(),
          lte: threeDaysFromNow,
        },
      },
      include: {
        internetAccount: { include: { customer: true } },
        package: true,
      },
    });

    for (const sub of expiringSubscriptions) {
      try {
        const daysLeft = Math.ceil(
          (sub.endsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000),
        );

        await this.notifications.createNotification({
          type: 'subscription_expiring',
          recipientType: 'admin',
          title: 'اشتراك قارب على الانتهاء',
          message: `اشتراك ${sub.internetAccount.customer.fullName} سينتهي خلال ${daysLeft} يوم`,
        });
      } catch (error) {
        this.logger.error(`Failed notification for sub ${sub.id}`, error);
      }
    }
  }
}
