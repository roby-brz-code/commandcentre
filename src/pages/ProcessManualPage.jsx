import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const STARTER_QUESTIONS = [
  'How do I post revenue journals?',
  "What's the chargeback accounting process?",
  'Walk me through month-end close',
  'How does CKO Clearing reconciliation work?',
  'What are the prepaid amortization steps?',
  'How is merchant setup handled?',
];

function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-breeze-blue flex items-center justify-center mr-3 mt-1 shrink-0">
          <span className="text-white text-xs font-bold">M</span>
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-breeze-blue text-white rounded-br-sm'
            : 'bg-white border border-gray-200 text-gray-700 rounded-bl-sm shadow-card'
        }`}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-headings:font-semibold prose-p:text-gray-700 prose-code:text-breeze-blue prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-table:text-xs prose-th:bg-gray-50 prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-td:border-gray-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-breeze-dark flex items-center justify-center ml-3 mt-1 shrink-0">
          <span className="text-white text-xs font-semibold">Y</span>
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="w-7 h-7 rounded-full bg-breeze-blue flex items-center justify-center mr-3 mt-1 shrink-0">
        <span className="text-white text-xs font-bold">M</span>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl rounded-bl-sm px-4 py-3 shadow-card">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export default function ProcessManualPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
        body: JSON.stringify({ messages: newMessages }),
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
            <div className="w-14 h-14 rounded-2xl bg-breeze-blue flex items-center justify-center mb-5">
              <span className="text-white text-2xl font-bold">M</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Breeze Process Manual</h2>
            <p className="text-sm text-gray-500 mb-8 text-center max-w-md">
              Ask Marvin anything about Breeze finance operations — revenue recognition, reconciliation,
              month-end close, and more.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left text-sm px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-breeze-blue hover:bg-blue-50/50 transition-colors text-gray-600 hover:text-breeze-blue shadow-card cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Breeze finance processes..."
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
          Marvin answers from the Breeze Finance Playbook. Responses may need verification.
        </p>
      </div>
    </div>
  );
}
