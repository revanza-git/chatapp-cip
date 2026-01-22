import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { rolesGuardFactory } from '../guards/roles.guard.factory';
import { ROLE_ADMIN, ROLE_IT_SECURITY } from '../config/constants';
import { PrismaService } from '../services/prisma.service';

@Controller('api/audit-logs')
@UseGuards(AuthGuard, rolesGuardFactory([ROLE_ADMIN, ROLE_IT_SECURITY]))
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getAuditLogs(@Query() query: any) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? Math.min(parseInt(query.limit, 10), 200) : 50;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (query.action) where.action = query.action;
    if (query.resource_type) where.resourceType = query.resource_type;
    if (query.user_id) where.userId = parseInt(query.user_id, 10);
    if (query.from) {
      where.createdAt = { ...where.createdAt, gte: new Date(query.from) };
    }
    if (query.to) {
      const toDate = new Date(query.to);
      toDate.setHours(23, 59, 59, 999);
      where.createdAt = { ...where.createdAt, lte: toDate };
    }

    const [total, auditLogs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      })
    ]);

    return {
      audit_logs: auditLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}
