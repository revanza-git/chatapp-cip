import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuditService } from './audit.service';
import { SearchService, DocumentMatch } from './search.service';
import { ACTION_CREATE, ACTION_DELETE, ACTION_UPDATE, ACTION_VIEW } from '../config/constants';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly searchService: SearchService
  ) {}

  async getPolicies(userId: number, details: string, ipAddress?: string, userAgent?: string) {
    const documents = await this.prisma.policyFile.findMany();
    await this.auditService.logSystemActivity({
      userId,
      action: ACTION_VIEW,
      details
    });
    return documents;
  }

  async getDocuments(filters: { type?: string; category?: string; active?: boolean }, userId: number, details: string) {
    const where: any = {};
    if (filters.active === true) {
      where.isActive = true;
    }
    if (filters.type) {
      where.documentType = filters.type;
    }
    if (filters.category) {
      where.category = { equals: filters.category, mode: 'insensitive' };
    }

    const documents = await this.prisma.policyFile.findMany({ where });
    await this.auditService.logSystemActivity({
      userId,
      action: ACTION_VIEW,
      details
    });
    return documents;
  }

  async getDocumentById(id: number, userId: number) {
    const document = await this.prisma.policyFile.findUnique({ where: { id } });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.auditService.logDocumentActivity({
      userId,
      action: ACTION_VIEW,
      documentId: document.id,
      documentName: document.name,
      details: `Viewed ${document.documentType} document: ${document.name}`
    });

    return document;
  }

  async createDocument(payload: any, userId: number) {
    if (!['policy', 'onboarding'].includes(payload.document_type)) {
      throw new BadRequestException("Document type must be 'policy' or 'onboarding'");
    }

    const document = await this.prisma.policyFile.create({
      data: {
        name: payload.name,
        content: payload.content,
        description: payload.description,
        category: payload.category,
        documentType: payload.document_type,
        tags: payload.tags || [],
        createdBy: payload.created_by,
        filePath: payload.file_path,
        createdByUserId: userId,
        isActive: true
      }
    });

    await this.auditService.logDocumentActivity({
      userId,
      action: ACTION_CREATE,
      documentId: document.id,
      documentName: document.name,
      details: `Created ${document.documentType} document: ${document.name}`
    });

    return document;
  }

  async updateDocument(id: number, payload: any, userId: number) {
    const existing = await this.prisma.policyFile.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Document not found');
    }

    if (payload.document_type && !['policy', 'onboarding'].includes(payload.document_type)) {
      throw new BadRequestException("Document type must be 'policy' or 'onboarding'");
    }

    const data: any = {};
    if (payload.name) data.name = payload.name;
    if (payload.content) data.content = payload.content;
    if (payload.description) data.description = payload.description;
    if (payload.category) data.category = payload.category;
    if (payload.document_type) data.documentType = payload.document_type;
    if (payload.tags) data.tags = payload.tags;
    if (typeof payload.is_active === 'boolean') data.isActive = payload.is_active;

    const document = await this.prisma.policyFile.update({
      where: { id },
      data
    });

    await this.auditService.logDocumentActivity({
      userId,
      action: ACTION_UPDATE,
      documentId: document.id,
      documentName: document.name,
      details: `Updated ${document.documentType} document: ${document.name}`
    });

    return document;
  }

  async deleteDocument(id: number, userId: number) {
    const document = await this.prisma.policyFile.findUnique({ where: { id } });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.prisma.policyFile.update({
      where: { id },
      data: { isActive: false }
    });

    await this.auditService.logDocumentActivity({
      userId,
      action: ACTION_DELETE,
      documentId: document.id,
      documentName: document.name,
      details: `Deleted ${document.documentType} document: ${document.name}`
    });

    return { message: 'Document deleted successfully' };
  }

  async searchDocuments(query: string, filters: { type?: string; category?: string }, userId: number) {
    const documents = await this.prisma.policyFile.findMany();
    this.searchService.setDocuments(documents);

    let matches = this.searchService.search(query, 20);

    if (filters.type) {
      matches = matches.filter(match => match.document.documentType === filters.type);
    }
    if (filters.category) {
      matches = matches.filter(match => match.document.category.toLowerCase() === filters.category!.toLowerCase());
    }

    const documentsResponse = matches.map(match => match.document);

    await this.auditService.logSystemActivity({
      userId,
      action: ACTION_VIEW,
      details: `Searched documents: '${query}' returned ${documentsResponse.length} results`
    });

    return {
      documents: documentsResponse,
      total: documentsResponse.length,
      query,
      matches
    };
  }
}
