import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const PLAYBOOK_DIR = join(process.cwd(), 'public', 'playbook');

function loadPlaybookContent() {
  try {
    const files = readdirSync(PLAYBOOK_DIR)
      .filter((f) => f.endsWith('.md'))
      .sort((a, b) => {
        const numA = parseInt(a.split('_')[0], 10);
        const numB = parseInt(b.split('_')[0], 10);
        return numA - numB;
      });

    return files
      .map((file) => {
        const content = readFileSync(join(PLAYBOOK_DIR, file), 'utf-8');
        return `## ${file}\n\n${content}`;
      })
      .join('\n\n---\n\n');
  } catch {
    return '';
  }
}

// GL data cache: { demo: { data, fetchedAt }, live: { data, fetchedAt } }
const glCache = {};
const GL_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchGLData(mode) {
  const sheetId = process.env.GL_SHEET_ID;
  if (!sheetId) return null;

  const tab = mode === 'live' ? 'Actual' : 'Dummy';
  const cacheKey = tab;

  // Return cached data if fresh
  if (glCache[cacheKey] && Date.now() - glCache[cacheKey].fetchedAt < GL_CACHE_TTL) {
    return glCache[cacheKey].data;
  }

  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
    const csv = await res.text();
    glCache[cacheKey] = { data: csv, fetchedAt: Date.now() };
    return csv;
  } catch (err) {
    console.error('GL fetch error:', err.message);
    // Return stale cache if available
    return glCache[cacheKey]?.data || null;
  }
}

const SYSTEM_PROMPT = `You are Luca, the Breeze Finance Operations Assistant — named after Luca Pacioli, the father of double-entry bookkeeping. You are the finance brain for Breeze, helping the team understand processes, query financial data, and run the finance function efficiently.

## Your role
- Answer questions using the Breeze Finance Playbook AND the live General Ledger (GL) data provided below.
- When asked about specific amounts, balances, expenses, or account details, use the GL data to give precise numbers.
- Reference specific account numbers, journal entries, SQL tables, processes, and systems mentioned in the playbook.
- Be concise and direct — your audience is finance professionals who need precise, actionable answers.
- Format responses with markdown: use code blocks for journal entries and SQL, tables where helpful, bullet points for steps.
- When presenting financial data, format currency values clearly and use tables for breakdowns.
- If asked something outside the scope of the playbook and GL data, clearly state that it's not covered.

`;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      hasApiKey: !!process.env.OPENROUTER_API_KEY,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, mode = 'demo' } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY is not configured' });
  }

  const playbook = loadPlaybookContent();
  const glData = await fetchGLData(mode);

  let systemContent = SYSTEM_PROMPT;
  systemContent += '## Breeze Finance Playbook\n\n';
  systemContent += playbook || '(No playbook files found.)';

  if (glData) {
    systemContent += '\n\n---\n\n## Live General Ledger Data (CSV)\n\n';
    systemContent += `The following is ${mode === 'live' ? 'real QuickBooks' : 'demo'} GL data in CSV format. Use it to answer questions about account balances, expenses, revenue, and financial details.\n\n`;
    systemContent += '```csv\n' + glData + '\n```';
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'moonshotai/kimi-k2',
        max_tokens: 4096,
        stream: true,
        messages: [
          { role: 'system', content: systemContent },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter API error:', err);
      if (!res.headersSent) {
        return res.status(502).json({ error: 'Failed to get response from AI' });
      }
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
            break;
          }
          try {
            const parsed = JSON.parse(data);
            const text = parsed.choices?.[0]?.delta?.content;
            if (text) {
              res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    }

    if (!res.writableEnded) {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (error) {
    console.error('OpenRouter API error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to get response from AI' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
      res.end();
    }
  }
}
