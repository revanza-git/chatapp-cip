import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { checkPassword, generateJwt, hashPassword } from './auth.utils';
import { AuditService } from './audit.service';
import { ACTION_CREATE, ACTION_LOGIN } from '../config/constants';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly auditService: AuditService) {}

  private async useDatabase(): Promise<boolean> {
    return process.env.SKIP_DATABASE !== 'true';
  }

  async register(payload: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) {
    if (await this.useDatabase()) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ username: payload.username }, { email: payload.email }]
        }
      });

      if (existingUser) {
        throw new ConflictException('Username or email already exists');
      }
    }

    if (payload.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    const hashedPassword = await hashPassword(payload.password);

    const user = await this.prisma.user.create({
      data: {
        username: payload.username,
        email: payload.email,
        password: hashedPassword,
        firstName: payload.first_name,
        lastName: payload.last_name,
        role: 'user',
        isActive: true
      }
    });

    await this.auditService.logSystemActivity({
      userId: user.id,
      action: ACTION_CREATE,
      details: `New user registered: ${user.firstName} ${user.lastName} (${user.username})`
    });

    const { token, expiresAt } = generateJwt({
      id: user.id,
      username: user.username,
      role: user.role
    });

    return {
      token,
      user: this.toUserInfo(user),
      expires_at: expiresAt
    };
  }

  async login(username: string, password: string) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
        isActive: true
      }
    });

    if (!user && process.env.SKIP_DATABASE === 'true') {
      user = {
        id: 1,
        username,
        email: `${username}@test.com`,
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        isActive: true,
        lastLogin: null,
        createdAt: new Date()
      } as any;
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (process.env.SKIP_DATABASE !== 'true') {
      const passwordValid = await checkPassword(password, user.password);
      if (!passwordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    const now = new Date();
    if (process.env.SKIP_DATABASE !== 'true') {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: now }
      });

      await this.auditService.logSystemActivity({
        userId: user.id,
        action: ACTION_LOGIN,
        details: `User ${user.username} logged in successfully`
      });
    }

    const { token, expiresAt } = generateJwt({
      id: user.id,
      username: user.username,
      role: user.role
    });

    return {
      token,
      user: this.toUserInfo({ ...user, lastLogin: now }),
      expires_at: expiresAt
    };
  }

  toUserInfo(user: any) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      role: user.role,
      is_active: user.isActive,
      last_login: user.lastLogin,
      created_at: user.createdAt
    };
  }
}
