import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalCustomers,
      activeAccounts,
      suspendedAccounts,
      expiredAccounts,
      activeSubscriptions,
      expiringToday,
      onlineUsers,
      totalRouters,
      activeRouters,
      recentPayments,
    ] = await Promise.all([
      this.prisma.customer.count({ where: { deletedAt: null } }),
      this.prisma.internetAccount.count({ where: { status: 'active', deletedAt: null } }),
      this.prisma.internetAccount.count({ where: { status: 'suspended', deletedAt: null } }),
      this.prisma.internetAccount.count({ where: { status: 'expired', deletedAt: null } }),
      this.prisma.subscription.count({ where: { status: 'active' } }),
      this.prisma.subscription.count({
        where: {
          status: 'active',
          endsAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.radacct.count({ where: { acctstoptime: null } }),
      this.prisma.router.count(),
      this.prisma.router.count({ where: { status: 'active' } }),
      this.prisma.payment.aggregate({
        where: {
          status: 'paid',
          paidAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      customers: { total: totalCustomers },
      accounts: {
        active: activeAccounts,
        suspended: suspendedAccounts,
        expired: expiredAccounts,
      },
      subscriptions: {
        active: activeSubscriptions,
        expiringToday,
      },
      sessions: { online: onlineUsers },
      routers: { total: totalRouters, active: activeRouters },
      revenue: {
        last30Days: recentPayments._sum.amount || 0,
        transactionCount: recentPayments._count,
      },
    };
  }

  async getRevenueReport(period: 'day' | 'week' | 'month' = 'month') {
    const periodMs = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    };

    const since = new Date(Date.now() - periodMs[period]);

    const payments = await this.prisma.payment.findMany({
      where: { status: 'paid', paidAt: { gte: since } },
      include: { customer: true, receivedBy: true },
      orderBy: { paidAt: 'desc' },
    });

    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return { payments, total, period, since };
  }

  async getUsageReport() {
    const topUsers = await this.prisma.radacct.groupBy({
      by: ['username'],
      _sum: {
        acctinputoctets: true,
        acctoutputoctets: true,
        acctsessiontime: true,
      },
      _count: true,
      orderBy: { _sum: { acctoutputoctets: 'desc' } },
      take: 20,
    });

    return topUsers.map((u) => ({
      username: u.username,
      totalUpload: u._sum.acctinputoctets?.toString() || '0',
      totalDownload: u._sum.acctoutputoctets?.toString() || '0',
      totalSessionTime: u._sum.acctsessiontime || 0,
      sessionCount: u._count,
    }));
  }

  async getExpiredSubscriptions() {
    return this.prisma.subscription.findMany({
      where: { status: 'expired' },
      include: {
        internetAccount: { include: { customer: true } },
        package: true,
      },
      orderBy: { endsAt: 'desc' },
      take: 100,
    });
  }

  async getRouterHealth() {
    return this.prisma.router.findMany({
      include: {
        branch: true,
        _count: { select: { internetAccounts: true } },
      },
      orderBy: { lastSeenAt: 'desc' },
    });
  }
}
