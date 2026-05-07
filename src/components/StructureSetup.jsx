import { useStore } from '../lib/store.js'
import { ArrowLeft, ArrowRight, Wand2 } from 'lucide-react'

const PRESET = `I. Cadrul teoretic
  1.1 Concepte de baza
  1.2 Evolutia si stadiul actual
II. Metodologia cercetarii si analiza
  2.1 Metodologia cercetarii
  2.2 Analiza datelor / sectorului
III. Studiu de caz si recomandari
  3.1 Prezentarea studiului de caz
  3.2 Rezultate si interpretari
  3.3 Recomandari`

export function StructureSetup() {
  const structureHint = useStore((s) => s.structureHint)
  const setStructureHint = useStore((s) => s.setStructureHint)
  const setStep = useStore((s) => s.setStep)

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold text-ink-900">Structura preferata (optional)</h2>
        <p className="text-sm text-ink-600 mt-1">
          Daca ai deja in minte capitolele si subcapitolele, scrie-le aici. Daca lasi gol, AI-ul iti va propune o structura logica si o vei putea ajusta in pasul urmator.
        </p>

        <div className="mt-4">
          <textarea
            className="input min-h-[220px] font-mono text-xs"
            placeholder={PRESET}
            value={structureHint}
            onChange={(e) => setStructureHint(e.target.value)}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="hint">Numerotare: I, II, III pentru capitole; 1.1, 1.2 pentru subcapitole. Ghidul ASEM cere 2-4 capitole, fiecare cu 2-4 subcapitole.</p>
            <button onClick={() => setStructureHint(PRESET)} className="btn-ghost text-xs">
              <Wand2 size={14} /> Foloseste un sablon
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => setStep('basicInfo')} className="btn-ghost"><ArrowLeft size={16} /> Inapoi</button>
        <button onClick={() => setStep('documents')} className="btn-primary">
          Continua <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
