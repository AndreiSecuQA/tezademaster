import { useState } from 'react'
import { useStore } from '../lib/store.js'
import { generateThesisDocx } from '../lib/docx/generator.js'
import { ArrowLeft, Download as DownloadIcon, Loader2, RotateCcw, AlertTriangle } from 'lucide-react'

export function Download() {
  const state = useStore()
  const setStep = useStore((s) => s.setStep)
  const reset = useStore((s) => s.reset)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleDownload() {
    setBusy(true); setError(''); setDone(false)
    try {
      await generateThesisDocx({
        language: state.language,
        info: state.info,
        plan: state.plan,
        sections: state.sections,
        bibliography: state.bibliography || [],
      })
      setDone(true)
    } catch (e) {
      setError(e.message || 'Eroare la generarea documentului.')
    } finally {
      setBusy(false)
    }
  }

  function handleReset() {
    if (confirm('Esti sigur ca vrei sa stergi toate datele si sa reincepi? Aceasta actiune nu poate fi anulata.')) {
      reset()
    }
  }

  const wordCount = (text) => (text || '').split(/\s+/).filter(Boolean).length
  const totalWords =
    wordCount(state.sections.introduction) +
    state.sections.chapters.reduce((acc, c) => acc + wordCount(c), 0) +
    wordCount(state.sections.conclusions)
  const approxPages = Math.round(totalWords / 350)

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold text-ink-900">Descarca teza</h2>
        <p className="text-sm text-ink-600 mt-1">
          Documentul este formatat conform ghidului ASEM: TNR 12pt, 1.5 spatiu, margini 30/25/15/25 mm, paginatie, structura completa cu pagina de titlu, declaratie, cuprins, capitole, concluzii, bibliografie, adnotare RO + EN si placeholder de anexe.
        </p>

        <div className="mt-5 grid sm:grid-cols-3 gap-3 text-center">
          <Stat label="Cuvinte" value={totalWords.toLocaleString()} />
          <Stat label="Pagini estimate" value={`~${approxPages}`} />
          <Stat label="Capitole" value={state.plan?.chapters.length || 0} />
        </div>

        <div className="mt-6">
          <button onClick={handleDownload} disabled={busy} className="btn-primary">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <DownloadIcon size={16} />}
            Descarca .docx
          </button>
          {done && <span className="ml-3 text-sm text-emerald-700">Fisierul a fost descarcat.</span>}
          {error && <span className="ml-3 text-sm text-red-700">{error}</span>}
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-sm text-amber-900">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            Documentul este un punct de plecare. <strong>Citeste-l integral, verifica datele, sursele si exemplele inventate de AI</strong> si adauga manual tabelele/figurile/anexele care depind de studiul tau real. Mentinerea pragului antiplagiat ASEM este responsabilitatea ta.
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => setStep('bibliography')} className="btn-ghost"><ArrowLeft size={16} /> Inapoi</button>
        <button onClick={handleReset} className="btn-secondary">
          <RotateCcw size={14} /> Reseteaza si incepe alta teza
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-ink-200 p-3">
      <div className="text-xs text-ink-500">{label}</div>
      <div className="text-lg font-semibold text-ink-900 mt-0.5">{value}</div>
    </div>
  )
}
