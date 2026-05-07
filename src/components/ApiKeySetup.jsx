import { useState } from 'react'
import { useStore } from '../lib/store.js'
import { PROVIDERS, callAI } from '../lib/ai/index.js'
import { ArrowLeft, ArrowRight, ExternalLink, Loader2, KeyRound, CheckCircle2 } from 'lucide-react'

export function ApiKeySetup() {
  const provider = useStore((s) => s.provider)
  const setProvider = useStore((s) => s.setProvider)
  const model = useStore((s) => s.model)
  const setModel = useStore((s) => s.setModel)
  const apiKey = useStore((s) => s.apiKey)
  const setApiKey = useStore((s) => s.setApiKey)
  const setStep = useStore((s) => s.setStep)

  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null) // null | 'ok' | string

  const p = PROVIDERS[provider]

  async function testKey() {
    setTesting(true)
    setTestResult(null)
    try {
      const out = await callAI({
        provider,
        model: model || p.defaultModel,
        apiKey,
        system: 'You are a helpful assistant.',
        user: 'Reply with only the word OK.',
        temperature: 0,
        maxTokens: 8,
      })
      if (out && out.toUpperCase().includes('OK')) setTestResult('ok')
      else setTestResult('Raspunsul nu este recunoscut: ' + out.slice(0, 80))
    } catch (e) {
      setTestResult(e.message || 'Eroare necunoscuta')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold text-ink-900 flex items-center gap-2"><KeyRound size={18} /> Cheia ta API</h2>
        <p className="text-sm text-ink-600 mt-1">
          Alege un provider si introdu propria cheie API. Cheia este folosita doar in browser pentru a vorbi direct cu providerul ales.
        </p>

        <div className="mt-5 grid sm:grid-cols-3 gap-2">
          {Object.values(PROVIDERS).map((pr) => (
            <button
              key={pr.id}
              onClick={() => setProvider(pr.id)}
              className={
                'rounded-lg border p-3 text-left transition ' +
                (provider === pr.id
                  ? 'border-ink-900 ring-2 ring-ink-900/10 bg-ink-50'
                  : 'border-ink-200 hover:border-ink-400')
              }
            >
              <div className="text-sm font-medium text-ink-900">{pr.label}</div>
              <div className="text-xs text-ink-500 mt-1">cheia incepe cu <code className="bg-ink-100 px-1 rounded">{pr.keyHint}</code></div>
            </button>
          ))}
        </div>

        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Cheia API</label>
            <input
              type="password"
              autoComplete="off"
              spellCheck="false"
              className="input font-mono"
              placeholder={p.keyHint}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <a href={p.docsUrl} target="_blank" rel="noreferrer" className="hint inline-flex items-center gap-1 text-ink-500 hover:text-ink-900">
              De unde iei o cheie <ExternalLink size={11} />
            </a>
          </div>
          <div>
            <label className="label">Modelul</label>
            <select className="input" value={model || p.defaultModel} onChange={(e) => setModel(e.target.value)}>
              {p.models.map((m) => (
                <option key={m} value={m}>{m}{m === p.defaultModel ? ' (recomandat)' : ''}</option>
              ))}
            </select>
            <p className="hint">Modele mai puternice = calitate mai buna, costuri mai mari per generare.</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            disabled={!apiKey || testing}
            onClick={testKey}
            className="btn-secondary"
          >
            {testing ? <Loader2 size={14} className="animate-spin" /> : null}
            Testeaza cheia
          </button>
          {testResult === 'ok' && (
            <span className="inline-flex items-center gap-1 text-sm text-emerald-700">
              <CheckCircle2 size={16} /> Cheia functioneaza
            </span>
          )}
          {testResult && testResult !== 'ok' && (
            <span className="text-sm text-red-700">{testResult}</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => setStep('welcome')} className="btn-ghost"><ArrowLeft size={16} /> Inapoi</button>
        <button
          onClick={() => setStep('basicInfo')}
          disabled={!apiKey}
          className="btn-primary"
        >
          Continua <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
