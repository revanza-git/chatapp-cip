import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuditService } from './audit.service';
import { ACTION_UPDATE, ACTION_DELETE } from '../config/constants';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly auditService: AuditService) {}

  async getAllUsers() {
    return this.prisma.user.findMany();
  }

  async updateUser(userId: number, updates: { first_name?: string; last_name?: string; email?: string; is_active?: boolean }, actorId: number) {
    const data: any = {};
    if (updates.first_name) data.firstName = updates.first_name;
    if (updates.last_name) data.lastName = updates.last_name;
    if (updates.email) data.email = updates.email;
    if (typeof updates.is_active === 'boolean') data.isActive = updates.is_active;

    await this.prisma.user.update({
      where: { id: userId },
      data
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (user) {
      await this.auditService.logUserActivity({
        userId: actorId,
        action: ACTION_UPDATE,
        targetUserId: user.id,
        targetUserName: user.username,
        details: `Updated user details for ${user.firstName} ${user.lastName} (ID: ${user.id})`
      });
    }

    return user;
  }

  async updateUserRole(userId: number, role: string, actorId: number) {
    const validRoles = ['user', 'admin', 'hr', 'it_security'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException('Invalid role');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any }
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await this.auditService.logUserActivity({
        userId: actorId,
        action: ACTION_UPDATE,
        targetUserId: user.id,
        targetUserName: user.username,
        details: `Changed role to '${role}' for user ${user.firstName} ${user.lastName} (ID: ${user.id})`
      });
    }

    return user;
  }

  async deactivateUser(userId: number, actorId: number) {
    if (userId === actorId) {
      throw new BadRequestException('Cannot delete your own account');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });

    if (user) {
      await this.auditService.logUserActivity({
        userId: actorId,
        action: ACTION_DELETE,
        targetUserId: user.id,
        targetUserName: user.username,
        details: `Deactivated user ${user.firstName} ${user.lastName} (ID: ${user.id})`
      });
    }

    return { message: 'User deactivated successfully' };
  }
}
