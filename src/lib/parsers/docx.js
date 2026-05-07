// DOCX text extractor using mammoth.js
import mammoth from 'mammoth/mammoth.browser.js'

export async function parseDocx(file) {
  const buf = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buf })
  return (result.value || '').trim()
}
