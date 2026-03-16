import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const PLAYBOOK_DIR = join(process.cwd(), 'public', 'playbook');
const DATA_DIR = join(process.cwd(), 'public', 'data');

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

function loadCSV(filename) {
  try {
    const path = join(DATA_DIR, filename);
    if (!existsSync(path)) return null;
    return readFileSync(path, 'utf-8');
  } catch {
    return null;
  }
}

const FINANCIAL_KEYWORDS = /\b(revenue|expense|spend|spending|cost|balance|trend|compare|comparison|margin|profit|loss|income|budget|variance|drill|breakdown|detail|vendor|what's in|composition|reconcil|transaction|p&l|pl|bs|month-over-month|mom|yoy|year-over-year|cash|fees|growth|net income|gross|ebitda|opex|capex|arpu|burn|runway|payable|receivable|clearing|settlement|payin|payout|chargeback|refund|processing|interchange|assessment|software|payroll|rent|total|average|sum|quarterly|q[1-4]|january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/i;

function detectModel(messages) {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUserMsg) return 'moonshotai/kimi-k2';
  return FINANCIAL_KEYWORDS.test(lastUserMsg.content)
    ? 'anthropic/claude-sonnet-4'
    : 'moonshotai/kimi-k2';
}

function loadFinancialData(mode) {
  if (mode === 'live') {
    return {
      pl: loadCSV('pl_live.csv'),
      bs: loadCSV('bs_live.csv'),
      plDetail: loadCSV('pl_live_detail.csv'),
      transactions: loadCSV('dummy_transactions.csv'),
    };
  }
  return {
    pl: loadCSV('dummy_pl.csv'),
    bs: loadCSV('dummy_bs.csv'),
    plDetail: loadCSV('dummy_pl_detail.csv'),
    transactions: loadCSV('dummy_transactions.csv'),
  };
}

const SYSTEM_PROMPT = `You are Luca, the Breeze Finance Operations Assistant — named after Luca Pacioli, the father of double-entry bookkeeping. You are the finance brain for Breeze, helping the team understand processes, query financial data, and run the finance function efficiently.

## Your role
- Answer questions about Breeze finance processes using the playbook content below.
- Answer questions about current financial data using the P&L and Balance Sheet data below (when available).
- Reference specific account numbers, journal entries, SQL tables, processes, and systems.
- When referencing financial data, cite specific account names, numbers, and time periods.
- Be concise and direct — your audience is finance professionals who need precise, actionable answers.
- Format responses with markdown: use code blocks for journal entries and SQL, tables where helpful, bullet points for steps.
- If asked something outside the scope of the playbook and financial data, clearly state that it's not covered.

## Analytical behavior for financial data questions
When answering questions about financial data, don't just return the number. Be an analytical finance partner:

1. **Give the answer first** — always lead with the direct answer to the question.
2. **Add context** — compare to previous month, show the trend direction, note if it's unusual.
3. **Flag anomalies** — if a line item spiked or dropped significantly (>20% MoM change), call it out proactively.
4. **Suggest follow-ups** — at the end of your response, suggest 2-3 natural follow-up questions the user might want to ask.

For example, if asked "What was software spend in January?":
- Lead with the number: "$37,470"
- Add context: "This is down 53% from December ($79,168), which included an annual renewal"
- Note the trend: "Software has averaged $X/month over the last 6 months"
- Suggest follow-ups: "Want me to break down the vendors?" / "How does this compare to the trailing 3-month average?"

When the user asks about a specific expense or revenue line item (e.g. "what's in Software Subscriptions?"), use the P&L Transaction Detail data to break it down by vendor/description. Show a table of the vendors and amounts for that account in the requested period. If no period is specified, default to the most recent month.

When transaction-level detail is available, proactively offer to drill down into the composition of any line item.

Format suggested follow-up questions as a bulleted list at the end of your response under a heading like **Want to dig deeper?** — make them specific to the data just discussed, not generic.

## Monthly Close Integration

You can perform certain finance tasks directly by analyzing the financial data you have access to. When you complete a task that matches a Monthly Close checklist item, include a special tag at the very end of your response (after the "Want to dig deeper?" section if present) in this exact format:

[TASK_COMPLETE: task_id]

This moves the task to the "Luca Prepared" column on the Monthly Close board. The user must then review your work and confirm before it moves to Complete. So be thorough in your analysis — the user will be checking your work.

The available task IDs and what triggers them:
- cash-6: When you check the CKO Clearing / PSP Clearing balance
- close-1: When you do a P&L review or summary
- close-2: When you do a Balance Sheet review
- close-4: When you do a variance analysis or MoM comparison

For example, after checking the clearing account balance, end your response with:
[TASK_COMPLETE: cash-6]

You may include multiple tags if multiple tasks are completed in a single response. Always place the tags on the very last lines after all other content.

## Financial data notes
- The P&L data is monthly totals per account. Rows format: Report, Report date, Account id, Account name, Amount.
- The Balance Sheet data is monthly snapshots. Account names as rows, months as columns.
- Data is synced from QuickBooks via Coupler.io.

## Playbook Section Links (Notion)
When you reference a specific playbook section in your response, include a clickable link to the Notion source at the end of your response.
Format: 📖 Source: [Section Name](notion_url)
If you reference multiple sections, list all relevant links.

- Section 0 (Operating Cadence): https://www.notion.so/breezecash/0-Operating-Cadence-31eafd1ab00281078ac8dd452ecf6ee9
- Section 1 (Revenue Recognition): https://www.notion.so/breezecash/1-Revenue-Recognition-31eafd1ab002815eb629fc9d5f1824dc
- Section 2 (Chargeback Accounting): https://www.notion.so/breezecash/2-Chargeback-Accounting-31eafd1ab0028112b036d54022198ef1
- Section 3 (Month-End Close): https://www.notion.so/breezecash/3-Month-End-Close-Checklist-31eafd1ab00281c78d35da7f18e91836
- Section 4 (Prepaid Amortization): https://www.notion.so/breezecash/4-Prepaid-Amortization-Year-End-31eafd1ab0028196806fd0857a0266c5
- Section 5 (Settlement Operations): https://www.notion.so/breezecash/5-Settlement-Operations-31eafd1ab0028196a543ce97ea8091eb
- Section 6 (Reconciliation): https://www.notion.so/breezecash/6-Reconciliation-31eafd1ab00281a6b357ef0b7e4f0f12
- Section 7 (AP, Billing & Expenses): https://www.notion.so/breezecash/7-AP-Billing-Expenses-31eafd1ab0028181b3ccc4dda3831a65
- Section 8 (Merchant Setup): https://www.notion.so/breezecash/8-Merchant-Setup-Underwriting-31eafd1ab002816bb179f5611c60a75e
- Section 9 (Treasury & Cash Management): https://www.notion.so/breezecash/9-Treasury-Cash-Management-31eafd1ab00281338eb8fa21b5667701
- Section 10 (Tax & Compliance): https://www.notion.so/breezecash/10-Tax-Compliance-31eafd1ab00281a6b083cc607ed8d4b2
- Section 11 (FP&A): https://www.notion.so/breezecash/11-FP-A-Strategic-Finance-31eafd1ab002813c876fd10a732af641
- Section 12 (Data & Analytics): https://www.notion.so/breezecash/12-Data-Analytics-Infrastructure-31eafd1ab00281b2ba77f9ff132381b6
- Full Playbook: https://www.notion.so/breezecash/Finance-Playbook-v2-31eafd1ab002813c9d46f5237bcfa989

## Breeze Finance Playbook

`;

const PL_PROMPT = `

---

## Profit & Loss Data (from QuickBooks via Coupler.io)

Monthly totals per account in CSV format (Report, Report date, Account id, Account name, Amount). Use this to answer questions about revenue, expenses, margins, and trends over time.

`;

const PL_DETAIL_PROMPT = `

---

## P&L Transaction Detail (vendor-level breakdowns)

Line-item detail for major P&L accounts, showing vendor/description breakdowns per month. When a user asks what's inside an expense or revenue category, use this data to show the composition. CSV format: Report date, Account id, Account name, Vendor/Description, Amount.

`;

const BS_PROMPT = `

---

## Balance Sheet Data (from QuickBooks via Coupler.io)

Monthly snapshots in CSV format (account names as rows, months as columns). Use this to answer questions about current balances, assets, liabilities, equity, and cash positions.

`;

const FIN_UNAVAILABLE = `

---

## Financial Data

P&L and Balance Sheet data files are not available. You can only answer process/playbook questions. If asked about current balances, revenue, or financial data, let the user know that financial data isn't connected yet.

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
  const { pl, bs, plDetail, transactions } = loadFinancialData(mode === 'live' ? 'live' : 'demo');

  let systemContent = SYSTEM_PROMPT + (playbook || '(No playbook files found.)');

  if (pl || bs) {
    if (pl) systemContent += PL_PROMPT + pl;
    if (plDetail) systemContent += PL_DETAIL_PROMPT + plDetail;
    if (transactions) systemContent += '\n\n---\n\n## Transaction Detail (individual transactions)\n\nIndividual transaction records with vendor, memo, and amount. CSV format: Date, Account id, Account name, Vendor/Payee, Memo, Amount, Type. Use this for detailed reconciliation and transaction-level analysis.\n\n' + transactions;
    if (bs) systemContent += BS_PROMPT + bs;
  } else {
    systemContent += FIN_UNAVAILABLE;
  }

  const model = detectModel(messages);
  console.log(`Model selected: ${model}`);

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
        model,
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
