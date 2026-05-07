import { useEffect, useState } from 'react'
import { useStore } from '../lib/store.js'
import { callAI } from '../lib/ai/index.js'
import { systemPrompt } from '../lib/prompts/system.js'
import { planUserPrompt } from '../lib/prompts/plan.js'
import { buildContext } from '../lib/parsers/index.js'
import { ArrowLeft, ArrowRight, Loader2, RefreshCw, Plus, Minus } from 'lucide-react'

function tryParseJson(text) {
  if (!text) return null
  // Strip code fences if present
  const cleaned = text.replace(/```json\s*([\s\S]*?)```/g, '$1').replace(/```\s*([\s\S]*?)```/g, '$1').trim()
  try { return JSON.parse(cleaned) } catch {}
  // Try to grab the largest {...} block
  const m = cleaned.match(/\{[\s\S]*\}/)
  if (m) {
    try { return JSON.parse(m[0]) } catch {}
  }
  return null
}

export function PlanReview() {
  const { language, provider, model, apiKey, info, structureHint, documents, plan, setPlan, setStep } = useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    setLoading(true); setError('')
    try {
      const contextSummary = buildContext(documents, 6000)
      const out = await callAI({
        provider, model, apiKey,
        system: systemPrompt(language),
        user: planUserPrompt({ lang: language, info, structureHint, contextSummary }),
        temperature: 0.3,
        maxTokens: 2000,
      })
      const parsed = tryParseJson(out)
      if (!parsed || !Array.isArray(parsed.chapters)) {
        throw new Error('Raspunsul AI nu a putut fi parsat ca JSON. Reincearca.')
      }
      setPlan(parsed)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!plan) generate()
    // eslint-disable-next-line
  }, [])

  if (loading || !plan) {
    return (
      <div className="card flex items-center gap-3">
        <Loader2 size={18} className="animate-spin" />
        <div>
          <div className="text-ink-900 font-medium text-sm">Se genereaza planul tezei...</div>
          <div className="text-ink-500 text-xs">{error || 'Acest pas dureaza ~10-30 secunde.'}</div>
        </div>
        {error && <button onClick={generate} className="ml-auto btn-secondary"><RefreshCw size={14} /> Reincearca</button>}
      </div>
    )
  }

  const updatePlan = (patch) => setPlan({ ...plan, ...patch })
  const updateChapter = (i, patch) => {
    const chapters = [...plan.chapters]
    chapters[i] = { ...chapters[i], ...patch }
    setPlan({ ...plan, chapters })
  }
  const updateSub = (ci, si, patch) => {
    const chapters = [...plan.chapters]
    const subs = [...chapters[ci].subchapters]
    subs[si] = { ...subs[si], ...patch }
    chapters[ci] = { ...chapters[ci], subchapters: subs }
    setPlan({ ...plan, chapters })
  }
  const addSub = (ci) => {
    const chapters = [...plan.chapters]
    const subs = [...chapters[ci].subchapters]
    subs.push({ number: `${ci + 1}.${subs.length + 1}`, title: 'Subcapitol nou', summary: '' })
    chapters[ci] = { ...chapters[ci], subchapters: subs }
    setPlan({ ...plan, chapters })
  }
  const removeSub = (ci, si) => {
    const chapters = [...plan.chapters]
    chapters[ci] = { ...chapters[ci], subchapters: chapters[ci].subchapters.filter((_, i) => i !== si) }
    setPlan({ ...plan, chapters })
  }
  const addChapter = () => {
    if (plan.chapters.length >= 4) return
    const idx = plan.chapters.length
    setPlan({
      ...plan,
      chapters: [...plan.chapters, {
        title: 'Capitol nou',
        summary: '',
        subchapters: [
          { number: `${idx + 1}.1`, title: 'Subcapitol 1', summary: '' },
          { number: `${idx + 1}.2`, title: 'Subcapitol 2', summary: '' },
        ],
      }],
    })
  }
  const removeChapter = (i) => {
    if (plan.chapters.length <= 2) return
    setPlan({ ...plan, chapters: plan.chapters.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">Planul propus</h2>
            <p className="text-sm text-ink-600 mt-1">Revizuieste si ajusteaza obiectivele si capitolele. Daca vrei alt unghi, regenereaza.</p>
          </div>
          <button onClick={generate} className="btn-secondary"><RefreshCw size={14} /> Regenereaza</button>
        </div>

        <div className="mt-5 space-y-5">
          <Field label="Obiective ale cercetarii">
            <Textarea
              value={(plan.objectives || []).join('\n')}
              onChange={(v) => updatePlan({ objectives: v.split('\n').filter(Boolean) })}
              hint="Cate unul pe rand."
            />
          </Field>

          <Field label="Intrebari de cercetare">
            <Textarea
              value={(plan.researchQuestions || []).join('\n')}
              onChange={(v) => updatePlan({ researchQuestions: v.split('\n').filter(Boolean) })}
              hint="Cate una pe rand."
            />
          </Field>

          <Field label="Metodologia">
            <textarea className="input min-h-[80px]" value={plan.methodology || ''} onChange={(e) => updatePlan({ methodology: e.target.value })} />
          </Field>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-ink-900 text-sm">Capitole</div>
              <button onClick={addChapter} disabled={plan.chapters.length >= 4} className="btn-ghost text-xs"><Plus size={14} /> Adauga capitol</button>
            </div>
            <div className="space-y-3">
              {plan.chapters.map((c, ci) => (
                <div key={ci} className="border border-ink-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-ink-500 mt-2">{['I','II','III','IV'][ci]}</span>
                    <input className="input font-medium" value={c.title} onChange={(e) => updateChapter(ci, { title: e.target.value })} />
                    <button onClick={() => removeChapter(ci)} disabled={plan.chapters.length <= 2} className="btn-ghost text-xs"><Minus size={14} /></button>
                  </div>
                  <input className="input mt-2 text-xs" placeholder="Rezumat capitol" value={c.summary || ''} onChange={(e) => updateChapter(ci, { summary: e.target.value })} />
                  <div className="mt-3 space-y-2 pl-4 border-l-2 border-ink-100">
                    {c.subchapters.map((s, si) => (
                      <div key={si} className="flex items-center gap-2">
                        <input className="input w-16 text-xs font-mono" value={s.number} onChange={(e) => updateSub(ci, si, { number: e.target.value })} />
                        <input className="input flex-1 text-sm" value={s.title} onChange={(e) => updateSub(ci, si, { title: e.target.value })} />
                        <button onClick={() => removeSub(ci, si)} disabled={c.subchapters.length <= 2} className="btn-ghost text-xs"><Minus size={14} /></button>
                      </div>
                    ))}
                    <button onClick={() => addSub(ci)} disabled={c.subchapters.length >= 4} className="btn-ghost text-xs"><Plus size={14} /> Subcapitol</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Field label="Elemente de inovatie stiintifica">
            <textarea className="input min-h-[60px]" value={plan.innovation || ''} onChange={(e) => updatePlan({ innovation: e.target.value })} />
          </Field>
          <Field label="Contributia personala asteptata">
            <textarea className="input min-h-[60px]" value={plan.expectedContribution || ''} onChange={(e) => updatePlan({ expectedContribution: e.target.value })} />
          </Field>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => setStep('documents')} className="btn-ghost"><ArrowLeft size={16} /> Inapoi</button>
        <button onClick={() => setStep('generation')} className="btn-primary">
          Aproba si genereaza continutul <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function Textarea({ value, onChange, hint }) {
  return (
    <>
      <textarea className="input min-h-[80px]" value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="hint">{hint}</p>}
    </>
  )
}
