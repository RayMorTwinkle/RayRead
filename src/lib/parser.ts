import { hashString } from './utils';

export interface ParsedChunk {
  id: string;
  text: string;
  length: number;
}

const SENTENCE_DELIMITER = /([。！？.!?]+)/g;

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
    const chunk = `${body}${punctuation}`.trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }
  }

  return chunks.map((chunk, index) => ({
    id: `${hashString(`${chunk}-${index}`).toString(16)}-${index}`,
    text: chunk,
    length: chunk.length
  }));
}
