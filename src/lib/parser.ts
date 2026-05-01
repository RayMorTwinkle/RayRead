import { hashString } from './utils';

export interface ParsedChunk {
  id: string;
  text: string;
  length: number;
}

const SENTENCE_DELIMITER = /([。！？.!?]+)/g;
const CLAUSE_DELIMITER = /([，、；,;]+)/g;
const MIN_CLAUSE_LENGTH = 5;

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

export function parseTextToChunks(text: string): ParsedChunk[] {
  const normalized = text.replace(/\r\n/g, '\n').trim();

  if (normalized.length === 0) {
    return [];
  }

  const parts = normalized.split(SENTENCE_DELIMITER).filter((part) => part.length > 0);
  const chunks: string[] = [];

  for (let index = 0; index < parts.length; index += 2) {
    const body = parts[index] ?? '';
    const punctuation = parts[index + 1] ?? '';
    const sentence = `${body}${punctuation}`.trim();

    if (sentence.length > 0) {
      chunks.push(...mergeShortClauses(splitSentenceToClauses(sentence)));
    }
  }

  return chunks.map((chunk, index) => ({
    id: `${hashString(`${chunk}-${index}`).toString(16)}-${index}`,
    text: chunk,
    length: chunk.length
  }));
}
