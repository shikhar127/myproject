import { AIModel } from './types'

export const MODELS: AIModel[] = [
  { id: 'gpt-4o',            name: 'GPT-4o',           provider: 'openai' },
  { id: 'gpt-4o-mini',       name: 'GPT-4o mini',      provider: 'openai' },
  { id: 'gpt-4-turbo',       name: 'GPT-4 Turbo',      provider: 'openai' },
  { id: 'o1',                name: 'o1',                provider: 'openai' },
  { id: 'o1-mini',           name: 'o1-mini',           provider: 'openai' },
  { id: 'claude-opus-4-7',            name: 'Claude Opus 4',    provider: 'anthropic' },
  { id: 'claude-sonnet-4-6',          name: 'Claude Sonnet 4.6',provider: 'anthropic' },
  { id: 'claude-haiku-4-5-20251001',  name: 'Claude Haiku 4',   provider: 'anthropic' },
]

export const DEFAULT_MODEL_ID = 'gpt-4o'

export function getModel(id: string): AIModel {
  return MODELS.find(m => m.id === id) ?? MODELS[0]
}
