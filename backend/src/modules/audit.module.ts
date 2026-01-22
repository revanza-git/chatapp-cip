import { Module } from '@nestjs/common';
import { AuditController } from '../routes/audit.controller';
import { AuditService } from '../services/audit.service';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [AuditController],
  providers: [AuditService, PrismaService]
})
export class AuditModule {}
