import { Module } from '@nestjs/common';
import { UploadsController } from '../routes/uploads.controller';
import { FileService } from '../services/file.service';
import { AuditService } from '../services/audit.service';
import { UploadsService } from '../services/uploads.service';

@Module({
  controllers: [UploadsController],
  providers: [FileService, AuditService, UploadsService]
})
export class UploadsModule {}
