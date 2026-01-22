import { Module } from '@nestjs/common';
import { AuthController } from '../routes/auth.controller';
import { AuthService } from '../services/auth.service';
import { AuditService } from '../services/audit.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuditService],
  exports: [AuthService]
})
export class AuthModule {}
