import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePackageDto, UpdatePackageDto } from './dto/package.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.package.findMany({
        where,
        skip,
        take: limit,
        include: { _count: { select: { internetAccounts: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.package.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { id },
      include: { _count: { select: { internetAccounts: true } } },
    });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async create(dto: CreatePackageDto) {
    const mikrotikRateLimit =
      dto.mikrotikRateLimit ||
      `${dto.downloadSpeed}${dto.speedUnit || 'M'}/${dto.uploadSpeed}${dto.speedUnit || 'M'}`;

    return this.prisma.package.create({
      data: { ...dto, mikrotikRateLimit },
    });
  }

  async update(id: string, dto: UpdatePackageDto) {
    await this.findOne(id);

    const data: Record<string, unknown> = { ...dto };
    if (dto.downloadSpeed && dto.uploadSpeed) {
      data.mikrotikRateLimit =
        dto.mikrotikRateLimit ||
        `${dto.downloadSpeed}${dto.speedUnit || 'M'}/${dto.uploadSpeed}${dto.speedUnit || 'M'}`;
    }

    return this.prisma.package.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.package.update({
      where: { id },
      data: { status: 'inactive' },
    });
  }

  async syncToRadiusGroup(packageId: string) {
    const pkg = await this.findOne(packageId);
    const groupname = `pkg_${pkg.name.toLowerCase().replace(/\s+/g, '_')}`;

    await this.prisma.radgroupreply.deleteMany({ where: { groupname } });

    await this.prisma.radgroupreply.createMany({
      data: [
        {
          groupname,
          attribute: 'Mikrotik-Rate-Limit',
          op: ':=',
          value: pkg.mikrotikRateLimit,
        },
      ],
    });

    return groupname;
  }
}
