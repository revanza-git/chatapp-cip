import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { PrismaService } from '../services/prisma.service';
import { hashPassword, checkPassword } from '../services/auth.utils';

@Controller('api')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('profile')
  async getProfile(@Req() req: any) {
    return { user: this.toUserInfo(req.user) };
  }

  @Put('profile')
  async updateProfile(@Req() req: any, @Body() body: { first_name?: string; last_name?: string; email?: string }) {
    const updates: any = {};
    if (body.first_name) updates.firstName = body.first_name;
    if (body.last_name) updates.lastName = body.last_name;
    if (body.email) updates.email = body.email;

    const user = await this.prisma.user.update({
      where: { id: req.user.id },
      data: updates
    });

    return { user: this.toUserInfo(user) };
  }

  @Post('change-password')
  async changePassword(@Req() req: any, @Body() body: { current_password: string; new_password: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return { error: 'User not found' };
    }

    const passwordValid = await checkPassword(body.current_password, user.password);
    if (!passwordValid) {
      return { error: 'Current password is incorrect' };
    }

    const hashedPassword = await hashPassword(body.new_password);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return { message: 'Password changed successfully' };
  }

  private toUserInfo(user: any) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.firstName || user.first_name,
      last_name: user.lastName || user.last_name,
      role: user.role,
      is_active: user.isActive || user.is_active,
      last_login: user.lastLogin || user.last_login,
      created_at: user.createdAt || user.created_at
    };
  }
}
