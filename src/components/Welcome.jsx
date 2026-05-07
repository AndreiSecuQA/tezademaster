import { useStore } from '../lib/store.js'
import { ArrowRight, ShieldCheck, Cpu, FileText, Lock } from 'lucide-react'

export function Welcome() {
  const setStep = useStore((s) => s.setStep)
  const setLanguage = useStore((s) => s.setLanguage)
  const language = useStore((s) => s.language)

  return (
    <div className="space-y-8">
      <section className="card">
        <h1 className="text-2xl font-semibold text-ink-900 mb-2">Genereaza-ti teza de master in cativa pasi</h1>
        <p className="text-ink-700 max-w-2xl">
          Aplicatia te ghideaza prin completarea datelor, incarcarea materialelor pentru studiul de caz, validarea unui plan generat de AI, generarea automata a continutului si descarcarea unui document Word formatat conform ghidului ASEM (GD.0.ESTM).
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mt-6">
          <Feature icon={<Lock size={16} />} title="Privat">
            Cheia ta API si documentele raman in browser. Nu trec prin niciun server intermediar.
          </Feature>
          <Feature icon={<Cpu size={16} />} title="3 provideri AI">
            Suporta OpenAI (ChatGPT), Anthropic (Claude) si Google (Gemini). Tu alegi cheia.
          </Feature>
          <Feature icon={<ShieldCheck size={16} />} title="Conform ghidului">
            Aplicam strict cerintele ASEM: structura, font, margini, paginatie, adnotare RO + EN.
          </Feature>
          <Feature icon={<FileText size={16} />} title="Output .docx editabil">
            Primesti un Word complet formatat, gata de revizuit, copertat si depus.
          </Feature>
        </div>

        <div className="mt-8">
          <label className="label">Limba tezei</label>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('ro')}
              className={language === 'ro' ? 'btn-primary' : 'btn-secondary'}
            >Romana</button>
            <button
              onClick={() => setLanguage('en')}
              className={language === 'en' ? 'btn-primary' : 'btn-secondary'}
            >English</button>
          </div>
          <p className="hint">Adnotarea va fi generata oricum si in romana, si in engleza, conform ghidului.</p>
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={() => setStep('apiKey')} className="btn-primary">
            Incepe <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <section className="text-xs text-ink-500 px-1">
        <p>Inainte sa incepi, asigura-te ca ai pregatit:</p>
        <ul className="list-disc pl-5 mt-1.5 space-y-0.5">
          <li>O cheie API valida (OpenAI / Anthropic / Google).</li>
          <li>Documentele care servesc ca baza pentru studiul de caz (rapoarte, dari de seama, statistici, etc.).</li>
          <li>Datele pentru pagina de titlu (tema, conducator stiintific, catedra, programul de master, anul).</li>
        </ul>
      </section>
    </div>
  )
}

function Feature({ icon, title, children }) {
  return (
    <div className="rounded-lg border border-ink-200 p-3">
      <div className="flex items-center gap-2 text-ink-900 font-medium text-sm">{icon} {title}</div>
      <p className="text-xs text-ink-600 mt-1">{children}</p>
    </div>
  )
}
