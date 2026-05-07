// Anthropic Messages API client (browser-side)
// Requires the special header to allow direct browser calls.

const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929'

export async function callAnthropic({ apiKey, model = DEFAULT_MODEL, system, user, temperature = 0.4, maxTokens = 4096 }) {
  if (!apiKey) throw new Error('Lipseste cheia API Anthropic.')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system: system || undefined,
      messages: [{ role: 'user', content: user }],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Anthropic ${res.status}: ${text.slice(0, 400)}`)
  }
  const data = await res.json()
  // Concatenate text blocks
  return (data.content || [])
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
    .trim()
}
