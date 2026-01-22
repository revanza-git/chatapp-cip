import { Module } from '@nestjs/common';
import { ChatController } from '../routes/chat.controller';
import { ChatService } from '../services/chat.service';
import { DocumentsService } from '../services/documents.service';
import { AuditService } from '../services/audit.service';
import { LlmService } from '../services/llm.service';
import { SearchService } from '../services/search.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, DocumentsService, AuditService, LlmService, SearchService]
})
export class ChatModule {}
