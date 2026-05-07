// OpenAI Chat Completions client (browser-side)
// Uses fetch directly so we don't need the SDK and avoid bundling issues.

const DEFAULT_MODEL = 'gpt-4o'

export async function callOpenAI({ apiKey, model = DEFAULT_MODEL, system, user, temperature = 0.4, maxTokens = 4096, json = false }) {
  if (!apiKey) throw new Error('Lipseste cheia API OpenAI.')

  const messages = []
  if (system) messages.push({ role: 'system', content: system })
  messages.push({ role: 'user', content: user })

  const payload = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  }
  if (json) payload.response_format = { type: 'json_object' }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 400)}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() || ''
}
