import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const finCache = { pl: { data: null, fetchedAt: 0 }, bs: { data: null, fetchedAt: 0 } }
const CACHE_TTL = 5 * 60 * 1000

async function fetchSheetCSV(sheetId, cacheKey) {
  if (!sheetId) return null
  const now = Date.now()
  const cached = finCache[cacheKey]
  if (cached.data && (now - cached.fetchedAt) < CACHE_TTL) return cached.data

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) throw new Error(`${res.status}`)
    const csv = await res.text()
    finCache[cacheKey] = { data: csv, fetchedAt: now }
    return csv
  } catch (e) {
    console.error(`Sheet fetch error (${cacheKey}):`, e.message)
    return cached.data || null
  }
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
        const { messages } = JSON.parse(body)

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

        const [plData, bsData] = await Promise.all([
          fetchSheetCSV(process.env.PL_SHEET_ID, 'pl'),
          fetchSheetCSV(process.env.BS_SHEET_ID, 'bs'),
        ])

        let systemContent = `You are Luca, the Breeze Finance Operations Assistant — named after Luca Pacioli, the father of double-entry bookkeeping. You are the finance brain for Breeze, helping the team understand processes, query financial data, and run the finance function efficiently.

## Your role
- Answer questions about Breeze finance processes using the playbook content below.
- Answer questions about current financial data using the P&L and Balance Sheet data below (when available).
- Reference specific account numbers, journal entries, SQL tables, processes, and systems.
- When referencing financial data, cite specific account names, numbers, and time periods.
- Be concise and direct — your audience is finance professionals who need precise, actionable answers.
- Format responses with markdown: use code blocks for journal entries and SQL, tables where helpful, bullet points for steps.
- If asked something outside the scope of the playbook and financial data, clearly state that it's not covered.

## Breeze Finance Playbook

${playbook || '(No playbook files found.)'}`

        if (plData || bsData) {
          if (plData) systemContent += `\n\n---\n\n## Profit & Loss Data (Live from QuickBooks via Coupler.io)\n\nMonthly totals per account in CSV format (Report, Report date, Account id, Account name, Amount).\n\n${plData}`
          if (bsData) systemContent += `\n\n---\n\n## Balance Sheet Data (Live from QuickBooks via Coupler.io)\n\nMonthly snapshots in CSV format (account names as rows, months as columns).\n\n${bsData}`
        } else {
          systemContent += `\n\n---\n\n## Financial Data\n\nP&L and Balance Sheet data are not currently connected. Answer process/playbook questions only.`
        }

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
              model: 'moonshotai/kimi-k2',
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
  envPrefix: ['OPENROUTER_', 'PL_', 'BS_'],
})
