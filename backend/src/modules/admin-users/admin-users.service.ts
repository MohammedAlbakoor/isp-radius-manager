import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdminUserDto, UpdateAdminUserDto } from './dto/admin-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AdminUsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    const {  search } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' as const } },
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.adminUser.findMany({
        where,
        skip,
        take: limit,
        include: {
          userRoles: { include: { role: true } },
          branch: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.adminUser.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: {
              include: { rolePermissions: { include: { permission: true } } },
            },
          },
        },
        branch: true,
      },
    });
    if (!user) throw new NotFoundException('Admin user not found');
    return user;
  }

  async create(dto: CreateAdminUserDto) {
    const existing = await this.prisma.adminUser.findFirst({
      where: { OR: [{ username: dto.username }, { email: dto.email }] },
    });
    if (existing) throw new ConflictException('Username or email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.adminUser.create({
        data: {
          username: dto.username,
          email: dto.email,
          fullName: dto.fullName,
          passwordHash,
          branchId: dto.branchId,
        },
      });

      if (dto.roleIds?.length) {
        await tx.userRole.createMany({
          data: dto.roleIds.map((roleId) => ({
            userId: user.id,
            roleId,
          })),
        });
      }

      return this.findOne(user.id);
    });
  }

  async update(id: string, dto: UpdateAdminUserDto) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = {};
      if (dto.fullName) updateData.fullName = dto.fullName;
      if (dto.email) updateData.email = dto.email;
      if (dto.branchId !== undefined) updateData.branchId = dto.branchId;
      if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
      if (dto.password) updateData.passwordHash = await bcrypt.hash(dto.password, 12);

      await tx.adminUser.update({ where: { id }, data: updateData });

      if (dto.roleIds) {
        await tx.userRole.deleteMany({ where: { userId: id } });
        if (dto.roleIds.length) {
          await tx.userRole.createMany({
            data: dto.roleIds.map((roleId) => ({ userId: id, roleId })),
          });
        }
      }

      return this.findOne(id);
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.adminUser.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
