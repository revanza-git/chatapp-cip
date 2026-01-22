import { Injectable } from '@nestjs/common';
import { PolicyFile } from '@prisma/client';

export interface MatchDetail {
  field: string;
  text: string;
  score: number;
}

export interface DocumentMatch {
  document: PolicyFile;
  score: number;
  matches: MatchDetail[];
}

interface DocumentIndex {
  documentId: number;
  field: string;
  frequency: number;
  positions: number[];
}

@Injectable()
export class SearchService {
  private documents: PolicyFile[] = [];
  private index: Record<string, DocumentIndex[]> = {};

  setDocuments(documents: PolicyFile[]) {
    this.documents = documents;
    this.buildIndex();
  }

  buildIndex() {
    this.index = {};

    for (const doc of this.documents) {
      if (!doc.isActive) {
        continue;
      }

      this.indexField(doc.id, 'name', doc.name, 3.0);
      this.indexField(doc.id, 'description', doc.description || '', 2.0);
      this.indexField(doc.id, 'content', doc.content, 1.0);
      this.indexField(doc.id, 'category', doc.category, 2.5);
      const tagsText = Array.isArray(doc.tags) ? doc.tags.join(' ') : '';
      this.indexField(doc.id, 'tags', tagsText, 2.0);
    }
  }

  private indexField(docId: number, field: string, text: string, weight: number) {
    const words = this.tokenize(text);

    words.forEach((word, position) => {
      if (word.length < 2) {
        return;
      }

      const normalized = this.normalizeWord(word);
      const existing = this.index[normalized] || [];
      const entry = existing.find(item => item.documentId === docId && item.field === field);

      if (entry) {
        entry.frequency += 1;
        entry.positions.push(position);
      } else {
        existing.push({
          documentId: docId,
          field,
          frequency: 1,
          positions: [position]
        });
      }
      this.index[normalized] = existing;
    });
  }

  search(query: string, limit = 10): DocumentMatch[] {
    if (!query) {
      return [];
    }

    const queryWords = this.tokenize(query);
    if (!queryWords.length) {
      return [];
    }

    const docScores: Record<number, number> = {};
    const docMatches: Record<number, MatchDetail[]> = {};

    for (const queryWord of queryWords) {
      const normalized = this.normalizeWord(queryWord);
      let matches = this.index[normalized] || [];

      if (!matches.length) {
        matches = this.findFuzzyMatches(normalized, 2);
      }

      const idf = this.calculateIdf(normalized);

      for (const match of matches) {
        const tf = match.frequency;
        const fieldWeight = this.getFieldWeight(match.field);
        const score = tf * idf * fieldWeight;

        docScores[match.documentId] = (docScores[match.documentId] || 0) + score;
        docMatches[match.documentId] = docMatches[match.documentId] || [];
        docMatches[match.documentId].push({
          field: match.field,
          text: normalized,
          score
        });
      }
    }

    const results: DocumentMatch[] = [];
    for (const [docIdString, score] of Object.entries(docScores)) {
      const docId = parseInt(docIdString, 10);
      const document = this.documents.find(doc => doc.id === docId);
      if (document) {
        results.push({
          document,
          score,
          matches: docMatches[docId] || []
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  private tokenize(text: string): string[] {
    const cleaned = text.replace(/[^\p{L}\p{N}]+/gu, ' ');
    const words = cleaned.split(/\s+/).map(word => word.toLowerCase()).filter(Boolean);
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should'
    ]);
    return words.filter(word => !stopWords.has(word) && word.length > 1);
  }

  private normalizeWord(word: string): string {
    let normalized = word.toLowerCase();
    const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'ion', 'tion', 'sion', 'ness', 'ment'];
    for (const suffix of suffixes) {
      if (normalized.endsWith(suffix) && normalized.length > suffix.length + 2) {
        normalized = normalized.slice(0, -suffix.length);
        break;
      }
    }
    return normalized;
  }

  private levenshteinDistance(s1: string, s2: string): number {
    if (!s1.length) return s2.length;
    if (!s2.length) return s1.length;

    const matrix = Array.from({ length: s1.length + 1 }, () => Array(s2.length + 1).fill(0));

    for (let i = 0; i <= s1.length; i++) {
      matrix[i][0] = i;
    }
    for (let j = 0; j <= s2.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= s1.length; i++) {
      for (let j = 1; j <= s2.length; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[s1.length][s2.length];
  }

  private findFuzzyMatches(word: string, maxDistance: number): DocumentIndex[] {
    const matches: DocumentIndex[] = [];
    for (const [indexWord, docIndices] of Object.entries(this.index)) {
      if (this.levenshteinDistance(word, indexWord) <= maxDistance) {
        matches.push(...docIndices);
      }
    }
    return matches;
  }

  private calculateIdf(word: string): number {
    const totalDocs = this.documents.length;
    const docsWithWord = (this.index[word] || []).length;
    if (docsWithWord === 0) {
      return 0;
    }
    return Math.log(totalDocs / docsWithWord);
  }

  private getFieldWeight(field: string): number {
    const weights: Record<string, number> = {
      name: 3.0,
      description: 2.0,
      category: 2.5,
      tags: 2.0,
      content: 1.0
    };

    return weights[field] ?? 1.0;
  }
}
