import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async createNotification(data: {
    type: 'subscription_expiring' | 'subscription_expired' | 'payment_received' | 'router_down' | 'system_alert';
    recipientType: 'admin' | 'customer';
    recipientId?: string;
    title: string;
    message: string;
    channel?: 'dashboard' | 'sms' | 'email' | 'whatsapp';
  }) {
    return this.prisma.notification.create({
      data: {
        type: data.type,
        recipientType: data.recipientType,
        recipientId: data.recipientId,
        title: data.title,
        message: data.message,
        channel: data.channel || 'dashboard',
      },
    });
  }

  async getUnread(recipientId: string) {
    return this.prisma.notification.findMany({
      where: { recipientId, status: { in: ['pending', 'sent'] } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { status: 'read' },
    });
  }
}
