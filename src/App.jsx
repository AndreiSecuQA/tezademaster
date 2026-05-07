import { useStore, STEPS } from './lib/store.js'
import { Stepper } from './components/Stepper.jsx'
import { Welcome } from './components/Welcome.jsx'
import { ApiKeySetup } from './components/ApiKeySetup.jsx'
import { BasicInfo } from './components/BasicInfo.jsx'
import { StructureSetup } from './components/StructureSetup.jsx'
import { DocumentUpload } from './components/DocumentUpload.jsx'
import { PlanReview } from './components/PlanReview.jsx'
import { Generation } from './components/Generation.jsx'
import { BibliographyReview } from './components/BibliographyReview.jsx'
import { Download } from './components/Download.jsx'
import { Logo } from './components/Logo.jsx'

const COMPONENTS = {
  welcome: Welcome,
  apiKey: ApiKeySetup,
  basicInfo: BasicInfo,
  structure: StructureSetup,
  documents: DocumentUpload,
  plan: PlanReview,
  generation: Generation,
  bibliography: BibliographyReview,
  download: Download,
}

export default function App() {
  const step = useStore((s) => s.step)
  const Component = COMPONENTS[step] || Welcome
  const isWelcome = step === 'welcome'

  return (
    <div className="min-h-full bg-app">
      <header className="sticky top-0 z-20 border-b border-ink-200/80 bg-white/85 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={() => useStore.getState().setStep('welcome')}
            className="flex items-center gap-2.5 group"
          >
            <Logo size={32} className="rounded-lg shadow-soft group-hover:shadow-pop transition-shadow" />
            <div className="text-left">
              <div className="font-semibold text-ink-900 leading-tight tracking-tight">TezaDeMaster</div>
              <div className="text-[11px] text-ink-500 leading-tight">Generator AI · Ghidul ASEM GD.0.ESTM</div>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <span className="chip-brand hidden sm:inline-flex">research preview</span>
            <a
              href="https://github.com/AndreiSecuQA/tezademaster"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-ink-500 hover:text-ink-900 px-2 py-1 rounded hover:bg-ink-100"
            >
              GitHub
            </a>
          </div>
        </div>
        {!isWelcome && <Stepper steps={STEPS} current={step} />}
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10 animate-fade-in" key={step}>
        <Component />
      </main>
      <footer className="max-w-5xl mx-auto px-6 py-10 text-xs text-ink-500 border-t border-ink-200/60 mt-8">
        <div className="flex flex-wrap gap-x-6 gap-y-2 items-center justify-between">
          <p>
            Cheile API se folosesc doar in browserul tau. Aplicatia nu are server propriu.
          </p>
          <p className="opacity-70">
            Open-source · MIT · <a className="underline hover:text-ink-900" href="https://github.com/AndreiSecuQA/tezademaster">github.com/AndreiSecuQA/tezademaster</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
