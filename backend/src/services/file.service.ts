import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface FileUploadResponse {
  fileId: string;
  webViewLink: string;
  fileName: string;
  filePath: string;
  size: number;
  uploadedAt: string;
}

export interface SupportedFileType {
  extension: string;
  mime_types: string[];
  description: string;
  max_size_mb: number;
}

@Injectable()
export class FileService {
  private readonly uploadsDir: string;

  constructor() {
    this.uploadsDir = process.env.UPLOADS_DIR || 'uploads';
  }

  getSupportedFileTypes(): SupportedFileType[] {
    return [
      {
        extension: '.pdf',
        mime_types: ['application/pdf'],
        description: 'PDF Document',
        max_size_mb: 25
      },
      {
        extension: '.txt',
        mime_types: ['text/plain'],
        description: 'Text File',
        max_size_mb: 25
      },
      {
        extension: '.md',
        mime_types: ['text/markdown', 'text/plain'],
        description: 'Markdown File',
        max_size_mb: 25
      }
    ];
  }

  validateFileUpload(file: Express.Multer.File) {
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`file size (${file.size} bytes) exceeds maximum allowed size (${maxSize} bytes)`);
    }

    const allowedTypes: Record<string, boolean> = {
      'application/pdf': true,
      'text/plain': true,
      'text/markdown': true,
      'application/octet-stream': true
    };

    if (!allowedTypes[file.mimetype]) {
      throw new Error(`unsupported file type: ${file.mimetype}. Only PDF, plain text, and markdown files are allowed`);
    }

    const allowedExtensions = ['.pdf', '.txt', '.md'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`unsupported file extension: ${ext}. Only .pdf, .txt, and .md files are allowed`);
    }
  }

  resolveUploadsPath(filePath: string) {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.join(process.cwd(), filePath);
  }

  ensureUploadsDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async saveFileLocally(file: Express.Multer.File): Promise<FileUploadResponse> {
    this.ensureUploadsDir();
    const fileId = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const ext = path.extname(file.originalname);
    const safeFileName = `${fileId}${ext}`;
    const filePath = path.join(this.uploadsDir, safeFileName);

    await fs.promises.writeFile(filePath, file.buffer);

    return {
      fileId,
      webViewLink: `/api/files/${fileId}`,
      fileName: file.originalname,
      filePath,
      size: file.size,
      uploadedAt: new Date().toISOString()
    };
  }

  async findFileById(fileId: string): Promise<{ filePath: string; originalName: string } | null> {
    try {
      const files = await fs.promises.readdir(this.uploadsDir);
      const match = files.find(file => file.startsWith(fileId));
      if (!match) {
        return null;
      }
      return {
        filePath: path.join(this.uploadsDir, match),
        originalName: match
      };
    } catch (error) {
      return null;
    }
  }

  getDownloadFilename(originalName: string, fileId: string): string {
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    let downloadFilename = nameWithoutExt.replace(`${fileId}_`, '');

    if (!downloadFilename || downloadFilename === nameWithoutExt) {
      downloadFilename = 'download';
    }

    return `${downloadFilename}${ext}`;
  }
}
