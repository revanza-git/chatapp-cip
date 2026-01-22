import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ACTION_VIEW, RESOURCE_DOCUMENT, RESOURCE_SYSTEM, RESOURCE_USER } from '../config/constants';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logActivity(params: {
    userId: number;
    action: string;
    resourceType: string;
    resourceId?: number | null;
    resourceName?: string | null;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    if (!this.prisma) {
      return;
    }

    if (process.env.SKIP_DATABASE === 'true') {
      return;
    }

    await this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action as any,
        resourceType: params.resourceType as any,
        resourceId: params.resourceId ?? null,
        resourceName: params.resourceName ?? null,
        details: params.details ?? null,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null
      }
    });
  }

  async logDocumentActivity(params: {
    userId: number;
    action: string;
    documentId?: number | null;
    documentName?: string | null;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    return this.logActivity({
      userId: params.userId,
      action: params.action,
      resourceType: RESOURCE_DOCUMENT,
      resourceId: params.documentId ?? null,
      resourceName: params.documentName ?? null,
      details: params.details ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null
    });
  }

  async logUserActivity(params: {
    userId: number;
    action: string;
    targetUserId?: number | null;
    targetUserName?: string | null;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    return this.logActivity({
      userId: params.userId,
      action: params.action,
      resourceType: RESOURCE_USER,
      resourceId: params.targetUserId ?? null,
      resourceName: params.targetUserName ?? null,
      details: params.details ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null
    });
  }

  async logSystemActivity(params: {
    userId: number;
    action: string;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    return this.logActivity({
      userId: params.userId,
      action: params.action,
      resourceType: RESOURCE_SYSTEM,
      details: params.details ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null
    });
  }

  async logViewActivity(userId: number, details: string, ipAddress?: string, userAgent?: string) {
    return this.logSystemActivity({
      userId,
      action: ACTION_VIEW,
      details,
      ipAddress,
      userAgent
    });
  }
}
