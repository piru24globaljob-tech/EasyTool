import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// --- API ENDPOINTS ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 1. AI PDF / Document Chat
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt, documentContext, history } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();
    const systemInstruction = `You are FileKit AI Assistant, an expert document helper and reader. 
Answer user questions accurately based on the provided document context below. If context is provided, prioritize factual details from it. Keep responses clear, helpful, and markdown-formatted.

Document Context:
${documentContext ? documentContext.slice(0, 30000) : 'No document attached. Answer general file management or document queries.'}`;

    const contents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        contents.push(`${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`);
      }
    }
    contents.push(`User: ${prompt}`);

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contents.join('\n\n'),
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    res.json({ reply: response.text || 'No response generated.' });
  } catch (err: any) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ error: err.message || 'Failed to process AI chat request' });
  }
});

// 2. AI Document Summarizer
app.post('/api/ai/summarize', async (req, res) => {
  try {
    const { text, mode = 'bullet' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Document text is required' });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Summarize the following document. Mode: ${mode}.\n\nDocument Text:\n${text.slice(0, 30000)}`,
      config: {
        systemInstruction: `Provide a structured JSON output containing:
- "summary": A high-level 2-3 sentence overview paragraph.
- "bulletPoints": An array of 5-8 key bullet point takeaways.
- "title": A suggested concise document title based on content.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            bulletPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['title', 'summary', 'bulletPoints'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Summarize Error:', err);
    res.status(500).json({ error: err.message || 'Failed to summarize document' });
  }
});

// 3. AI Entity & Dates Extractor
app.post('/api/ai/extract-key-points', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Document text is required' });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Extract important structured entities from the following text:\n\n${text.slice(0, 30000)}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dates: { type: Type.ARRAY, items: { type: Type.STRING } },
            monetaryAmounts: { type: Type.ARRAY, items: { type: Type.STRING } },
            peopleAndOrganizations: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['dates', 'monetaryAmounts', 'peopleAndOrganizations', 'actionItems'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('Extraction Error:', err);
    res.status(500).json({ error: err.message || 'Failed to extract key entities' });
  }
});

// 4. AI Table Extractor (Text / Unstructured -> Structured Markdown Table & CSV)
app.post('/api/ai/extract-tables', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Extract tabular data from this text into clean headers and rows:\n\n${text.slice(0, 30000)}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tableName: { type: Type.STRING },
            headers: { type: Type.ARRAY, items: { type: Type.STRING } },
            rows: {
              type: Type.ARRAY,
              items: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
          required: ['headers', 'rows'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('Table Extraction Error:', err);
    res.status(500).json({ error: err.message || 'Failed to extract table data' });
  }
});

// 5. AI Document Translator
app.post('/api/ai/translate', async (req, res) => {
  try {
    const { text, targetLanguage = 'Spanish' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Translate the following text into ${targetLanguage}. Preserve formatting, paragraph breaks, and headings.\n\nText:\n${text.slice(0, 30000)}`,
      config: {
        temperature: 0.3,
      },
    });

    res.json({ translatedText: response.text || '' });
  } catch (err: any) {
    console.error('Translation Error:', err);
    res.status(500).json({ error: err.message || 'Failed to translate document' });
  }
});

// 6. AI Vision OCR
app.post('/api/ai/ocr', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/png' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: 'Perform Optical Character Recognition (OCR) on this image. Extract all legible text precisely, maintaining original paragraph structure and lists.' },
        ],
      },
    });

    res.json({ text: response.text || 'No text detected.' });
  } catch (err: any) {
    console.error('OCR Error:', err);
    res.status(500).json({ error: err.message || 'Failed to perform OCR on image' });
  }
});

// 7. AI Resume Analyzer
app.post('/api/ai/analyze-resume', async (req, res) => {
  try {
    const { text, targetJob = 'General Professional' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Analyze this resume for target role: "${targetJob}".\n\nResume Text:\n${text.slice(0, 30000)}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: 'Score from 0 to 100' },
            atsCompatibility: { type: Type.STRING, description: 'High, Medium, or Needs Work' },
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['overallScore', 'atsCompatibility', 'summary', 'strengths', 'improvements', 'suggestedKeywords'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('Resume Analysis Error:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze resume' });
  }
});

// 8. AI Cover Letter Generator
app.post('/api/ai/cover-letter', async (req, res) => {
  try {
    const { resumeText, jobTitle, companyName, notes } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Generate a compelling, highly professional cover letter based on this resume background.
Target Job Title: ${jobTitle || 'Desired Position'}
Target Company: ${companyName || 'Target Organization'}
Special Notes: ${notes || 'None'}

Resume Context:
${resumeText.slice(0, 20000)}`,
    });

    res.json({ coverLetter: response.text || '' });
  } catch (err: any) {
    console.error('Cover Letter Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate cover letter' });
  }
});

// 9. AI Quiz & Question Generator
app.post('/api/ai/generate-quiz', async (req, res) => {
  try {
    const { text, count = 5 } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Document text is required' });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Generate ${count} multiple-choice comprehension questions based on this text:\n\n${text.slice(0, 30000)}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answerIndex: { type: Type.INTEGER, description: 'Index 0 to 3' },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'answerIndex', 'explanation'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('Quiz Generation Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate quiz' });
  }
});

// 10. Data Scraper Endpoint (URL or HTML content)
app.post('/api/ai/scrape', async (req, res) => {
  try {
    const { url, htmlContent: rawHtml, targetPrompt } = req.body;
    let html = rawHtml || '';

    if (url && !html) {
      let targetUrl = url.trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      try {
        const fetchRes = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        });
        clearTimeout(timeoutId);

        if (!fetchRes.ok) {
          throw new Error(`Web server responded with status ${fetchRes.status}`);
        }
        html = await fetchRes.text();
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        return res.status(400).json({
          error: `Could not fetch URL directly (${fetchErr.message}). You can copy & paste the HTML source code directly into the HTML Scraper input below.`,
        });
      }
    }

    if (!html) {
      return res.status(400).json({ error: 'Please provide a valid URL or HTML content to scrape.' });
    }

    // Standard Regex Parser for HTML elements
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'Scraped Webpage';

    const metaMatches = Array.from(html.matchAll(/<meta[^>]+(?:name|property)=["']([^"']+)["'][^>]+content=["']([^"']+)["']/gi));
    const metaTags = metaMatches.map((m) => ({ name: m[1], content: m[2] }));

    const linkMatches = Array.from(html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi));
    const links = linkMatches
      .slice(0, 100)
      .map((m) => ({
        url: m[1],
        text: m[2].replace(/<[^>]+>/g, '').trim() || 'Link',
      }))
      .filter((l) => l.url && !l.url.startsWith('javascript:') && !l.url.startsWith('#'));

    const imageMatches = Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi));
    const images = imageMatches.slice(0, 50).map((m) => {
      const altMatch = m[0].match(/alt=["']([^"']*)["']/i);
      return {
        src: m[1],
        alt: altMatch ? altMatch[1] : '',
      };
    });

    const headingMatches = Array.from(html.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi));
    const headings = headingMatches.slice(0, 50).map((m) => ({
      tag: m[1].toLowerCase(),
      text: m[2].replace(/<[^>]+>/g, '').trim(),
    }));

    // Clean plain body text
    const bodyText = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // AI Targeted Extraction if prompt or AI query is present
    let aiExtractedData: any = null;
    if (targetPrompt || bodyText.length > 0) {
      try {
        const ai = getGeminiClient();
        const promptText = targetPrompt
          ? `Extract structured fields based on this instruction: "${targetPrompt}".\n\nPage Title: ${pageTitle}\n\nBody Content:\n${bodyText.slice(0, 25000)}`
          : `Extract key structured details from this webpage:\n\nPage Title: ${pageTitle}\n\nBody Content:\n${bodyText.slice(0, 25000)}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: promptText,
          config: {
            systemInstruction: `Return a JSON object with:
- "summary": High-level 2-sentence summary of the page content.
- "mainTopics": List of top 3-5 main topics/categories discussed.
- "extractedItems": List of key data items, products, key-value pairs, or custom details extracted.
- "contactInfo": Any emails, phones, or addresses detected on the page.`,
            responseMimeType: 'application/json',
          },
        });
        aiExtractedData = JSON.parse(response.text || '{}');
      } catch (aiErr) {
        console.warn('AI Scraping refinement skipped/error:', aiErr);
      }
    }

    res.json({
      title: pageTitle,
      metaTags: metaTags.slice(0, 20),
      links,
      images,
      headings,
      bodyTextSnippet: bodyText.slice(0, 3000),
      aiExtracted: aiExtractedData,
    });
  } catch (err: any) {
    console.error('Data Scraper Error:', err);
    res.status(500).json({ error: err.message || 'Failed to scrape webpage data' });
  }
});

// 11. AI & Regex Data Extraction Endpoint
app.post('/api/ai/extract-data', async (req, res) => {
  try {
    const { text, customRegex } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text content is required for extraction' });
    }

    // 1. Regex Matchers
    const emailMatches = Array.from(new Set(text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []));
    const phoneMatches = Array.from(new Set(text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g) || []));
    const urlMatches = Array.from(new Set(text.match(/https?:\/\/[^\s<>"']+/g) || []));
    const moneyMatches = Array.from(new Set(text.match(/(?:\$|₹|€|£|USD|INR|EUR|GBP)\s?\d+(?:,\d{3})*(?:\.\d{2})?/g) || []));
    const dateMatches = Array.from(new Set(text.match(/\b(?:\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}|\d{4}[\/\.-]\d{1,2}[\/\.-]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})\b/gi) || []));

    let customRegexMatches: string[] = [];
    if (customRegex) {
      try {
        const re = new RegExp(customRegex, 'gi');
        customRegexMatches = Array.from(new Set(text.match(re) || []));
      } catch (e) {
        console.warn('Invalid custom regex provided:', customRegex);
      }
    }

    // 2. Gemini AI Deep Entity Extractor
    let aiEntities: any = {};
    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Analyze and extract structured data fields from this document:\n\n${text.slice(0, 30000)}`,
        config: {
          systemInstruction: `Extract structured JSON containing:
- "peopleNames": Array of full names of persons mentioned.
- "organizations": Array of company/organization names.
- "addresses": Array of postal/physical addresses found.
- "invoiceMetadata": Object with invoiceNumber, invoiceDate, totalAmount, vendorName if present.
- "keyValuePairs": Array of objects { key: string, value: string } for tabular or labeled metadata.`,
          responseMimeType: 'application/json',
        },
      });
      aiEntities = JSON.parse(response.text || '{}');
    } catch (aiErr) {
      console.warn('AI entity extraction warning:', aiErr);
    }

    res.json({
      emails: emailMatches,
      phones: phoneMatches,
      urls: urlMatches,
      amounts: moneyMatches,
      dates: dateMatches,
      customMatches: customRegexMatches,
      people: aiEntities.peopleNames || [],
      organizations: aiEntities.organizations || [],
      addresses: aiEntities.addresses || [],
      invoiceMetadata: aiEntities.invoiceMetadata || null,
      keyValuePairs: aiEntities.keyValuePairs || [],
    });
  } catch (err: any) {
    console.error('Data Extraction Error:', err);
    res.status(500).json({ error: err.message || 'Failed to extract data' });
  }
});

// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FileKit AI Server running on port ${PORT}`);
  });
}

startServer();
