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
import { FileText } from 'lucide-react'

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
  const showStepper = step !== 'welcome'

  return (
    <div className="min-h-full">
      <header className="border-b border-ink-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ink-900 text-white flex items-center justify-center">
              <FileText size={16} />
            </div>
            <div>
              <div className="font-semibold text-ink-900 leading-tight">Generator Teza de Master</div>
              <div className="text-xs text-ink-500 leading-tight">Conform ghidului ASEM GD.0.ESTM</div>
            </div>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-ink-500 hover:text-ink-900"
          >
            v0.1
          </a>
        </div>
        {showStepper && <Stepper steps={STEPS} current={step} />}
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Component />
      </main>
      <footer className="max-w-5xl mx-auto px-6 py-8 text-xs text-ink-500">
        <p>
          Cheile API sunt folosite doar in browserul tau si nu sunt trimise nicaieri in afara providerului ales (OpenAI / Anthropic / Google).
          Nu salvam datele tale; daca reincarci pagina, vei reincepe procesul.
        </p>
      </footer>
    </div>
  )
}
