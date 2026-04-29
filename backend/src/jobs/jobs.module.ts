import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SubscriptionExpirationJob } from './subscription-expiration.job';
import { RadiusSyncJob } from './radius-sync.job';
import { RouterHealthJob } from './router-health.job';
import { RadiusModule } from '../modules/radius/radius.module';
import { MikrotikModule } from '../modules/mikrotik/mikrotik.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';

@Module({
  imports: [ScheduleModule.forRoot(), RadiusModule, MikrotikModule, NotificationsModule],
  providers: [SubscriptionExpirationJob, RadiusSyncJob, RouterHealthJob],
})
export class JobsModule {}
