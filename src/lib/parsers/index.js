import { parsePdf } from './pdf.js'
import { parseDocx } from './docx.js'
import { parseXlsx } from './xlsx.js'

export async function parseFile(file) {
  const name = (file.name || '').toLowerCase()
  const type = file.type || ''

  try {
    if (name.endsWith('.pdf') || type === 'application/pdf') {
      const text = await parsePdf(file)
      return { kind: 'pdf', name: file.name, text, summary: text.slice(0, 240) }
    }
    if (name.endsWith('.docx') || type.includes('officedocument.wordprocessingml')) {
      const text = await parseDocx(file)
      return { kind: 'docx', name: file.name, text, summary: text.slice(0, 240) }
    }
    if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv') || type.includes('spreadsheet') || type === 'text/csv') {
      const text = await parseXlsx(file)
      return { kind: 'xlsx', name: file.name, text, summary: text.slice(0, 240) }
    }
    if (name.endsWith('.txt') || type.startsWith('text/')) {
      const text = await file.text()
      return { kind: 'text', name: file.name, text: text.trim(), summary: text.slice(0, 240) }
    }
    if (type.startsWith('image/')) {
      // For now, we don't OCR. We just record the image so the user/AI knows it exists.
      return {
        kind: 'image',
        name: file.name,
        text: `[Imagine atasata: ${file.name}, ${Math.round(file.size / 1024)} KB. Continutul nu a fost extras automat.]`,
        summary: `Imagine ${file.name}`,
      }
    }
    return {
      kind: 'unknown',
      name: file.name,
      text: `[Fisier ${file.name} nerecunoscut, ignorat la extragerea de text.]`,
      summary: 'tip necunoscut',
    }
  } catch (err) {
    return {
      kind: 'error',
      name: file.name,
      text: `[Eroare la procesarea ${file.name}: ${err.message}]`,
      summary: 'eroare',
    }
  }
}

// Build a single context block from all docs, truncated to a budget.
export function buildContext(docs, charBudget = 30000) {
  const blocks = []
  let used = 0
  for (const d of docs) {
    if (!d.text) continue
    const header = `\n--- DOCUMENT: ${d.name} (${d.kind}) ---\n`
    const remaining = charBudget - used - header.length
    if (remaining <= 200) break
    const chunk = d.text.length > remaining ? d.text.slice(0, remaining) + '\n[...trunchiat]' : d.text
    blocks.push(header + chunk)
    used += header.length + chunk.length
  }
  return blocks.join('\n')
}
