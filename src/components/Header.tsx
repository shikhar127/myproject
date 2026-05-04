import { WriteMode } from '../types'
import { MODELS } from '../models'

interface Props {
  selectedModelId: string
  onModelChange: (id: string) => void
  onSettingsOpen: () => void
  mode: WriteMode
  onModeChange: (mode: WriteMode) => void
  isStreaming: boolean
  onStop: () => void
}

export default function Header({
  selectedModelId, onModelChange, onSettingsOpen,
  mode, onModeChange, isStreaming, onStop,
}: Props) {
  return (
    <header className="h-12 bg-slate-900 flex items-center px-4 gap-3 shrink-0 border-b border-slate-800">
      <span className="text-white font-semibold text-sm tracking-tight select-none">
        Writing Helper
      </span>

      {/* Mode toggle */}
      <div className="flex items-center bg-slate-800 rounded-lg p-0.5">
        {(['chat', 'canvas'] as WriteMode[]).map(m => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              mode === m
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {m === 'chat' ? '💬 Chat' : '✏️ Canvas'}
          </button>
        ))}
      </div>

      {/* Model selector */}
      <select
        value={selectedModelId}
        onChange={e => onModelChange(e.target.value)}
        className="bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
      >
        <optgroup label="── OpenAI ──">
          {MODELS.filter(m => m.provider === 'openai').map(model => (
            <option key={model.id} value={model.id}>{model.name}</option>
          ))}
        </optgroup>
        <optgroup label="── Anthropic ──">
          {MODELS.filter(m => m.provider === 'anthropic').map(model => (
            <option key={model.id} value={model.id}>{model.name}</option>
          ))}
        </optgroup>
      </select>

      <div className="ml-auto flex items-center gap-2">
        {isStreaming && (
          <button
            onClick={onStop}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
          >
            ■ Stop
          </button>
        )}
        <button
          onClick={onSettingsOpen}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg transition-colors"
        >
          API Keys
        </button>
      </div>
    </header>
  )
}
