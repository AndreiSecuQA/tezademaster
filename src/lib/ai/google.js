// Google Gemini API client (browser-side)

const DEFAULT_MODEL = 'gemini-2.5-flash'

export async function callGoogle({ apiKey, model = DEFAULT_MODEL, system, user, temperature = 0.4, maxTokens = 4096, json = false }) {
  if (!apiKey) throw new Error('Lipseste cheia API Google.')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`

  const body = {
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  }
  if (json) {
    body.generationConfig.responseMimeType = 'application/json'
  }
  if (system) {
    body.systemInstruction = { role: 'system', parts: [{ text: system }] }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google ${res.status}: ${text.slice(0, 400)}`)
  }
  const data = await res.json()
  const parts = data.candidates?.[0]?.content?.parts || []
  return parts.map(p => p.text || '').join('').trim()
}
