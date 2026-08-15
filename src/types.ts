export type ToolCategory = 'pdf' | 'image' | 'document' | 'ai' | 'privacy' | 'workflow';

export interface FileTool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  icon: string; // Lucide icon name
  badge?: 'Popular' | 'AI' | 'New' | 'Pro' | 'Workflow';
  isProOnly?: boolean;
  supportedFormats: string[]; // e.g. ['.pdf', '.png', '.jpg', '.txt', '.docx']
  keywords: string[];
}

export interface WorkspaceFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  dataUrl?: string; // For images / preview
  arrayBuffer?: ArrayBuffer;
  pageCount?: number;
  extractedText?: string;
  uploadedAt: number;
}

export interface PresetWorkflow {
  id: string;
  name: string;
  description: string;
  icon: string;
  steps: string[]; // List of tool names or action descriptions
  badge?: string;
}

export type UserPlan = 'free' | 'pro' | 'business';

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  sources?: string[];
}

export interface OCRResult {
  text: string;
  confidence: number;
  detectedLanguage?: string;
  tables?: Array<{ headers: string[]; rows: string[][] }>;
}

export interface ResumeAnalysis {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  suggestedKeywords: string[];
  atsCompatibility: 'High' | 'Medium' | 'Needs Work';
}
