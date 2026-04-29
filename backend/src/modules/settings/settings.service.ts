import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.systemSetting.findMany();
  }

  async get(key: string) {
    return this.prisma.systemSetting.findUnique({ where: { key } });
  }

  async set(key: string, value: unknown, updatedById?: string) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      update: { value: value as any, updatedById },
      create: { key, value: value as any, updatedById },
    });
  }

  async updateMultiple(settings: Record<string, unknown>, updatedById?: string) {
    const operations = Object.entries(settings).map(([key, value]) =>
      this.prisma.systemSetting.upsert({
        where: { key },
        update: { value: value as any, updatedById },
        create: { key, value: value as any, updatedById },
      }),
    );
    return this.prisma.$transaction(operations);
  }
}
