import { Module } from '@nestjs/common';
import { UsersController } from '../routes/users.controller';
import { UsersService } from '../services/users.service';
import { AuditService } from '../services/audit.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, AuditService]
})
export class UsersModule {}
