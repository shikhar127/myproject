import { useState, useRef, useCallback, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import Header from './components/Header'
import ChatPanel from './components/ChatPanel'
import CanvasEditor from './components/CanvasEditor'
import SettingsModal from './components/SettingsModal'
import { Message, Settings, WriteMode } from './types'
import { DEFAULT_MODEL_ID, getModel } from './models'

const DEFAULT_SETTINGS: Settings = {
  openaiKey: '',
  anthropicKey: '',
  selectedModelId: DEFAULT_MODEL_ID,
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('wh-settings')
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })
  const [isStreaming, setIsStreaming] = useState(false)
  const [mode, setMode] = useState<WriteMode>('chat')
  const [showSettings, setShowSettings] = useState(false)
  const editorRef = useRef<Editor | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    localStorage.setItem('wh-settings', JSON.stringify(settings))
  }, [settings])

  const getApiKey = useCallback(() => {
    const model = getModel(settings.selectedModelId)
    return model.provider === 'openai' ? settings.openaiKey : settings.anthropicKey
  }, [settings])

  const stream = useCallback(async (
    userText: string,
    onToken: (text: string) => void,
    systemPrompt: string,
    history: { role: 'user' | 'assistant'; content: string }[]
  ) => {
    const apiKey = getApiKey()
    const model = getModel(settings.selectedModelId)

    abortRef.current = new AbortController()

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: history,
        model: model.id,
        provider: model.provider,
        apiKey,
        systemPrompt,
      }),
      signal: abortRef.current.signal,
    })

    if (!res.ok) throw new Error(`Server error ${res.status}`)

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const lines = decoder.decode(value).split('\n')
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const payload = line.slice(6).trim()
        if (payload === '[DONE]') continue
        try {
          const { text, error } = JSON.parse(payload)
          if (error) throw new Error(error)
          if (text) onToken(text)
        } catch { /* skip malformed */ }
      }
    }
  }, [settings, getApiKey])

  const sendMessage = useCallback(async (userText: string) => {
    if (!getApiKey()) { setShowSettings(true); return }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsStreaming(true)

    const canvasText = editorRef.current?.getText() ?? ''
    const model = getModel(settings.selectedModelId)

    const systemPrompt = mode === 'canvas'
      ? `You are a collaborative writing assistant. Write content directly for the user's document — no preamble, no "here's the text", just the content itself. Respect their existing style if the document has content.\n\nCurrent document:\n---\n${canvasText || '(empty)'}\n---`
      : `You are a collaborative writing assistant helping a user with their document. Be concise and helpful. When suggesting text, keep it brief unless asked to write at length.\n\nCurrent document:\n---\n${canvasText || '(empty)'}\n---`

    const history = [...messages, userMsg]
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content === '[canvas]' ? '(previously wrote content to the canvas)' : m.content,
      }))

    const assistantId = crypto.randomUUID()
    let accumulated = ''

    try {
      if (mode === 'chat') {
        setMessages(prev => [...prev, {
          id: assistantId, role: 'assistant', content: '', timestamp: Date.now(),
        }])
        await stream(userText, (text) => {
          accumulated += text
          setMessages(prev => prev.map(m =>
            m.id === assistantId ? { ...m, content: accumulated } : m
          ))
        }, systemPrompt, history)
      } else {
        // Canvas mode: stream tokens directly into the editor
        const editor = editorRef.current
        if (editor) {
          const hasContent = editor.getText().trim().length > 0
          if (hasContent) {
            editor.chain().focus('end').insertContent('<p></p>').run()
          } else {
            editor.commands.focus('end')
          }
        }
        await stream(userText, (text) => {
          editorRef.current?.commands.insertContent(text)
        }, systemPrompt, history)

        setMessages(prev => [...prev, {
          id: assistantId, role: 'assistant', content: '[canvas]', timestamp: Date.now(),
        }])
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      if (msg !== 'signal is aborted without reason' && !msg.includes('AbortError')) {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(), role: 'assistant',
          content: `Error: ${msg}`, timestamp: Date.now(),
        }])
      }
    } finally {
      setIsStreaming(false)
    }
  }, [messages, settings, mode, getApiKey, stream])

  const applyToCanvas = useCallback((content: string) => {
    const editor = editorRef.current
    if (!editor) return
    const hasContent = editor.getText().trim().length > 0
    if (hasContent) {
      editor.chain().focus('end').insertContent('<p></p>').run()
    } else {
      editor.commands.focus('end')
    }
    editor.commands.insertContent(content)
  }, [])

  const handleSelectionAction = useCallback(async (
    action: string, selectedText: string, from: number, to: number
  ) => {
    if (!getApiKey() || !editorRef.current) return
    setIsStreaming(true)

    const actionPrompts: Record<string, string> = {
      rewrite:  'Rewrite this text to be clearer and more engaging. Return ONLY the rewritten text, nothing else.',
      expand:   'Expand this text with more depth and detail. Return ONLY the expanded text, nothing else.',
      shorten:  'Shorten this text while keeping the key ideas. Return ONLY the shortened text, nothing else.',
      fix:      'Fix all grammar, spelling, and punctuation errors. Return ONLY the corrected text, nothing else.',
      formal:   'Rewrite this in a formal, professional tone. Return ONLY the rewritten text, nothing else.',
      casual:   'Rewrite this in a casual, conversational tone. Return ONLY the rewritten text, nothing else.',
    }

    const editor = editorRef.current
    editor.chain().focus().deleteRange({ from, to }).run()

    try {
      await stream(selectedText, (text) => {
        editorRef.current?.commands.insertContent(text)
      }, actionPrompts[action] ?? actionPrompts.rewrite, [
        { role: 'user', content: selectedText },
      ])
    } catch { /* silently ignore abort */ } finally {
      setIsStreaming(false)
    }
  }, [settings, getApiKey, stream])

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      <Header
        selectedModelId={settings.selectedModelId}
        onModelChange={(id) => setSettings(prev => ({ ...prev, selectedModelId: id }))}
        onSettingsOpen={() => setShowSettings(true)}
        mode={mode}
        onModeChange={setMode}
        isStreaming={isStreaming}
        onStop={() => abortRef.current?.abort()}
      />
      <div className="flex-1 flex overflow-hidden">
        <ChatPanel
          messages={messages}
          isStreaming={isStreaming}
          mode={mode}
          onSend={sendMessage}
          onApplyToCanvas={applyToCanvas}
        />
        <div className="w-px bg-slate-200 shrink-0" />
        <CanvasEditor
          editorRef={editorRef}
          isStreaming={isStreaming}
          onSelectionAction={handleSelectionAction}
        />
      </div>
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={(s) => { setSettings(s); setShowSettings(false) }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
