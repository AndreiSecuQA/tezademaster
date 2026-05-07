import { useStore } from '../lib/store.js'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const FIELDS = [
  { key: 'thesisTitle', label: 'Tema (titlul) tezei', required: true, placeholder: 'ex. Particularitatile dezvoltarii businessului on-line in Republica Moldova', full: true },
  { key: 'authorName', label: 'Numele si prenumele autorului', required: true, placeholder: 'ex. Ion Popescu' },
  { key: 'authorGroup', label: 'Grupa academica', required: false, placeholder: 'ex. AA-121m' },
  { key: 'advisorName', label: 'Numele conducatorului stiintific', required: true, placeholder: 'ex. Maria Ionescu' },
  { key: 'advisorTitle', label: 'Titlul stiintifico-didactic al conducatorului', required: false, placeholder: 'ex. dr., conf. univ.' },
  { key: 'department', label: 'Catedra de profil', required: true, placeholder: 'ex. Management' },
  { key: 'program', label: 'Programul de masterat', required: true, placeholder: 'ex. Administrarea afacerilor' },
  { key: 'year', label: 'Anul', required: true, placeholder: '2026' },
]

export function BasicInfo() {
  const info = useStore((s) => s.info)
  const setInfoField = useStore((s) => s.setInfoField)
  const setStep = useStore((s) => s.setStep)

  const required = FIELDS.filter((f) => f.required)
  const ok = required.every((f) => (info[f.key] || '').trim().length > 0)

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold text-ink-900">Datele tezei</h2>
        <p className="text-sm text-ink-600 mt-1">
          Aceste date sunt folosite pentru pagina de titlu, coperta si declaratia pe propria raspundere — exact ca in ghidul ASEM.
        </p>

        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
              <label className="label">
                {f.label} {f.required && <span className="text-red-600">*</span>}
              </label>
              <input
                className="input"
                value={info[f.key] || ''}
                placeholder={f.placeholder}
                onChange={(e) => setInfoField(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => setStep('apiKey')} className="btn-ghost"><ArrowLeft size={16} /> Inapoi</button>
        <button
          onClick={() => setStep('structure')}
          disabled={!ok}
          className="btn-primary"
        >
          Continua <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
