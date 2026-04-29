import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { customerId?: string; status?: string }) {
    const {  customerId, status } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: true,
          internetAccount: true,
          subscription: true,
          receivedBy: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        customer: true,
        internetAccount: true,
        subscription: true,
        receivedBy: true,
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async create(dto: CreatePaymentDto, receivedById?: string) {
    return this.prisma.payment.create({
      data: {
        customerId: dto.customerId,
        internetAccountId: dto.internetAccountId,
        subscriptionId: dto.subscriptionId,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        method: dto.method,
        status: 'paid',
        paidAt: new Date(),
        reference: dto.reference,
        receivedById,
        notes: dto.notes,
      },
      include: { customer: true },
    });
  }

  async refund(id: string) {
    const payment = await this.findOne(id);
    if (payment.status === 'refunded') {
      throw new NotFoundException('Payment already refunded');
    }

    return this.prisma.payment.update({
      where: { id },
      data: { status: 'refunded' },
    });
  }
}
