export type MatchType = 'original' | 'paraphrased' | 'plagiarized' | 'ai_generated';

export interface CitationData {
  apa: string;
  mla: string;
  chicago: string;
}

export interface MatchedSource {
  title: string;
  url?: string;
  domain?: string;
  similarity: number;
  matchedText?: string;
  author?: string;
  year?: string | number;
  citations?: CitationData;
}

export interface TextSegment {
  id: string;
  text: string;
  status: MatchType;
  confidence: number;
  explanation: string;
  matchedSource?: MatchedSource;
  rephrasedAlternative?: string;
  grammarNote?: string;
}

export interface DetectionResult {
  id: string;
  timestamp: string;
  documentTitle?: string;
  wordCount: number;
  characterCount: number;
  readingTimeMinutes: number;
  originalityScore: number; // 0 - 100
  plagiarismScore: number;  // 0 - 100
  paraphraseScore: number;  // 0 - 100
  aiLikelihood: number;     // 0 - 100
  grammarScore: number;     // 0 - 100
  verdict: string;
  summary: string;
  segments: TextSegment[];
  sources: MatchedSource[];
  recommendations: string[];
  engineUsed: 'gemini-pro' | 'gemini-flash' | 'eden-ai' | 'heuristic-engine';
}

export interface ScanRequest {
  text: string;
  title?: string;
  checkParaphrase?: boolean;
  checkWebPlagiarism?: boolean;
  checkAiWriting?: boolean;
  checkGrammar?: boolean;
  excludeUrl?: string;
}

export interface UserStats {
  email: string;
  name: string;
  isStudent: boolean;
  userType: 'student' | 'standard';
  institutionName?: string;
  studentId?: string;
  tier: 'free_student' | 'standard';
  scansRemaining: number | 'unlimited';
  totalScansPerformed: number;
}
