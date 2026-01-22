import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyJwt } from '../services/auth.utils';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] as string | undefined;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    try {
      const payload = verifyJwt(token);
      const user = await this.prisma.user.findFirst({
        where: { id: payload.userId, isActive: true }
      });

      if (!user) {
        throw new UnauthorizedException('User not found or inactive');
      }

      request.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        is_active: user.isActive,
        last_login: user.lastLogin,
        created_at: user.createdAt
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
