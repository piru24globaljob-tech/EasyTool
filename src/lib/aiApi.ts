import { AIChatMessage } from '../types';

export async function askAIChat(prompt: string, documentContext?: string, history?: AIChatMessage[]): Promise<string> {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, documentContext, history }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to communicate with AI Chat');
  }
  const data = await res.json();
  return data.reply;
}

export async function summarizeDocument(text: string, mode: string = 'bullet') {
  const res = await fetch('/api/ai/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, mode }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to summarize document');
  }
  return await res.json();
}

export async function extractKeyPoints(text: string) {
  const res = await fetch('/api/ai/extract-key-points', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to extract key entities');
  }
  return await res.json();
}

export async function extractTables(text: string) {
  const res = await fetch('/api/ai/extract-tables', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to extract tables');
  }
  return await res.json();
}

export async function translateDocument(text: string, targetLanguage: string) {
  const res = await fetch('/api/ai/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLanguage }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to translate document');
  }
  return await res.json();
}

export async function performVisionOCR(imageBase64: string, mimeType?: string) {
  const res = await fetch('/api/ai/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to perform OCR');
  }
  return await res.json();
}

export async function analyzeResume(text: string, targetJob?: string) {
  const res = await fetch('/api/ai/analyze-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetJob }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to analyze resume');
  }
  return await res.json();
}

export async function generateCoverLetter(resumeText: string, jobTitle?: string, companyName?: string, notes?: string) {
  const res = await fetch('/api/ai/cover-letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText, jobTitle, companyName, notes }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to generate cover letter');
  }
  return await res.json();
}

export async function generateQuiz(text: string, count: number = 5) {
  const res = await fetch('/api/ai/generate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, count }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to generate quiz');
  }
  return await res.json();
}

export async function scrapeWebpage(params: { url?: string; htmlContent?: string; targetPrompt?: string }) {
  const res = await fetch('/api/ai/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to scrape webpage');
  }
  return await res.json();
}

export async function extractDataFields(text: string, customRegex?: string) {
  const res = await fetch('/api/ai/extract-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, customRegex }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to extract data fields');
  }
  return await res.json();
}

