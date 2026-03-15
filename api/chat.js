import Anthropic from '@anthropic-ai/sdk';
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

const SYSTEM_PROMPT = `You are Marvin, the Breeze Finance Operations Assistant. You help the Breeze finance team understand and follow internal finance processes.

## Your role
- Answer questions using ONLY the Breeze Finance Playbook content provided below.
- Reference specific account numbers, journal entries, SQL tables, processes, and systems mentioned in the playbook.
- Be concise and direct — your audience is finance professionals who need precise, actionable answers.
- Format responses with markdown: use code blocks for journal entries and SQL, tables where helpful, bullet points for steps.
- If asked something outside the scope of the playbook, clearly state that it's not covered and suggest which section might be closest.

## Breeze Finance Playbook

`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured' });
  }

  const playbook = loadPlaybookContent();

  const client = new Anthropic({ apiKey });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = await client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT + (playbook || '(No playbook files found. Please add markdown files to /public/playbook/)'),
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.text) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Anthropic API error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to get response from AI' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
      res.end();
    }
  }
}
