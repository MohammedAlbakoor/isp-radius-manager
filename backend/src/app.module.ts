import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { PackagesModule } from './modules/packages/packages.module';
import { InternetAccountsModule } from './modules/internet-accounts/internet-accounts.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { RoutersModule } from './modules/routers/routers.module';
import { RadiusModule } from './modules/radius/radius.module';
import { MikrotikModule } from './modules/mikrotik/mikrotik.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SystemHealthModule } from './modules/system-health/system-health.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    PrismaModule,
    AuthModule,
    AdminUsersModule,
    CustomersModule,
    PackagesModule,
    InternetAccountsModule,
    SubscriptionsModule,
    PaymentsModule,
    RoutersModule,
    RadiusModule,
    MikrotikModule,
    SessionsModule,
    ReportsModule,
    AuditLogsModule,
    NotificationsModule,
    SettingsModule,
    SystemHealthModule,
    JobsModule,
  ],
})
export class AppModule {}
