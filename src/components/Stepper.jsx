import { Check } from 'lucide-react'

export function Stepper({ steps, current }) {
  const idx = Math.max(0, steps.findIndex((s) => s.id === current))
  const progress = ((idx) / (steps.length - 1)) * 100

  return (
    <div className="border-t border-ink-100 bg-white/70 backdrop-blur">
      <div className="max-w-5xl mx-auto px-6 pt-3 pb-3.5">
        {/* Progress bar */}
        <div className="relative h-[3px] bg-ink-100 rounded-full mb-3 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-500 to-brand-700 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <ol className="flex items-center gap-1 text-xs overflow-x-auto -mx-1 px-1 pb-1">
          {steps.map((s, i) => {
            const done = i < idx
            const active = i === idx
            return (
              <li key={s.id} className="flex items-center gap-1.5 whitespace-nowrap">
                <span
                  className={
                    'inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold transition ' +
                    (done
                      ? 'bg-brand-600 text-white'
                      : active
                      ? 'bg-ink-900 text-white ring-4 ring-ink-900/10'
                      : 'bg-ink-100 text-ink-500')
                  }
                >
                  {done ? <Check size={11} strokeWidth={3} /> : i + 1}
                </span>
                <span className={
                  (active ? 'text-ink-900 font-semibold' : done ? 'text-ink-700' : 'text-ink-400') +
                  ' tracking-tight'
                }>{s.label}</span>
                {i < steps.length - 1 && <span className="text-ink-300 mx-0.5">·</span>}
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
