import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const glCache = { demo: { data: null, fetchedAt: 0 }, live: { data: null, fetchedAt: 0 } }
const GL_CACHE_TTL = 5 * 60 * 1000

async function fetchGLData(mode) {
  const sheetId = process.env.GL_SHEET_ID
  if (!sheetId) return null

  const now = Date.now()
  const cached = glCache[mode]
  if (cached.data && (now - cached.fetchedAt) < GL_CACHE_TTL) return cached.data

  const sheetName = mode === 'live' ? 'Actual' : 'Dummy'
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) throw new Error(`${res.status}`)
    const csv = await res.text()
    glCache[mode] = { data: csv, fetchedAt: now }
    return csv
  } catch (e) {
    console.error(`GL fetch error (${mode}):`, e.message)
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

        const glData = await fetchGLData(mode === 'live' ? 'live' : 'demo')

        let systemContent = `You are Luca, the Breeze Finance Operations Assistant — named after Luca Pacioli, the father of double-entry bookkeeping. You are the finance brain for Breeze, helping the team understand processes, query financial data, and run the finance function efficiently.

## Your role
- Answer questions about Breeze finance processes using the playbook content below.
- Answer questions about current financial data using the General Ledger data below (when available).
- Reference specific account numbers, journal entries, SQL tables, processes, and systems.
- When referencing financial data, cite specific account names and numbers from the GL.
- Be concise and direct — your audience is finance professionals who need precise, actionable answers.
- Format responses with markdown: use code blocks for journal entries and SQL, tables where helpful, bullet points for steps.
- If asked something outside the scope of the playbook and GL data, clearly state that it's not covered.

## Breeze Finance Playbook

${playbook || '(No playbook files found.)'}`

        if (glData) {
          systemContent += `\n\n---\n\n## General Ledger Data (Live from QuickBooks)\n\nThe following is the current General Ledger data exported from QuickBooks, synced automatically via Coupler.io. Use this data to answer questions about current balances, account activity, trial balance summaries, and specific transactions. The data is in CSV format.\n\n${glData}`
        } else {
          systemContent += `\n\n---\n\n## General Ledger Data\n\nGL data is not currently connected. You can only answer process/playbook questions. If asked about current balances or financial data, let the user know that GL data isn't available yet.`
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
  envPrefix: ['OPENROUTER_', 'GL_'],
})
