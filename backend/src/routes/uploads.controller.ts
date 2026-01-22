import { Controller, Get, Post, UseGuards, Req, UploadedFile, UseInterceptors, Param, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../guards/auth.guard';
import { rolesGuardFactory } from '../guards/roles.guard.factory';
import { ROLE_ADMIN, ROLE_IT_SECURITY } from '../config/constants';
import { UploadsService } from '../services/uploads.service';
import { AuditService } from '../services/audit.service';
import { Response } from 'express';

@Controller('api')
@UseGuards(AuthGuard)
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly auditService: AuditService
  ) {}

  @Post('upload')
  @UseGuards(rolesGuardFactory([ROLE_ADMIN, ROLE_IT_SECURITY]))
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const uploadResponse = await this.uploadsService.uploadFile(file);
    await this.auditService.logSystemActivity({
      userId: req.user.id,
      action: 'CREATE',
      details: `Uploaded file locally: ${file.originalname} (${file.size} bytes) - FileID: ${uploadResponse.fileId}`
    });
    return uploadResponse;
  }

  @Get('upload/supported-types')
  async getSupportedTypes() {
    return this.uploadsService.getSupportedTypes();
  }

  @Get('files/:fileId')
  async downloadFile(@Param('fileId') fileId: string, @Res() res: Response, @Req() req: any) {
    const fileInfo = await this.uploadsService.downloadFile(fileId);

    await this.auditService.logSystemActivity({
      userId: req.user.id,
      action: 'VIEW',
      details: `Downloaded file locally: ${fileInfo.originalName}`
    });

    res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.downloadFilename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    return res.sendFile(fileInfo.filePath, { root: process.cwd() });
  }
}
