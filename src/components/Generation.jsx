import { useEffect, useState, useRef } from 'react'
import { useStore } from '../lib/store.js'
import { callAI } from '../lib/ai/index.js'
import { systemPrompt } from '../lib/prompts/system.js'
import { introUserPrompt, chapterUserPrompt, conclusionsUserPrompt, annotationUserPrompt } from '../lib/prompts/sections.js'
import { buildContext } from '../lib/parsers/index.js'
import { ArrowLeft, ArrowRight, Loader2, Check, AlertCircle, RefreshCw } from 'lucide-react'

function makeJobs(plan) {
  const jobs = [{ id: 'introduction', label: 'Introducere' }]
  plan.chapters.forEach((c, i) => {
    jobs.push({ id: `chapter-${i}`, label: `Capitolul ${['I','II','III','IV'][i]}: ${c.title}` })
  })
  jobs.push({ id: 'conclusions', label: 'Concluzii si recomandari' })
  jobs.push({ id: 'annotation-ro', label: 'Adnotare (RO)' })
  jobs.push({ id: 'annotation-en', label: 'Annotation (EN)' })
  return jobs
}

export function Generation() {
  const state = useStore()
  const { language, provider, model, apiKey, info, plan, documents, setIntroduction, setChapter, setConclusions, setAnnotation, setStep, sections } = state
  const jobs = plan ? makeJobs(plan) : []
  const [statuses, setStatuses] = useState({}) // jobId -> 'pending' | 'running' | 'done' | error string
  const [running, setRunning] = useState(false)
  const cancelRef = useRef(false)

  useEffect(() => {
    if (jobs.length && Object.keys(statuses).length === 0) {
      // initial state
      const init = {}
      jobs.forEach(j => init[j.id] = 'pending')
      setStatuses(init)
      runAll(init)
    }
    // eslint-disable-next-line
  }, [])

  async function runAll(initial = statuses) {
    setRunning(true)
    cancelRef.current = false
    const ctx = buildContext(documents, 18000)
    const ctxShort = buildContext(documents, 4000)
    let st = { ...initial }

    const setOne = (id, value) => {
      st = { ...st, [id]: value }
      setStatuses(st)
    }

    const caseStudyIdx = plan.chapters.length - 1 // last chapter = case study by default

    try {
      // Introduction
      if (st['introduction'] !== 'done') {
        setOne('introduction', 'running')
        const out = await callAI({
          provider, model, apiKey,
          system: systemPrompt(language),
          user: introUserPrompt({ lang: language, info, plan, contextSummary: ctxShort }),
          temperature: 0.5, maxTokens: 2400,
        })
        setIntroduction(out)
        setOne('introduction', 'done')
      }
      if (cancelRef.current) return

      // Chapters
      for (let i = 0; i < plan.chapters.length; i++) {
        const id = `chapter-${i}`
        if (st[id] === 'done') continue
        setOne(id, 'running')
        const out = await callAI({
          provider, model, apiKey,
          system: systemPrompt(language),
          user: chapterUserPrompt({
            lang: language, info, plan, chapter: plan.chapters[i],
            contextSummary: i === caseStudyIdx ? ctx : ctxShort,
            isCaseStudy: i === caseStudyIdx,
          }),
          temperature: 0.5, maxTokens: 4096,
        })
        setChapter(i, out)
        setOne(id, 'done')
        if (cancelRef.current) return
      }

      // Conclusions
      if (st['conclusions'] !== 'done') {
        setOne('conclusions', 'running')
        // Build short summaries of each chapter
        const summaries = (sections.chapters || plan.chapters.map(() => ''))
          .map((c, i) => (c || '').slice(0, 800))
        const out = await callAI({
          provider, model, apiKey,
          system: systemPrompt(language),
          user: conclusionsUserPrompt({ lang: language, info, plan, summaries }),
          temperature: 0.4, maxTokens: 2000,
        })
        setConclusions(out)
        setOne('conclusions', 'done')
      }
      if (cancelRef.current) return

      // Annotations
      const structureSummary = `${plan.chapters.length} capitole, ${plan.chapters.reduce((a,c) => a + c.subchapters.length, 0)} subcapitole, ~75 pagini text de baza`
      if (st['annotation-ro'] !== 'done') {
        setOne('annotation-ro', 'running')
        const out = await callAI({
          provider, model, apiKey,
          system: systemPrompt('ro'),
          user: annotationUserPrompt({ lang: 'ro', langOfThesis: language, info, plan, structureSummary }),
          temperature: 0.4, maxTokens: 1200,
        })
        setAnnotation('ro', out)
        setOne('annotation-ro', 'done')
      }
      if (cancelRef.current) return

      if (st['annotation-en'] !== 'done') {
        setOne('annotation-en', 'running')
        const out = await callAI({
          provider, model, apiKey,
          system: systemPrompt('en'),
          user: annotationUserPrompt({ lang: 'en', langOfThesis: language, info, plan, structureSummary }),
          temperature: 0.4, maxTokens: 1200,
        })
        setAnnotation('en', out)
        setOne('annotation-en', 'done')
      }
    } catch (e) {
      // mark current running job as failed
      const failedId = jobs.find(j => st[j.id] === 'running')?.id
      if (failedId) setOne(failedId, e.message || 'eroare')
    } finally {
      setRunning(false)
    }
  }

  function retryFrom(jobId) {
    // Reset everything from this job onward to 'pending', re-run.
    const idx = jobs.findIndex(j => j.id === jobId)
    const fresh = { ...statuses }
    for (let i = idx; i < jobs.length; i++) fresh[jobs[i].id] = 'pending'
    setStatuses(fresh)
    runAll(fresh)
  }

  const allDone = jobs.length > 0 && jobs.every(j => statuses[j.id] === 'done')

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold text-ink-900">Generare continut</h2>
        <p className="text-sm text-ink-600 mt-1">
          AI-ul scrie acum fiecare sectiune. Procesul poate dura cateva minute, in functie de provider.
        </p>

        <ul className="mt-5 divide-y divide-ink-100">
          {jobs.map((j) => {
            const status = statuses[j.id] || 'pending'
            return (
              <li key={j.id} className="py-3 flex items-center gap-3">
                <StatusIcon status={status} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink-900 truncate">{j.label}</div>
                  {typeof status === 'string' && status !== 'pending' && status !== 'running' && status !== 'done' && (
                    <div className="text-xs text-red-700 truncate">{status}</div>
                  )}
                </div>
                {typeof status === 'string' && status !== 'pending' && status !== 'running' && status !== 'done' && (
                  <button onClick={() => retryFrom(j.id)} className="btn-secondary text-xs"><RefreshCw size={12} /> Reincearca</button>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => setStep('plan')} className="btn-ghost" disabled={running}><ArrowLeft size={16} /> Inapoi la plan</button>
        <button onClick={() => setStep('bibliography')} disabled={!allDone} className="btn-primary">
          Continua la bibliografie <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

function StatusIcon({ status }) {
  if (status === 'done') return <Check size={16} className="text-emerald-700" />
  if (status === 'running') return <Loader2 size={16} className="animate-spin text-ink-700" />
  if (status === 'pending') return <span className="w-4 h-4 rounded-full bg-ink-200 inline-block" />
  return <AlertCircle size={16} className="text-red-700" />
}
