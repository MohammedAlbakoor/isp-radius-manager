import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { successResponse } from '../../common/utils/response.util';

@ApiTags('System')
@Controller('system')
export class SystemHealthController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return successResponse({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      });
    } catch {
      return {
        success: false,
        data: { status: 'unhealthy', database: 'disconnected' },
      };
    }
  }

  @Get('version')
  version() {
    return successResponse({
      version: '1.0.0',
      name: 'ISP RADIUS Manager',
    });
  }
}
