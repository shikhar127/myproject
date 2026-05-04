import { Router, Request, Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const router = Router()

interface ChatBody {
  messages: { role: 'user' | 'assistant'; content: string }[]
  model: string
  provider: 'openai' | 'anthropic'
  apiKey: string
  systemPrompt: string
}

router.post('/chat', async (req: Request, res: Response) => {
  const { messages, model, provider, apiKey, systemPrompt } = req.body as ChatBody

  if (!apiKey?.trim()) {
    res.status(400).json({ error: 'API key is required' })
    return
  }
  if (!messages?.length) {
    res.status(400).json({ error: 'messages array is required' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`)

  try {
    if (provider === 'anthropic') {
      const client = new Anthropic({ apiKey })

      const stream = client.messages.stream({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages,
      })

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          send({ text: event.delta.text })
        }
      }
    } else {
      // OpenAI + compatible providers
      const client = new OpenAI({ apiKey })

      // o1 family doesn't support system role — inject as first user message
      const isO1 = model.startsWith('o1')
      const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = isO1
        ? [{ role: 'user', content: `Context: ${systemPrompt}` }, ...messages]
        : [{ role: 'system', content: systemPrompt }, ...messages]

      const stream = await client.chat.completions.create({
        model,
        messages: chatMessages,
        stream: true,
      })

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content
        if (text) send({ text })
      }
    }

    res.write('data: [DONE]\n\n')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    send({ error: message })
  } finally {
    res.end()
  }
})

export default router
