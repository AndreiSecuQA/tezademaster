import { useStore } from '../lib/store.js'
import { ArrowRight, ShieldCheck, Cpu, FileText, Lock, Sparkles, BookOpen, FileCheck2 } from 'lucide-react'

export function Welcome() {
  const setStep = useStore((s) => s.setStep)
  const setLanguage = useStore((s) => s.setLanguage)
  const language = useStore((s) => s.language)

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-ink-200/70 bg-gradient-hero p-8 sm:p-12 shadow-card">
        <div className="absolute inset-0 pointer-events-none opacity-50"
             style={{ backgroundImage: 'radial-gradient(circle at 20% 0%, rgb(99 102 241 / 0.18) 0, transparent 40%), radial-gradient(circle at 100% 100%, rgb(168 85 247 / 0.12) 0, transparent 40%)' }}/>
        <div className="relative">
          <span className="chip-brand">
            <Sparkles size={11} /> ASEM GD.0.ESTM · 2026
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-semibold tracking-tight text-ink-900 max-w-3xl leading-[1.05]">
            Teza ta de master,
            <span className="block bg-gradient-to-r from-brand-600 to-brand-900 bg-clip-text text-transparent">
              elaborata cu AI in cativa pasi.
            </span>
          </h1>
          <p className="mt-5 text-ink-700 max-w-2xl text-base sm:text-lg leading-relaxed">
            Iti incarci materialele studiului de caz, ne dai cheia ta API si platforma genereaza un document Word complet — cu introducere, capitole, concluzii, adnotare RO + EN si bibliografie — strict conform ghidului ASEM.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
            <button onClick={() => setStep('apiKey')} className="btn-primary text-base px-5 py-3">
              Incepe acum <ArrowRight size={18} />
            </button>
            <div className="flex items-center gap-3 text-xs text-ink-600 px-1">
              <div className="flex -space-x-1.5">
                <ProviderDot label="GPT" />
                <ProviderDot label="Claude" />
                <ProviderDot label="Gemini" />
              </div>
              <span>Suporta OpenAI · Anthropic · Google</span>
            </div>
          </div>

          <div className="mt-8">
            <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-2">Limba tezei</div>
            <div className="inline-flex p-1 bg-white border border-ink-200 rounded-xl shadow-soft">
              <button
                onClick={() => setLanguage('ro')}
                className={
                  'px-4 py-1.5 rounded-lg text-sm font-medium transition ' +
                  (language === 'ro' ? 'bg-ink-900 text-white shadow-pop' : 'text-ink-600 hover:text-ink-900')
                }
              >Romana</button>
              <button
                onClick={() => setLanguage('en')}
                className={
                  'px-4 py-1.5 rounded-lg text-sm font-medium transition ' +
                  (language === 'en' ? 'bg-ink-900 text-white shadow-pop' : 'text-ink-600 hover:text-ink-900')
                }
              >English</button>
            </div>
            <p className="hint">Adnotarea va fi generata oricum in ambele limbi, conform ghidului.</p>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Feature icon={<Lock size={18} />} title="Privat" tone="ink">
          Cheia API si documentele raman in browser. Niciun server intermediar.
        </Feature>
        <Feature icon={<Cpu size={18} />} title="Tu alegi AI-ul" tone="brand">
          OpenAI, Anthropic sau Google. Folosesti propria cheie.
        </Feature>
        <Feature icon={<ShieldCheck size={18} />} title="Conform ghidului" tone="ink">
          Structura, font, margini, paginatie, adnotare RO + EN — totul ASEM.
        </Feature>
        <Feature icon={<FileCheck2 size={18} />} title="Word editabil" tone="brand">
          Iesirea este `.docx`, gata de revizuit, copertat si depus la catedra.
        </Feature>
      </section>

      {/* Steps preview */}
      <section className="rounded-2xl border border-ink-200/70 bg-white p-6 sm:p-8 shadow-card">
        <h2 className="font-semibold text-ink-900 text-lg flex items-center gap-2">
          <BookOpen size={18} /> Cum decurge procesul
        </h2>
        <ol className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Step n={1} title="Cheia API">Alegi providerul si introduci cheia ta.</Step>
          <Step n={2} title="Datele tezei">Tema, autor, conducator, catedra, programul.</Step>
          <Step n={3} title="Studiu de caz">Incarci PDF/DOCX/XLSX cu materialele tale.</Step>
          <Step n={4} title="Plan AI">AI-ul propune obiective si capitole, le ajustezi.</Step>
          <Step n={5} title="Generare">Aplicatia scrie automat fiecare sectiune.</Step>
          <Step n={6} title="Descarcare">Primesti `.docx` formatat conform ghidului.</Step>
        </ol>
        <div className="mt-6 flex items-center justify-end">
          <button onClick={() => setStep('apiKey')} className="btn-brand">
            Incepe <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <p className="text-xs text-ink-500 text-center">
        Inainte sa incepi, asigura-te ca ai pregatit: o cheie API valida, materialele studiului de caz si datele pentru pagina de titlu (tema, conducator, catedra, programul, anul).
      </p>
    </div>
  )
}

function Feature({ icon, title, tone, children }) {
  const isLight = tone === 'brand'
  return (
    <div className={
      (isLight
        ? 'bg-gradient-to-br from-brand-50 to-white border-brand-200/70'
        : 'bg-white border-ink-200/70') +
      ' rounded-xl border p-4 shadow-soft hover:shadow-card transition-shadow'
    }>
      <div className={
        (isLight ? 'bg-brand-600 text-white' : 'bg-ink-900 text-white') +
        ' inline-flex items-center justify-center w-9 h-9 rounded-lg shadow-pop'
      }>
        {icon}
      </div>
      <div className="mt-3 font-semibold text-ink-900 text-sm">{title}</div>
      <p className="text-xs text-ink-600 mt-1 leading-relaxed">{children}</p>
    </div>
  )
}

function Step({ n, title, children }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-ink-900 text-white text-xs font-semibold flex items-center justify-center">{n}</div>
      <div>
        <div className="text-sm font-semibold text-ink-900">{title}</div>
        <p className="text-xs text-ink-600 mt-0.5">{children}</p>
      </div>
    </div>
  )
}

function ProviderDot({ label }) {
  return (
    <div className="w-6 h-6 rounded-full bg-white border border-ink-200 shadow-soft flex items-center justify-center text-[8px] font-bold text-ink-700" title={label}>
      {label[0]}
    </div>
  )
}
