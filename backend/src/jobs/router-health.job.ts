import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MikrotikService } from '../modules/mikrotik/mikrotik.service';
import { NotificationsService } from '../modules/notifications/notifications.service';
import { decrypt } from '../common/utils/encryption.util';

@Injectable()
export class RouterHealthJob {
  private readonly logger = new Logger(RouterHealthJob.name);

  constructor(
    private prisma: PrismaService,
    private mikrotik: MikrotikService,
    private notifications: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkRouterHealth() {
    const routers = await this.prisma.router.findMany({
      where: { status: { in: ['active', 'unreachable'] } },
    });

    for (const router of routers) {
      try {
        const apiPassword = router.apiPasswordEncrypted
          ? decrypt(router.apiPasswordEncrypted)
          : '';

        await this.mikrotik.testConnection(
          router.apiHost || router.nasIp,
          router.apiPort,
          router.apiUsername || 'admin',
          apiPassword,
        );

        const wasUnreachable = router.status === 'unreachable';

        await this.prisma.router.update({
          where: { id: router.id },
          data: { lastSeenAt: new Date(), status: 'active' },
        });

        if (wasUnreachable) {
          await this.notifications.createNotification({
            type: 'system_alert',
            recipientType: 'admin',
            title: 'راوتر عاد للعمل',
            message: `الراوتر ${router.name} (${router.nasIp}) عاد للعمل`,
          });
        }
      } catch {
        const wasActive = router.status === 'active';

        await this.prisma.router.update({
          where: { id: router.id },
          data: { status: 'unreachable' },
        });

        if (wasActive) {
          await this.notifications.createNotification({
            type: 'router_down',
            recipientType: 'admin',
            title: 'راوتر غير متصل',
            message: `الراوتر ${router.name} (${router.nasIp}) غير متصل`,
          });
        }
      }
    }
  }
}
