import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RadiusSyncService } from '../modules/radius/radius-sync.service';

@Injectable()
export class RadiusSyncJob {
  private readonly logger = new Logger(RadiusSyncJob.name);

  constructor(private radiusSync: RadiusSyncService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async syncAll() {
    this.logger.log('Starting RADIUS sync job...');
    const result = await this.radiusSync.syncAllAccounts();
    this.logger.log(`RADIUS sync completed: ${result.synced} synced, ${result.failed} failed`);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async syncNas() {
    this.logger.log('Starting NAS sync job...');
    await this.radiusSync.syncNas();
    this.logger.log('NAS sync completed');
  }
}
