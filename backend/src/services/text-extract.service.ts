import { Injectable } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

@Injectable()
export class TextExtractService {
  async extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
      const data = await pdfParse(buffer);
      return this.cleanText(data.text || '');
    }

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      return this.cleanText(result.value || '');
    }

    if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
      return this.cleanText(buffer.toString('utf8'));
    }

    return this.cleanText(buffer.toString('utf8'));
  }

  private cleanText(text: string): string {
    const cleaned = text.replace(/\u0000/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
    return cleaned;
  }
}
