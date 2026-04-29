import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { decrypt } from '../../common/utils/encryption.util';

@Injectable()
export class RadiusSyncService {
  private readonly logger = new Logger(RadiusSyncService.name);

  constructor(private prisma: PrismaService) {}

  async syncAccount(accountId: string): Promise<void> {
    const account = await this.prisma.internetAccount.findUnique({
      where: { id: accountId },
      include: { package: true, customer: true },
    });

    if (!account) {
      this.logger.warn(`Account ${accountId} not found for RADIUS sync`);
      return;
    }

    if (account.status !== 'active') {
      await this.removeAccount(accountId);
      return;
    }

    const activeSubscription = await this.prisma.subscription.findFirst({
      where: {
        internetAccountId: accountId,
        status: 'active',
        endsAt: { gt: new Date() },
      },
    });

    if (!activeSubscription) {
      await this.removeAccount(accountId);
      return;
    }

    try {
      const password = decrypt(account.passwordEncrypted);

      await this.prisma.$transaction(async (tx) => {
        // Sync radcheck - password
        await tx.radcheck.deleteMany({ where: { username: account.username } });
        const radcheckEntries = [
          {
            username: account.username,
            attribute: 'Cleartext-Password',
            op: ':=',
            value: password,
          },
        ];

        if (account.allowedSimultaneousSessions > 0) {
          radcheckEntries.push({
            username: account.username,
            attribute: 'Simultaneous-Use',
            op: ':=',
            value: String(account.allowedSimultaneousSessions),
          });
        }

        await tx.radcheck.createMany({ data: radcheckEntries });

        // Sync radreply - user-specific attributes
        await tx.radreply.deleteMany({ where: { username: account.username } });
        const radreplyEntries: Array<{
          username: string;
          attribute: string;
          op: string;
          value: string;
        }> = [];

        if (account.staticIp) {
          radreplyEntries.push({
            username: account.username,
            attribute: 'Framed-IP-Address',
            op: ':=',
            value: account.staticIp,
          });
        }

        // Calculate session timeout based on subscription end
        const remainingSeconds = Math.floor(
          (activeSubscription.endsAt.getTime() - Date.now()) / 1000,
        );
        if (remainingSeconds > 0) {
          radreplyEntries.push({
            username: account.username,
            attribute: 'Session-Timeout',
            op: ':=',
            value: String(Math.min(remainingSeconds, 86400)), // max 24h
          });
        }

        if (radreplyEntries.length > 0) {
          await tx.radreply.createMany({ data: radreplyEntries });
        }

        // Sync radusergroup
        await tx.radusergroup.deleteMany({ where: { username: account.username } });
        const groupname = `pkg_${account.package.name.toLowerCase().replace(/\s+/g, '_')}`;
        await tx.radusergroup.create({
          data: {
            username: account.username,
            groupname,
            priority: 1,
          },
        });

        // Ensure group reply exists
        const existingGroupReply = await tx.radgroupreply.findFirst({
          where: { groupname, attribute: 'Mikrotik-Rate-Limit' },
        });

        if (!existingGroupReply) {
          await tx.radgroupreply.create({
            data: {
              groupname,
              attribute: 'Mikrotik-Rate-Limit',
              op: ':=',
              value: account.package.mikrotikRateLimit,
            },
          });
        }
      });

      this.logger.log(`RADIUS sync completed for ${account.username}`);
    } catch (error) {
      this.logger.error(`RADIUS sync failed for ${account.username}`, error);
      throw error;
    }
  }

  async removeAccount(accountId: string): Promise<void> {
    const account = await this.prisma.internetAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.radcheck.deleteMany({ where: { username: account.username } });
      await tx.radreply.deleteMany({ where: { username: account.username } });
      await tx.radusergroup.deleteMany({ where: { username: account.username } });
    });

    this.logger.log(`RADIUS entries removed for ${account.username}`);
  }

  async syncAllAccounts(): Promise<{ synced: number; failed: number }> {
    const accounts = await this.prisma.internetAccount.findMany({
      where: { status: 'active', deletedAt: null },
    });

    let synced = 0;
    let failed = 0;

    for (const account of accounts) {
      try {
        await this.syncAccount(account.id);
        synced++;
      } catch {
        failed++;
      }
    }

    return { synced, failed };
  }

  async syncNas(): Promise<void> {
    const routers = await this.prisma.router.findMany({
      where: { status: 'active' },
    });

    await this.prisma.nas.deleteMany({});

    for (const router of routers) {
      try {
        const secret = decrypt(router.radiusSecretEncrypted);
        await this.prisma.nas.create({
          data: {
            nasname: router.nasIp,
            shortname: router.name,
            type: 'other',
            secret,
            description: router.location || router.name,
          },
        });
      } catch (error) {
        this.logger.error(`NAS sync failed for router ${router.name}`, error);
      }
    }
  }
}
