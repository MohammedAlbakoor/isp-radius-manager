import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RadiusSyncService } from '../radius/radius-sync.service';
import { CreateInternetAccountDto, UpdateInternetAccountDto } from './dto/internet-account.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { encrypt } from '../../common/utils/encryption.util';

@Injectable()
export class InternetAccountsService {
  constructor(
    private prisma: PrismaService,
    private radiusSync: RadiusSyncService,
  ) {}

  async findAll(query: PaginationDto & { status?: string; customerId?: string }) {
    const { page = 1, limit = 20, search, status, customerId } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { customer: { fullName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.internetAccount.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: true,
          package: true,
          router: true,
          branch: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.internetAccount.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const account = await this.prisma.internetAccount.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        package: true,
        router: true,
        branch: true,
        subscriptions: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!account) throw new NotFoundException('Internet account not found');
    return account;
  }

  async create(dto: CreateInternetAccountDto) {
    const existing = await this.prisma.internetAccount.findUnique({
      where: { username: dto.username },
    });
    if (existing) throw new ConflictException('Username already exists');

    const account = await this.prisma.internetAccount.create({
      data: {
        ...dto,
        passwordEncrypted: encrypt(dto.password),
      },
      include: { customer: true, package: true },
    });

    await this.radiusSync.syncAccount(account.id);

    return account;
  }

  async update(id: string, dto: UpdateInternetAccountDto) {
    await this.findOne(id);

    const data: Record<string, unknown> = { ...dto };
    if (dto.password) {
      data.passwordEncrypted = encrypt(dto.password);
      delete data.password;
    }

    const account = await this.prisma.internetAccount.update({
      where: { id },
      data,
      include: { customer: true, package: true },
    });

    await this.radiusSync.syncAccount(account.id);

    return account;
  }

  async activate(id: string) {
    const account = await this.findOne(id);
    if (account.status === 'active') {
      throw new BadRequestException('Account is already active');
    }

    await this.prisma.internetAccount.update({
      where: { id },
      data: { status: 'active' },
    });

    await this.radiusSync.syncAccount(id);
    return this.findOne(id);
  }

  async suspend(id: string) {
    await this.findOne(id);
    await this.prisma.internetAccount.update({
      where: { id },
      data: { status: 'suspended' },
    });
    await this.radiusSync.removeAccount(id);
    return this.findOne(id);
  }

  async disable(id: string) {
    await this.findOne(id);
    await this.prisma.internetAccount.update({
      where: { id },
      data: { status: 'disabled' },
    });
    await this.radiusSync.removeAccount(id);
    return this.findOne(id);
  }

  async resetPassword(id: string, newPassword: string) {
    await this.findOne(id);
    await this.prisma.internetAccount.update({
      where: { id },
      data: { passwordEncrypted: encrypt(newPassword) },
    });
    await this.radiusSync.syncAccount(id);
  }

  async changePackage(id: string, packageId: string) {
    await this.findOne(id);
    await this.prisma.internetAccount.update({
      where: { id },
      data: { packageId },
    });
    await this.radiusSync.syncAccount(id);
    return this.findOne(id);
  }

  async getSessions(id: string) {
    const account = await this.findOne(id);
    return this.prisma.radacct.findMany({
      where: { username: account.username },
      orderBy: { acctstarttime: 'desc' },
      take: 50,
    });
  }

  async getUsage(id: string) {
    const account = await this.findOne(id);
    const usage = await this.prisma.radacct.aggregate({
      where: { username: account.username },
      _sum: {
        acctinputoctets: true,
        acctoutputoctets: true,
        acctsessiontime: true,
      },
      _count: true,
    });

    return {
      totalUpload: usage._sum.acctinputoctets || BigInt(0),
      totalDownload: usage._sum.acctoutputoctets || BigInt(0),
      totalSessionTime: usage._sum.acctsessiontime || 0,
      sessionCount: usage._count,
    };
  }
}
