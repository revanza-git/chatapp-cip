import { CanActivate } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

export const rolesGuardFactory = (roles: string[]): CanActivate => {
  return new RolesGuard(roles);
};
