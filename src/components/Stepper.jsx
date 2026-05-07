import { Check } from 'lucide-react'

export function Stepper({ steps, current }) {
  const idx = steps.findIndex((s) => s.id === current)
  return (
    <div className="border-t border-ink-100 bg-white">
      <div className="max-w-5xl mx-auto px-6 py-3 overflow-x-auto">
        <ol className="flex items-center gap-2 text-xs">
          {steps.map((s, i) => {
            const done = i < idx
            const active = i === idx
            return (
              <li key={s.id} className="flex items-center gap-2 whitespace-nowrap">
                <span
                  className={
                    'inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-medium ' +
                    (done
                      ? 'bg-ink-900 text-white'
                      : active
                      ? 'bg-ink-900 text-white'
                      : 'bg-ink-200 text-ink-600')
                  }
                >
                  {done ? <Check size={12} /> : i + 1}
                </span>
                <span className={active ? 'text-ink-900 font-medium' : 'text-ink-500'}>{s.label}</span>
                {i < steps.length - 1 && <span className="text-ink-300">·</span>}
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
