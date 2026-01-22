import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { DocumentsService } from '../services/documents.service';
import { AuthGuard } from '../guards/auth.guard';
import { Response } from 'express';
import path from 'path';
import fs from 'fs';

@Controller('api/documents')
@UseGuards(AuthGuard)
export class DocumentDownloadController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get(':id/download')
  async downloadDocument(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    const document = await this.documentsService.getDocumentById(Number(id), req.user.id);

    if (!document.filePath) {
      return res.status(404).json({ error: 'No original file available for this document' });
    }

    let actualFilePath = '';
    if (document.filePath.startsWith('uploads/')) {
      actualFilePath = document.filePath;
    } else {
      const uploadsDir = 'uploads';
      const files = await fs.promises.readdir(uploadsDir);
      const found = files.find(file => file.startsWith(document.filePath || ''));
      if (found) {
        actualFilePath = path.join(uploadsDir, found);
      }
    }

    if (!actualFilePath) {
      return res.status(404).json({ error: 'Original file not found on server' });
    }

    if (!fs.existsSync(actualFilePath)) {
      return res.status(404).json({ error: 'Original file not found on server' });
    }

    const storedFilename = path.basename(actualFilePath);
    const ext = path.extname(storedFilename);
    const nameWithoutExt = path.basename(storedFilename, ext);
    let downloadFilename = nameWithoutExt.replace(/^\d+_/, '');

    if (!downloadFilename) {
      downloadFilename = document.name || 'document';
    }

    if (!downloadFilename.endsWith(ext)) {
      downloadFilename = `${downloadFilename}${ext}`;
    }

    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    return res.sendFile(actualFilePath, { root: process.cwd() });
  }
}
