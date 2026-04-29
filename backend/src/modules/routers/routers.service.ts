import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RadiusSyncService } from '../radius/radius-sync.service';
import { MikrotikService } from '../mikrotik/mikrotik.service';
import { CreateRouterDto, UpdateRouterDto } from './dto/router.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { encrypt, decrypt } from '../../common/utils/encryption.util';

@Injectable()
export class RoutersService {
  constructor(
    private prisma: PrismaService,
    private radiusSync: RadiusSyncService,
    private mikrotik: MikrotikService,
  ) {}

  async findAll(query: PaginationDto) {
    const {  search } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { nasIp: { contains: search } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.router.findMany({
        where,
        skip,
        take: limit,
        include: {
          branch: true,
          _count: { select: { internetAccounts: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.router.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const router = await this.prisma.router.findUnique({
      where: { id },
      include: {
        branch: true,
        _count: { select: { internetAccounts: true } },
      },
    });
    if (!router) throw new NotFoundException('Router not found');
    return router;
  }

  async create(dto: CreateRouterDto) {
    const router = await this.prisma.router.create({
      data: {
        name: dto.name,
        branchId: dto.branchId,
        nasIp: dto.nasIp,
        apiHost: dto.apiHost || dto.nasIp,
        apiPort: dto.apiPort || 8728,
        restEnabled: dto.restEnabled || false,
        restPort: dto.restPort || 443,
        radiusSecretEncrypted: encrypt(dto.radiusSecret),
        apiUsername: dto.apiUsername,
        apiPasswordEncrypted: dto.apiPassword ? encrypt(dto.apiPassword) : null,
        location: dto.location,
        notes: dto.notes,
      },
    });

    await this.radiusSync.syncNas();
    return router;
  }

  async update(id: string, dto: UpdateRouterDto) {
    await this.findOne(id);

    const data: Record<string, unknown> = {};
    if (dto.name) data.name = dto.name;
    if (dto.branchId !== undefined) data.branchId = dto.branchId;
    if (dto.nasIp) data.nasIp = dto.nasIp;
    if (dto.apiHost) data.apiHost = dto.apiHost;
    if (dto.apiPort) data.apiPort = dto.apiPort;
    if (dto.apiUsername) data.apiUsername = dto.apiUsername;
    if (dto.apiPassword) data.apiPasswordEncrypted = encrypt(dto.apiPassword);
    if (dto.radiusSecret) data.radiusSecretEncrypted = encrypt(dto.radiusSecret);
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.status) data.status = dto.status;

    const router = await this.prisma.router.update({ where: { id }, data });
    await this.radiusSync.syncNas();
    return router;
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.router.update({
      where: { id },
      data: { status: 'inactive' },
    });
    await this.radiusSync.syncNas();
  }

  async testConnection(id: string) {
    const router = await this.findOne(id);
    const apiPassword = router.apiPasswordEncrypted
      ? decrypt(router.apiPasswordEncrypted)
      : '';

    try {
      const result = await this.mikrotik.testConnection(
        router.apiHost || router.nasIp,
        router.apiPort,
        router.apiUsername || 'admin',
        apiPassword,
      );

      await this.prisma.router.update({
        where: { id },
        data: { lastSeenAt: new Date(), status: 'active' },
      });

      return result;
    } catch (error) {
      await this.prisma.router.update({
        where: { id },
        data: { status: 'unreachable' },
      });
      throw error;
    }
  }

  getSetupCommands(router: { nasIp: string; name: string }) {
    const radiusIp = process.env.RADIUS_SERVER_IP || '10.0.0.1';

    return {
      pppoe: [
        `/radius add service=ppp address=${radiusIp} secret=YOUR_SECRET authentication-port=1812 accounting-port=1813`,
        `/ppp profile set default use-radius=yes`,
        `/ppp aaa set use-radius=yes accounting=yes interim-update=5m`,
      ],
      hotspot: [
        `/radius add service=hotspot address=${radiusIp} secret=YOUR_SECRET authentication-port=1812 accounting-port=1813`,
        `/ip hotspot profile set default use-radius=yes`,
      ],
      general: [
        `# Router: ${router.name}`,
        `# NAS IP: ${router.nasIp}`,
        `# RADIUS Server: ${radiusIp}`,
        `# Remember to replace YOUR_SECRET with the actual RADIUS secret`,
      ],
    };
  }
}
