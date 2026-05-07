// Excel/CSV extractor using SheetJS
import * as XLSX from 'xlsx'

export async function parseXlsx(file) {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const out = []
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName]
    const csv = XLSX.utils.sheet_to_csv(ws)
    out.push(`=== ${sheetName} ===\n${csv}`)
  }
  return out.join('\n\n').trim()
}
