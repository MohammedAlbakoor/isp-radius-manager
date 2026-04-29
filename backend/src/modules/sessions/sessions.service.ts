import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MikrotikService } from '../mikrotik/mikrotik.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { decrypt } from '../../common/utils/encryption.util';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    private prisma: PrismaService,
    private mikrotik: MikrotikService,
  ) {}

  async getActiveSessions(query: PaginationDto) {
    const { search } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { acctstoptime: null };
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { framedipaddress: { contains: search } },
        { nasipaddress: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.radacct.findMany({
        where,
        skip,
        take: limit,
        orderBy: { acctstarttime: 'desc' },
      }),
      this.prisma.radacct.count({ where }),
    ]);

    const enriched = await Promise.all(
      data.map(async (session) => {
        const account = await this.prisma.internetAccount.findUnique({
          where: { username: session.username },
          include: { customer: true, package: true, router: true },
        });

        return {
          ...session,
          acctinputoctets: session.acctinputoctets?.toString(),
          acctoutputoctets: session.acctoutputoctets?.toString(),
          radacctid: session.radacctid.toString(),
          customerName: account?.customer?.fullName,
          packageName: account?.package?.name,
          routerName: account?.router?.name,
        };
      }),
    );

    return { data: enriched, total, page, limit };
  }

  async getSessionHistory(query: PaginationDto & { username?: string }) {
    const { search, username } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (username) where.username = username;
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { nasipaddress: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.radacct.findMany({
        where,
        skip,
        take: limit,
        orderBy: { acctstarttime: 'desc' },
      }),
      this.prisma.radacct.count({ where }),
    ]);

    const serialized = data.map((s) => ({
      ...s,
      radacctid: s.radacctid.toString(),
      acctinputoctets: s.acctinputoctets?.toString(),
      acctoutputoctets: s.acctoutputoctets?.toString(),
    }));

    return { data: serialized, total, page, limit };
  }

  async disconnectSession(sessionId: string) {
    const session = await this.prisma.radacct.findFirst({
      where: { acctuniqueid: sessionId, acctstoptime: null },
    });

    if (!session) throw new NotFoundException('Active session not found');

    const router = await this.prisma.router.findFirst({
      where: { nasIp: session.nasipaddress },
    });

    if (!router) {
      this.logger.warn(`Router not found for NAS IP ${session.nasipaddress}`);
      throw new NotFoundException('Router not found for this session');
    }

    const account = await this.prisma.internetAccount.findUnique({
      where: { username: session.username },
    });

    const apiPassword = router.apiPasswordEncrypted
      ? decrypt(router.apiPasswordEncrypted)
      : '';

    await this.mikrotik.disconnectUser(
      router.apiHost || router.nasIp,
      router.apiPort,
      router.apiUsername || 'admin',
      apiPassword,
      session.username,
      (account?.serviceType as 'pppoe' | 'hotspot') || 'pppoe',
    );

    return { message: 'Disconnect command sent' };
  }
}
