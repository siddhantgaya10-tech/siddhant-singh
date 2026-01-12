export enum ParaphraseMode {
  STANDARD = 'Standard',
  FLUENCY = 'Fluency',
  FORMAL = 'Formal',
  SIMPLE = 'Simple',
  CREATIVE = 'Creative',
  ACADEMIC = 'Academic'
}

export enum AppTool {
  PARAPHRASER = 'Paraphraser',
  SUMMARIZER = 'Summarizer'
}

export interface TextStats {
  words: number;
  chars: number;
}

export interface RewiteRequest {
  text: string;
  mode: ParaphraseMode;
  synonymsLevel: number; // 0 to 100
}

export interface SummaryRequest {
  text: string;
  length: 'short' | 'medium' | 'long';
  format: 'paragraph' | 'bullets';
}