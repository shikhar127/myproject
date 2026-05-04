import { useState } from 'react'
import { Settings } from '../types'

interface Props {
  settings: Settings
  onSave: (settings: Settings) => void
  onClose: () => void
}

export default function SettingsModal({ settings, onSave, onClose }: Props) {
  const [form, setForm] = useState(settings)

  const set = (key: keyof Settings, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">API Keys</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              OpenAI API Key
              <span className="ml-2 font-normal text-slate-400 text-xs">GPT-4o, GPT-4 Turbo, o1</span>
            </label>
            <input
              type="password"
              value={form.openaiKey}
              onChange={e => set('openaiKey', e.target.value)}
              placeholder="sk-…"
              autoComplete="off"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Anthropic API Key
              <span className="ml-2 font-normal text-slate-400 text-xs">Claude Opus, Sonnet, Haiku</span>
            </label>
            <input
              type="password"
              value={form.anthropicKey}
              onChange={e => set('anthropicKey', e.target.value)}
              placeholder="sk-ant-…"
              autoComplete="off"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 leading-relaxed">
            Keys are stored only in your browser's <code className="font-mono">localStorage</code> and
            sent to AI providers through the local proxy server. They never leave your machine.
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
