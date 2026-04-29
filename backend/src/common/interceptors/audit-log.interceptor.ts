import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (method === 'GET') return next.handle();

    const user = request.user;
    const path = request.route?.path || request.url;

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          const action = this.getAction(method);
          const entityType = this.getEntityType(path);
          const entityId = request.params?.id;

          await this.prisma.auditLog.create({
            data: {
              actorId: user?.id || null,
              action,
              entityType,
              entityId: entityId || null,
              newValues: method !== 'DELETE' ? (request.body || null) : null,
              ipAddress: request.ip || null,
              userAgent: request.headers['user-agent'] || null,
            },
          });
        } catch {
          // Don't fail the request if audit logging fails
        }
      }),
    );
  }

  private getAction(method: string): string {
    const map: Record<string, string> = {
      POST: 'create',
      PATCH: 'update',
      PUT: 'update',
      DELETE: 'delete',
    };
    return map[method] || method.toLowerCase();
  }

  private getEntityType(path: string): string {
    const parts = path.split('/').filter(Boolean);
    return parts[1] || parts[0] || 'unknown';
  }
}
