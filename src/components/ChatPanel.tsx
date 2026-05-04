import { useState, useRef, useEffect } from 'react'
import { Message, WriteMode } from '../types'

interface Props {
  messages: Message[]
  isStreaming: boolean
  mode: WriteMode
  onSend: (text: string) => void
  onApplyToCanvas: (content: string) => void
}

export default function ChatPanel({ messages, isStreaming, mode, onSend, onApplyToCanvas }: Props) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const submit = () => {
    const text = input.trim()
    if (!text || isStreaming) return
    onSend(text)
    setInput('')
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="w-72 shrink-0 flex flex-col bg-white border-r border-slate-100">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="mt-12 text-center text-slate-400 text-sm px-4">
            <p className="font-medium text-slate-500 mb-1">
              {mode === 'canvas' ? 'Canvas mode' : 'Chat mode'}
            </p>
            <p className="text-xs leading-relaxed">
              {mode === 'canvas'
                ? 'AI writes directly into the document as you describe what you want.'
                : 'Chat with the AI about your document. Use → Canvas to apply any response.'}
            </p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.content === '[canvas]' ? (
              <div className="text-xs text-slate-400 italic px-1">
                Wrote to canvas
              </div>
            ) : (
              <div className={`max-w-[95%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-slate-100 text-slate-800 rounded-bl-sm'
              }`}>
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                {msg.role === 'assistant' && msg.content && (
                  <button
                    onClick={() => onApplyToCanvas(msg.content)}
                    className="mt-1.5 text-xs text-indigo-600 bg-white/80 hover:bg-white rounded-full px-2.5 py-0.5 transition-colors border border-indigo-100"
                  >
                    → Canvas
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {isStreaming && mode === 'canvas' && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-3 py-2 text-xs text-slate-500 italic">
              Writing to canvas…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'canvas' ? 'What should I write?' : 'Ask anything…'}
            rows={2}
            className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400"
          />
          <button
            onClick={submit}
            disabled={!input.trim() || isStreaming}
            className="shrink-0 w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center disabled:opacity-30 hover:bg-indigo-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1.5 px-1">
          {mode === 'canvas' ? 'AI writes to doc' : 'Shift+Enter for newline'}
        </p>
      </div>
    </div>
  )
}
