import { Controller, Get, Param, Post, Put, Delete, Query, Body, Req, UseGuards } from '@nestjs/common';
import { DocumentsService } from '../services/documents.service';
import { AuthGuard } from '../guards/auth.guard';
import { rolesGuardFactory } from '../guards/roles.guard.factory';
import { ROLE_ADMIN, ROLE_IT_SECURITY } from '../config/constants';

@Controller('api')
@UseGuards(AuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('policies')
  async getPolicies(@Req() req: any) {
    return this.documentsService.getPolicies(req.user.id, `Accessed all policies`, req.ip, req.headers['user-agent']);
  }

  @Get('documents')
  async getDocuments(@Query() query: any, @Req() req: any) {
    const filters = {
      type: query.type,
      category: query.category,
      active: query.active === 'true'
    };

    return this.documentsService.getDocuments(filters, req.user.id, `Accessed ${filters.type || 'all'} documents`);
  }

  @Get('documents/search')
  async searchDocuments(@Query() query: any, @Req() req: any) {
    if (!query.q) {
      return { error: 'Search query is required' };
    }

    return this.documentsService.searchDocuments(query.q, { type: query.type, category: query.category }, req.user.id);
  }

  @Get('documents/:id')
  async getDocumentById(@Param('id') id: string, @Req() req: any) {
    return this.documentsService.getDocumentById(Number(id), req.user.id);
  }

  @Post('documents')
  @UseGuards(rolesGuardFactory([ROLE_ADMIN, ROLE_IT_SECURITY]))
  async createDocument(@Body() body: any, @Req() req: any) {
    return this.documentsService.createDocument(body, req.user.id);
  }

  @Put('documents/:id')
  @UseGuards(rolesGuardFactory([ROLE_ADMIN, ROLE_IT_SECURITY]))
  async updateDocument(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.documentsService.updateDocument(Number(id), body, req.user.id);
  }

  @Delete('documents/:id')
  @UseGuards(rolesGuardFactory([ROLE_ADMIN, ROLE_IT_SECURITY]))
  async deleteDocument(@Param('id') id: string, @Req() req: any) {
    return this.documentsService.deleteDocument(Number(id), req.user.id);
  }
}
