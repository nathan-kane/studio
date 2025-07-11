import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { promises as fs } from 'fs';

// Define the response type matching what the frontend expects
interface UkrainianVocabularyWord {
  wordBankId: string;
  wordInTargetLanguage: string;
  exampleSentenceInTargetLanguage: string;
  wordType: string;
  dataAiHint: string;
}

// Helper: Generate a simple example sentence for a word (fallback if none in data)
function generateExampleSentence(word: string): string {
  return `Це слово: ${word}.`;
}

// Helper: Map part of speech to wordType
function mapPosToWordType(pos: string): string {
  switch (pos) {
    case 'noun': return 'noun';
    case 'verb': return 'verb';
    case 'adjective': return 'adjective';
    case 'phrase': return 'phrase';
    default: return 'other';
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const filePath = path.join(process.cwd(), 'server', 'vocabulary', 'ua.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const raw: any[] = JSON.parse(fileContent);

    // Map to frontend expected format
    const vocabulary: UkrainianVocabularyWord[] = raw.map((entry, idx) => ({
      wordBankId: `ua_static_${entry.index ?? idx}`,
      wordInTargetLanguage: entry.word,
      exampleSentenceInTargetLanguage: entry.defs && entry.defs.length > 0 ? `Наприклад: ${entry.word} — ${entry.defs[0]}` : generateExampleSentence(entry.word),
      wordType: mapPosToWordType(entry.pos),
      dataAiHint: entry.defs && entry.defs.length > 0 ? entry.defs[0] : '',
    }));

    res.status(200).json({ vocabulary });
  } catch (error: any) {
    console.error('Error loading Ukrainian vocabulary:', error);
    res.status(500).json({ error: 'Failed to load Ukrainian vocabulary.' });
  }
}
