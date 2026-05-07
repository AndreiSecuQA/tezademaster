import { useState } from 'react'
import { useStore } from '../lib/store.js'
import { parseFile } from '../lib/parsers/index.js'
import { ArrowLeft, ArrowRight, Upload, X, FileText, Loader2, FileSpreadsheet, Image as ImageIcon, File } from 'lucide-react'

const ACCEPT = '.pdf,.docx,.xlsx,.xls,.csv,.txt,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/plain,image/*'

function iconFor(kind) {
  if (kind === 'pdf') return <FileText size={16} />
  if (kind === 'docx') return <FileText size={16} />
  if (kind === 'xlsx') return <FileSpreadsheet size={16} />
  if (kind === 'image') return <ImageIcon size={16} />
  return <File size={16} />
}

export function DocumentUpload() {
  const documents = useStore((s) => s.documents)
  const addDocuments = useStore((s) => s.addDocuments)
  const removeDocument = useStore((s) => s.removeDocument)
  const setStep = useStore((s) => s.setStep)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function onFiles(files) {
    setBusy(true); setError('')
    try {
      const arr = Array.from(files)
      const parsed = []
      for (const f of arr) {
        const doc = await parseFile(f)
        parsed.push(doc)
      }
      addDocuments(parsed)
    } catch (e) {
      setError(e.message || 'Eroare la incarcare.')
    } finally {
      setBusy(false)
    }
  }

  const totalChars = documents.reduce((acc, d) => acc + (d.text?.length || 0), 0)

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold text-ink-900">Materialele pentru studiul de caz</h2>
        <p className="text-sm text-ink-600 mt-1">
          Incarca documente relevante (rapoarte, note, dari de seama, articole, foi de calcul). AI-ul le va folosi ca surse pentru capitolul aplicativ si pentru studiul de caz. Pentru imagini, doar denumirea este folosita ca referinta — fara OCR.
        </p>

        <label
          className="mt-4 block border-2 border-dashed border-ink-300 rounded-xl py-10 text-center cursor-pointer hover:border-ink-500 transition"
        >
          <input
            type="file"
            multiple
            accept={ACCEPT}
            onChange={(e) => onFiles(e.target.files)}
            className="hidden"
          />
          <div className="inline-flex items-center gap-2 text-ink-700">
            {busy ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            <span className="text-sm font-medium">
              {busy ? 'Se proceseaza...' : 'Apasa sau trage fisierele aici'}
            </span>
          </div>
          <p className="text-xs text-ink-500 mt-1.5">
            PDF · DOCX · XLSX/CSV · TXT · PNG/JPG
          </p>
        </label>

        {error && <p className="text-sm text-red-700 mt-3">{error}</p>}

        {documents.length > 0 && (
          <div className="mt-5 border-t border-ink-200 pt-4">
            <div className="text-sm font-medium text-ink-800 mb-2">
              Documente incarcate ({documents.length}) — text extras: {Math.round(totalChars / 1000)}K caractere
            </div>
            <ul className="divide-y divide-ink-100">
              {documents.map((d, i) => (
                <li key={i} className="py-2 flex items-center gap-3">
                  <span className="text-ink-500">{iconFor(d.kind)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-ink-900 truncate">{d.name}</div>
                    <div className="text-xs text-ink-500 truncate">{d.kind} · {d.text?.length || 0} caractere extrase</div>
                  </div>
                  <button onClick={() => removeDocument(i)} className="text-ink-400 hover:text-red-700 p-1">
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="text-xs text-ink-500">
        Poti continua si fara documente — atunci capitolul aplicativ va fi mai general. Ghidul ASEM cere insa explicit un studiu de caz aprofundat.
      </p>

      <div className="flex items-center justify-between">
        <button onClick={() => setStep('structure')} className="btn-ghost"><ArrowLeft size={16} /> Inapoi</button>
        <button onClick={() => setStep('plan')} className="btn-primary">
          Genereaza planul <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
