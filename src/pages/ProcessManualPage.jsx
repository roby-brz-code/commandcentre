import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { prepareTaskById } from '../hooks/useCloseStore';

const STARTER_QUESTIONS = [
  'What was Payin Revenue last month?',
  'How are CKO Fees trending?',
  "What's the current CKO Clearing balance?",
  "What's the Merchant Funds Payable balance?",
  'Show me a P&L summary for January 2026',
  "What's our net income trend?",
];

function parseTaskCompleteTags(content) {
  const tags = [];
  const cleaned = content.replace(/\[TASK_COMPLETE:\s*([^\]]+)\]/g, (_, id) => {
    tags.push(id.trim());
    return '';
  });
  return { content: cleaned.trimEnd(), taskIds: tags };
}

function parseFollowUps(content) {
  const pattern = /\n+\*{0,2}Want to dig deeper\??\*{0,2}\s*\n([\s\S]*?)$/i;
  const match = content.match(pattern);
  if (!match) return { body: content, followUps: [] };

  const body = content.slice(0, match.index).trimEnd();
  const listSection = match[1];
  const followUps = [];
  const bulletPattern = /^[\s]*[-*•]\s+['""']?(.+?)['""']?\s*$/gm;
  let m;
  while ((m = bulletPattern.exec(listSection)) !== null) {
    let text = m[1].trim();
    text = text.replace(/^['""']+|['""']+$/g, '').trim();
    if (text) followUps.push(text);
  }

  return { body, followUps };
}

function getCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-white border border-green-200 rounded-xl shadow-lg text-sm text-gray-700 animate-slide-up">
      <span className="text-green-500 text-base">&#10003;</span>
      <span>{message}</span>
    </div>
  );
}

function QuestionChip({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left text-sm px-4 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-full text-breeze-blue hover:bg-breeze-blue hover:text-white transition-colors cursor-pointer"
    >
      {text}
    </button>
  );
}

function OwlAvatar({ size = 28, className = '' }) {
  return (
    <img
      src="/luca-owl-sm.png"
      alt="Luca"
      width={size}
      height={size}
      className={`rounded-full object-cover shrink-0 ${className}`}
    />
  );
}

function MarkdownLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-breeze-blue underline decoration-breeze-blue/30 hover:text-breeze-dark hover:decoration-breeze-dark/50 transition-colors">
      {children}
    </a>
  );
}

function MessageBubble({ message, onFollowUp }) {
  const isUser = message.role === 'user';
  const stripped = isUser ? message.content : parseTaskCompleteTags(message.content).content;
  const { body, followUps } = isUser
    ? { body: stripped, followUps: [] }
    : parseFollowUps(stripped);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5`}>
      {!isUser && (
        <div className="mr-3 mt-1">
          <OwlAvatar size={32} />
        </div>
      )}
      <div className="flex flex-col max-w-[78%]">
        <div
          className={`rounded-xl px-5 py-4 text-sm ${
            isUser
              ? 'bg-breeze-blue text-white rounded-br-sm'
              : 'bg-white border border-gray-200 text-gray-700 rounded-bl-sm shadow-card'
          }`}
        >
          {isUser ? (
            <p className="leading-relaxed">{message.content}</p>
          ) : (
            <div className="luca-markdown">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{ a: MarkdownLink }}
              >
                {body}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {followUps.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 ml-1">
            {followUps.map((q) => (
              <QuestionChip key={q} text={q} onClick={() => onFollowUp(q)} />
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-breeze-dark flex items-center justify-center ml-3 mt-1 shrink-0">
          <span className="text-white text-xs font-semibold">Y</span>
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-5">
      <div className="mr-3 mt-1">
        <OwlAvatar size={32} className="luca-thinking" />
      </div>
      <div className="bg-white border border-gray-200 rounded-xl rounded-bl-sm px-5 py-4 shadow-card">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

const CLOSE_ACTION_CHIPS = [
  { label: 'Run CKO Clearing balance check', query: "What's the current CKO Clearing / PSP Clearing balance? Check if it looks correct." },
  { label: 'Generate P&L variance analysis', query: 'Run a variance analysis comparing this month to last month on the P&L.' },
  { label: 'Review Balance Sheet balances', query: 'Do a Balance Sheet review — check all major account balances and flag anything unusual.' },
];

export default function ProcessManualPage({ dataMode = 'demo', consumePreload }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    setMessages([]);
    setInput('');
  }, [dataMode]);

  useEffect(() => {
    if (consumePreload) {
      const msg = consumePreload();
      if (msg) sendMessage(msg);
    }
  }, [consumePreload]);

  async function sendMessage(text) {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const assistantMessage = { role: 'assistant', content: '' };

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, mode: dataMode }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to get response');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      setMessages([...newMessages, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantMessage.content += parsed.text;
                setMessages([...newMessages, { ...assistantMessage }]);
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      }

      if (!assistantMessage.content) {
        assistantMessage.content = 'Sorry, I didn\'t receive a response. Please try again.';
        setMessages([...newMessages, { ...assistantMessage }]);
      }

      // Process TASK_COMPLETE tags — move to Luca Prepared (needs user confirmation to complete)
      const { taskIds } = parseTaskCompleteTags(assistantMessage.content);
      const month = getCurrentMonth();
      for (const taskId of taskIds) {
        const prepared = prepareTaskById(month, taskId, 'Luca');
        if (prepared) {
          setToasts((prev) => [...prev, { id: Date.now() + taskId, message: `Luca Prepared: '${prepared.task}' — review on Monthly Close board to confirm` }]);
        }
      }
    } catch (error) {
      assistantMessage.content = `Error: ${error.message}. Please check that the API key is configured in Vercel.`;
      setMessages([...newMessages, { ...assistantMessage }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full">
            <img
              src="/luca-owl.png"
              alt="Luca"
              className="w-24 h-24 mb-5"
            />
            <h2 className="text-xl font-semibold text-gray-800 mb-1">Luca</h2>
            <p className="text-sm text-gray-500 mb-8 text-center max-w-md">
              Ask about P&L, balance sheet, playbook processes, account balances, and more.
            </p>
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mb-6">
              {STARTER_QUESTIONS.map((q) => (
                <QuestionChip key={q} text={q} onClick={() => sendMessage(q)} />
              ))}
            </div>
            <div className="border-t border-gray-100 pt-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 text-center">Monthly Close Actions</p>
              <div className="flex flex-wrap justify-center gap-2">
                {CLOSE_ACTION_CHIPS.map((a) => (
                  <QuestionChip key={a.label} text={a.label} onClick={() => sendMessage(a.query)} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-[960px] mx-auto">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => { setMessages([]); setInput(''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-breeze-blue transition-colors cursor-pointer shadow-card"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Chat
              </button>
            </div>
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} onFollowUp={sendMessage} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <form onSubmit={handleSubmit} className="max-w-[960px] mx-auto flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Luca about Breeze finance..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-breeze-blue/20 focus:border-breeze-blue disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 bg-breeze-blue text-white text-sm font-medium rounded-xl hover:bg-breeze-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            Send
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-2">
          Luca answers from the Breeze Finance Playbook, P&L, and Balance Sheet. Responses may need verification.
        </p>
      </div>

      {/* Toast notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-2">
          {toasts.map((t) => (
            <Toast key={t.id} message={t.message} onDone={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
          ))}
        </div>
      )}
    </div>
  );
}
