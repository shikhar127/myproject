export type Provider = 'openai' | 'anthropic'

export interface AIModel {
  id: string
  name: string
  provider: Provider
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Settings {
  openaiKey: string
  anthropicKey: string
  selectedModelId: string
}

export type WriteMode = 'chat' | 'canvas'
