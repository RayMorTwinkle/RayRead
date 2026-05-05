import { hashString } from './utils';

export interface ParsedChunk {
  id: string;
  text: string;
  length: number;
  endType: 'sentence' | 'clause' | 'paragraph';
}

const SENTENCE_DELIMITER = /([。！？.!?]+)/g;
const CLAUSE_DELIMITER = /([，、；,;]+)/g;
const MIN_CLAUSE_LENGTH = 5;

const SENTENCE_END_RE = /[。！？.!?]$/;
const CLAUSE_END_RE = /[，、；,;]$/;

function getEffectiveLength(text: string): number {
  return text.replace(/[\s，、；,;。！？.!?]+/g, '').length;
}

function splitSentenceToClauses(sentence: string): string[] {
  const parts = sentence.split(CLAUSE_DELIMITER).filter((part) => part.length > 0);
  const clauses: string[] = [];

  for (let index = 0; index < parts.length; index += 2) {
    const body = parts[index] ?? '';
    const punctuation = parts[index + 1] ?? '';
    const clause = `${body}${punctuation}`.trim();

    if (clause.length > 0) {
      clauses.push(clause);
    }
  }

  return clauses;
}

function mergeShortClauses(clauses: string[]): string[] {
  const merged: string[] = [];

  for (let index = 0; index < clauses.length; index += 1) {
    const clause = clauses[index];

    if (getEffectiveLength(clause) <= MIN_CLAUSE_LENGTH) {
      const nextClause = clauses[index + 1];

      if (nextClause) {
        merged.push(`${clause}${nextClause}`);
        index += 1;
        continue;
      }

      if (merged.length > 0) {
        merged[merged.length - 1] += clause;
        continue;
      }

      merged.push(clause);
      continue;
    }

    merged.push(clause);
  }

  return merged;
}

function determineEndType(text: string): 'sentence' | 'clause' {
  if (SENTENCE_END_RE.test(text)) {
    return 'sentence';
  }
  if (CLAUSE_END_RE.test(text)) {
    return 'clause';
  }
  return 'sentence';
}

export function parseTextToChunks(text: string): ParsedChunk[] {
  const normalized = text.replace(/\r\n/g, '\n').trim();

  if (normalized.length === 0) {
    return [];
  }

  const paragraphs = normalized.split('\n').filter((p) => p.trim().length > 0);
  const allChunks: string[] = [];
  const paragraphEndIndices = new Set<number>();

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    const parts = trimmed.split(SENTENCE_DELIMITER).filter((part) => part.length > 0);
    const chunks: string[] = [];

    for (let index = 0; index < parts.length; index += 2) {
      const body = parts[index] ?? '';
      const punctuation = parts[index + 1] ?? '';
      const sentence = `${body}${punctuation}`.trim();

      if (sentence.length > 0) {
        chunks.push(...mergeShortClauses(splitSentenceToClauses(sentence)));
      }
    }

    if (chunks.length > 0) {
      const startIdx = allChunks.length;
      allChunks.push(...chunks);
      paragraphEndIndices.add(startIdx + chunks.length - 1);
    }
  }

  return allChunks.map((chunk, index) => ({
    id: `${hashString(`${chunk}-${index}`).toString(16)}-${index}`,
    text: chunk,
    length: chunk.length,
    endType: paragraphEndIndices.has(index) ? 'paragraph' : determineEndType(chunk)
  }));
}
