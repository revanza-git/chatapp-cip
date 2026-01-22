import { Module } from '@nestjs/common';
import { DocumentsController } from '../routes/documents.controller';
import { DocumentsService } from '../services/documents.service';
import { FileService } from '../services/file.service';
import { AuditService } from '../services/audit.service';
import { SearchService } from '../services/search.service';
import { DocumentDownloadController } from '../routes/documents-download.controller';
import { TextExtractService } from '../services/text-extract.service';

@Module({
  controllers: [DocumentsController, DocumentDownloadController],
  providers: [DocumentsService, FileService, AuditService, SearchService, TextExtractService]
})
export class DocumentsModule {}
