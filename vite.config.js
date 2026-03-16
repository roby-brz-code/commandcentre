import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const FINANCIAL_KEYWORDS = /\b(revenue|expense|spend|spending|cost|balance|trend|compare|comparison|margin|profit|loss|income|budget|variance|drill|breakdown|detail|vendor|what's in|composition|reconcil|transaction|p&l|pl|bs|month-over-month|mom|yoy|year-over-year|cash|fees|growth|net income|gross|ebitda|opex|capex|arpu|burn|runway|payable|receivable|clearing|settlement|payin|payout|chargeback|refund|processing|interchange|assessment|software|payroll|rent|total|average|sum|quarterly|q[1-4]|january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/i

function detectModel(messages) {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
  if (!lastUserMsg) return 'moonshotai/kimi-k2'
  return FINANCIAL_KEYWORDS.test(lastUserMsg.content)
    ? 'anthropic/claude-sonnet-4'
    : 'moonshotai/kimi-k2'
}

function loadCSV(filename) {
  try {
    const path = join(process.cwd(), 'public', 'data', filename)
    if (!existsSync(path)) return null
    return readFileSync(path, 'utf-8')
  } catch {
    return null
  }
}

function loadFinancialData(mode) {
  if (mode === 'live') {
    return { pl: loadCSV('pl_live.csv'), bs: loadCSV('bs_live.csv'), plDetail: loadCSV('pl_live_detail.csv'), transactions: loadCSV('dummy_transactions.csv') }
  }
  return { pl: loadCSV('dummy_pl.csv'), bs: loadCSV('dummy_bs.csv'), plDetail: loadCSV('dummy_pl_detail.csv'), transactions: loadCSV('dummy_transactions.csv') }
}

function apiPlugin() {
  return {
    name: 'api-chat',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        let body = ''
        for await (const chunk of req) body += chunk
        const { messages, mode = 'demo' } = JSON.parse(body)

        const apiKey = process.env.OPENROUTER_API_KEY
        if (!apiKey) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'OPENROUTER_API_KEY is not configured. Create a .env file with OPENROUTER_API_KEY=your-key' }))
          return
        }

        const playbookDir = join(process.cwd(), 'public', 'playbook')
        let playbook = ''
        try {
          const files = readdirSync(playbookDir)
            .filter((f) => f.endsWith('.md'))
            .sort((a, b) => parseInt(a) - parseInt(b))
          playbook = files
            .map((f) => `## ${f}\n\n${readFileSync(join(playbookDir, f), 'utf-8')}`)
            .join('\n\n---\n\n')
        } catch { /* no playbook files yet */ }

        const { pl: plData, bs: bsData, plDetail: plDetailData, transactions: txnData } = loadFinancialData(mode === 'live' ? 'live' : 'demo')

        let systemContent = `You are Luca, the Breeze Finance Operations Assistant — named after Luca Pacioli, the father of double-entry bookkeeping. You are the finance brain for Breeze, helping the team understand processes, query financial data, and run the finance function efficiently.

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

## Breeze Finance Playbook

${playbook || '(No playbook files found.)'}`

        if (plData || bsData) {
          if (plData) systemContent += `\n\n---\n\n## Profit & Loss Data (from QuickBooks via Coupler.io)\n\nMonthly totals per account in CSV format (Report, Report date, Account id, Account name, Amount).\n\n${plData}`
          if (plDetailData) systemContent += `\n\n---\n\n## P&L Transaction Detail (vendor-level breakdowns)\n\nLine-item detail for major P&L accounts, showing vendor/description breakdowns per month. When a user asks what's inside an expense or revenue category, use this data to show the composition. CSV format: Report date, Account id, Account name, Vendor/Description, Amount.\n\n${plDetailData}`
          if (txnData) systemContent += `\n\n---\n\n## Transaction Detail (individual transactions)\n\nIndividual transaction records with vendor, memo, and amount. CSV format: Date, Account id, Account name, Vendor/Payee, Memo, Amount, Type. Use this for detailed reconciliation and transaction-level analysis.\n\n${txnData}`
          if (bsData) systemContent += `\n\n---\n\n## Balance Sheet Data (from QuickBooks via Coupler.io)\n\nMonthly snapshots in CSV format (account names as rows, months as columns).\n\n${bsData}`
        } else {
          systemContent += `\n\n---\n\n## Financial Data\n\nP&L and Balance Sheet data files are not available. You can only answer process/playbook questions.`
        }

        const model = detectModel(messages)
        console.log(`Model selected: ${model}`)

        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')

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
          })

          if (!response.ok) {
            const err = await response.text()
            console.error('OpenRouter error:', err)
            res.end(`data: ${JSON.stringify({ error: 'AI request failed' })}\n\ndata: [DONE]\n\n`)
            return
          }

          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                if (data === '[DONE]') break
                try {
                  const parsed = JSON.parse(data)
                  const text = parsed.choices?.[0]?.delta?.content
                  if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`)
                } catch { /* skip */ }
              }
            }
          }

          res.write('data: [DONE]\n\n')
          res.end()
        } catch (error) {
          console.error('OpenRouter error:', error)
          res.end(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\ndata: [DONE]\n\n`)
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiPlugin()],
  envPrefix: ['OPENROUTER_'],
})
