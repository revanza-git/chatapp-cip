import { Body, Controller, Delete, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { AuthGuard } from '../guards/auth.guard';
import { rolesGuardFactory } from '../guards/roles.guard.factory';
import { ROLE_ADMIN, ROLE_IT_SECURITY } from '../config/constants';

@Controller('api/users')
@UseGuards(AuthGuard, rolesGuardFactory([ROLE_ADMIN, ROLE_IT_SECURITY]))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers(@Req() req: any) {
    const users = await this.usersService.getAllUsers();
    return { users: users.map((user: any) => this.toUserInfo(user)) };
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const user = await this.usersService.updateUser(Number(id), body, req.user.id);
    return { user: user ? this.toUserInfo(user) : null };
  }

  @Put(':id/role')
  async updateUserRole(@Param('id') id: string, @Body() body: { role: string }, @Req() req: any) {
    const user = await this.usersService.updateUserRole(Number(id), body.role, req.user.id);
    return { user: user ? this.toUserInfo(user) : null };
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    return this.usersService.deactivateUser(Number(id), req.user.id);
  }

  private toUserInfo(user: any) {
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
