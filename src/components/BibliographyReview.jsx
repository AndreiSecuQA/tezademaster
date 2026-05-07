import { useState } from 'react'
import { useStore } from '../lib/store.js'
import { callAI } from '../lib/ai/index.js'
import { systemPrompt } from '../lib/prompts/system.js'
import { bibliographySuggestPrompt } from '../lib/prompts/sections.js'
import { ArrowLeft, ArrowRight, Loader2, Wand2, Plus, X, AlertTriangle } from 'lucide-react'

export function BibliographyReview() {
  const { language, provider, model, apiKey, info, plan, bibliography, setBibliography, setStep } = useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newEntry, setNewEntry] = useState('')

  async function suggest() {
    setLoading(true); setError('')
    try {
      const out = await callAI({
        provider, model, apiKey,
        system: systemPrompt(language),
        user: bibliographySuggestPrompt({ lang: language, info, plan }),
        temperature: 0.5, maxTokens: 3000,
      })
      const entries = out.split('\n')
        .map(l => l.replace(/^\s*\d+[.)]\s+/, '').trim())
        .filter(l => l.length > 5)
      setBibliography([...(bibliography || []), ...entries])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function update(idx, value) {
    const arr = [...bibliography]; arr[idx] = value; setBibliography(arr)
  }
  function remove(idx) {
    setBibliography(bibliography.filter((_, i) => i !== idx))
  }
  function add() {
    if (!newEntry.trim()) return
    setBibliography([...(bibliography || []), newEntry.trim()])
    setNewEntry('')
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold text-ink-900">Bibliografie</h2>
        <p className="text-sm text-ink-600 mt-1">
          AI-ul iti poate sugera surse formatate ISO 690:2012, dar este responsabilitatea ta sa le verifici. Surse incerte sunt marcate cu <code>[verifica]</code>.
        </p>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-sm text-amber-900">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <strong>Atentie:</strong> AI-urile pot inventa titluri si autori. Verifica fiecare sursa pe Google Scholar / catalogul bibliotecii inainte de a o include in teza.
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button disabled={loading} onClick={suggest} className="btn-secondary">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />} Sugereaza surse cu AI
          </button>
          <span className="text-xs text-ink-500">{(bibliography || []).length} intrari</span>
          {error && <span className="text-sm text-red-700">{error}</span>}
        </div>

        <div className="mt-4 space-y-1.5">
          {(bibliography || []).map((entry, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-xs font-mono text-ink-400 mt-2 w-6 text-right">{i + 1}.</span>
              <textarea
                className="input text-xs min-h-[42px]"
                value={entry}
                onChange={(e) => update(i, e.target.value)}
              />
              <button onClick={() => remove(i)} className="btn-ghost p-2"><X size={14} /></button>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-ink-200 pt-4">
          <label className="label">Adauga manual o sursa</label>
          <div className="flex gap-2">
            <textarea
              className="input text-xs"
              placeholder="ex. NEDERITA, Alexandru. Contabilitate financiara. Chisinau: ACAP, 2003. ISBN 9975-9702-1-4."
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
            />
            <button onClick={add} className="btn-secondary"><Plus size={14} /></button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => setStep('generation')} className="btn-ghost"><ArrowLeft size={16} /> Inapoi</button>
        <button onClick={() => setStep('download')} className="btn-primary">
          Continua la descarcare <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
