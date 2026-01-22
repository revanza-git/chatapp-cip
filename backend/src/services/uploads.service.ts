import { Injectable, NotFoundException } from '@nestjs/common';
import { FileService } from './file.service';

@Injectable()
export class UploadsService {
  constructor(private readonly fileService: FileService) {}

  async uploadFile(file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file provided. Use "file" as field name.');
    }
    this.fileService.validateFileUpload(file);
    return this.fileService.saveFileLocally(file);
  }

  async getSupportedTypes() {
    return {
      supported_types: this.fileService.getSupportedFileTypes(),
      max_file_size: '25MB',
      accepted_extensions: ['.pdf', '.txt', '.md'],
      accepted_mime_types: ['application/pdf', 'text/plain', 'text/markdown']
    };
  }

  async downloadFile(fileId: string) {
    const fileInfo = await this.fileService.findFileById(fileId);
    if (!fileInfo) {
      throw new NotFoundException('File not found');
    }

    const downloadFilename = this.fileService.getDownloadFilename(fileInfo.originalName, fileId);
    return { ...fileInfo, downloadFilename };
  }
}
