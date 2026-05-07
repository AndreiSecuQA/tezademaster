// Unified AI provider interface.
// All call signatures: { system, user, temperature?, maxTokens? } -> string

import { callOpenAI } from './openai.js'
import { callAnthropic } from './anthropic.js'
import { callGoogle } from './google.js'

export const PROVIDERS = {
  openai: {
    id: 'openai',
    label: 'OpenAI (ChatGPT)',
    keyHint: 'sk-...',
    defaultModel: 'gpt-4o',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4.1', 'gpt-4.1-mini'],
    docsUrl: 'https://platform.openai.com/api-keys',
    call: callOpenAI,
  },
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic (Claude)',
    keyHint: 'sk-ant-...',
    defaultModel: 'claude-sonnet-4-5-20250929',
    models: ['claude-sonnet-4-5-20250929', 'claude-opus-4-1-20250805', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
    docsUrl: 'https://console.anthropic.com/settings/keys',
    call: callAnthropic,
  },
  google: {
    id: 'google',
    label: 'Google (Gemini)',
    keyHint: 'AIza...',
    defaultModel: 'gemini-2.5-flash',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-1.5-pro-latest', 'gemini-1.5-flash-latest'],
    docsUrl: 'https://aistudio.google.com/app/apikey',
    call: callGoogle,
  },
}

export async function callAI({ provider, model, apiKey, system, user, temperature, maxTokens }) {
  const p = PROVIDERS[provider]
  if (!p) throw new Error(`Provider necunoscut: ${provider}`)
  return p.call({
    apiKey,
    model: model || p.defaultModel,
    system,
    user,
    temperature,
    maxTokens,
  })
}
