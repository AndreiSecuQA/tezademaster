// DOCX generator implementing ASEM GD.0.ESTM formatting requirements.
//
// Spec recap (from the guide):
// - A4 paper, single side
// - Times New Roman 12pt, 1.5 line spacing, justified
// - Margins: left 30mm, top 25mm, right 15mm, bottom 25mm
// - Page numbers in bottom-right; title page has no visible number
// - Chapter titles: UPPERCASE, 14-16pt, bold, centered. Roman numerals.
// - Subchapter titles: 14pt, bold, centered, sentence case (first letter capital)
// - No period after chapter/subchapter titles
// - Each chapter starts on a new page
// - Tables: caption above; figures: caption below
//
// We use the `docx` npm package.

import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  PageBreak, PageNumber, Footer, Header, NumberFormat, LevelFormat,
  TableOfContents, StyleLevel, convertMillimetersToTwip,
  BorderStyle, Table, TableCell, TableRow, WidthType, VerticalAlign,
  ImageRun,
} from 'docx'
import { saveAs } from 'file-saver'

// ===== Style constants =====
const FONT = 'Times New Roman'
const SIZE_BODY = 24       // 12pt (docx uses half-points)
const SIZE_SMALL = 20      // 10pt
const SIZE_TITLE_PAGE_HUGE = 40 // 20pt for thesis title on title page
const SIZE_TITLE_PAGE_BIG = 36  // 18pt institution
const SIZE_TITLE_PAGE_MID = 32  // 16pt
const SIZE_CHAPTER = 32    // 16pt
const SIZE_SUBCHAPTER = 28 // 14pt
const LINE_15 = 360        // 1.5 spacing in 240ths -> docx uses 240=single, 360=1.5

// ===== Helpers =====

function p(text, opts = {}) {
  const {
    bold = false,
    italic = false,
    align = AlignmentType.JUSTIFIED,
    size = SIZE_BODY,
    spacing = LINE_15,
    spaceBefore = 0,
    spaceAfter = 120,
    indent,
    pageBreakBefore = false,
    underline = false,
  } = opts
  const runOpts = { text: text || '', font: FONT, size, bold, italic }
  if (underline) runOpts.underline = {}
  return new Paragraph({
    alignment: align,
    spacing: { line: spacing, before: spaceBefore, after: spaceAfter },
    indent,
    pageBreakBefore,
    children: [new TextRun(runOpts)],
  })
}

function emptyP(spaceAfter = 0) {
  return new Paragraph({
    children: [new TextRun({ text: '', font: FONT, size: SIZE_BODY })],
    spacing: { after: spaceAfter, line: LINE_15 },
  })
}

function chapterTitleParagraph(romanNumber, title) {
  // E.g. "I. ANALIZA TEORETICA A ..."
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    pageBreakBefore: true,
    spacing: { line: LINE_15, before: 240, after: 360 },
    heading: HeadingLevel.HEADING_1,
    children: [
      new TextRun({
        text: `${romanNumber}. ${title.toUpperCase()}`,
        font: FONT, size: SIZE_CHAPTER, bold: true,
      }),
    ],
  })
}

function subchapterTitleParagraph(numbering, title) {
  // E.g. "1.1. Notiunea de ..."
  const t = title.charAt(0).toUpperCase() + title.slice(1)
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { line: LINE_15, before: 240, after: 200 },
    heading: HeadingLevel.HEADING_2,
    children: [
      new TextRun({
        text: `${numbering}. ${t}`,
        font: FONT, size: SIZE_SUBCHAPTER, bold: true,
      }),
    ],
  })
}

function sectionTitleParagraph(text, { pageBreak = true } = {}) {
  // For non-numbered sections: Introducere, Concluzii, Bibliografie, Adnotare, Anexe
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    pageBreakBefore: pageBreak,
    spacing: { line: LINE_15, before: 240, after: 360 },
    heading: HeadingLevel.HEADING_1,
    children: [
      new TextRun({
        text: text.toUpperCase(),
        font: FONT, size: SIZE_CHAPTER, bold: true,
      }),
    ],
  })
}

// Convert markdown-ish text into Paragraphs:
// - lines starting with "## " => subchapter heading (NOT used here; we add subchapter headings ourselves)
// - **bold** => bold runs
// - blank line => paragraph break
// - lines starting with "- " or "* " => bullet
// - lines starting with a numeric "1. " => numbered (kept as paragraph with run)
function markdownToParagraphs(md, { firstLineIndent = true } = {}) {
  const out = []
  if (!md) return out
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  let buffer = []

  const flushBuffer = () => {
    if (buffer.length === 0) return
    const text = buffer.join(' ').trim()
    if (text) out.push(paragraphFromInline(text, { indent: firstLineIndent ? { firstLine: 720 } : undefined }))
    buffer = []
  }

  for (let raw of lines) {
    const line = raw.trim()
    if (line === '') { flushBuffer(); continue }
    // skip standalone heading markers from AI (we render headings ourselves)
    if (/^#{1,6}\s+/.test(line)) {
      flushBuffer()
      // Render small heading as bold, centered? Better: ignore subchapter/chapter markers
      // since we placed them ourselves. But render h3+ as bold inline title.
      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
      const level = headingMatch[1].length
      const text = headingMatch[2].replace(/^[\d.]+\s*/, '') // strip leading "1.1"
      if (level >= 3) {
        out.push(new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { line: LINE_15, before: 200, after: 100 },
          children: [new TextRun({ text, font: FONT, size: SIZE_BODY, bold: true })],
        }))
      }
      continue
    }
    // bullet
    if (/^[-*•]\s+/.test(line)) {
      flushBuffer()
      out.push(paragraphFromInline(line.replace(/^[-*•]\s+/, ''), {
        bullet: { level: 0 },
      }))
      continue
    }
    // numbered list "1. " etc. — render as paragraph (no native numbering hassle)
    if (/^\d+[.)]\s+/.test(line)) {
      flushBuffer()
      out.push(paragraphFromInline(line, { indent: { left: 360 } }))
      continue
    }
    buffer.push(line)
  }
  flushBuffer()
  return out
}

function paragraphFromInline(text, paraOpts = {}) {
  // Parse **bold** and *italic*
  const runs = []
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
  let last = 0
  let m
  while ((m = re.exec(text))) {
    if (m.index > last) {
      runs.push(new TextRun({ text: text.slice(last, m.index), font: FONT, size: SIZE_BODY }))
    }
    const tok = m[0]
    if (tok.startsWith('**')) {
      runs.push(new TextRun({ text: tok.slice(2, -2), font: FONT, size: SIZE_BODY, bold: true }))
    } else {
      runs.push(new TextRun({ text: tok.slice(1, -1), font: FONT, size: SIZE_BODY, italics: true }))
    }
    last = m.index + tok.length
  }
  if (last < text.length) {
    runs.push(new TextRun({ text: text.slice(last), font: FONT, size: SIZE_BODY }))
  }
  if (runs.length === 0) {
    runs.push(new TextRun({ text, font: FONT, size: SIZE_BODY }))
  }
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: LINE_15, after: 120 },
    indent: paraOpts.indent,
    bullet: paraOpts.bullet,
    children: runs,
  })
}

// ===== Page sections =====

function buildTitlePage(info, lang) {
  const isEn = lang === 'en'
  const ASEM = 'ACADEMIA DE STUDII ECONOMICE DIN MOLDOVA'
  const SCHOOL = 'SCOALA MASTERALA DE EXCELENTA IN ECONOMIE SI BUSINESS'
  const department = (info.department || '').toUpperCase()

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240, line: LINE_15 },
      children: [new TextRun({ text: ASEM, font: FONT, size: SIZE_TITLE_PAGE_BIG, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240, line: LINE_15 },
      children: [new TextRun({ text: SCHOOL, font: FONT, size: SIZE_TITLE_PAGE_MID, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360, line: LINE_15 },
      children: [new TextRun({ text: `CATEDRA ${department || '............................'}`, font: FONT, size: SIZE_TITLE_PAGE_MID, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 600, line: LINE_15 },
      children: [new TextRun({ text: 'C.Z.U.: ............................', font: FONT, size: SIZE_BODY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360, line: LINE_15 },
      children: [new TextRun({ text: (info.authorName || 'NUMELE, PRENUMELE AUTORULUI').toUpperCase(), font: FONT, size: SIZE_TITLE_PAGE_MID, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 480, line: LINE_15 },
      children: [new TextRun({ text: info.thesisTitle || '', font: FONT, size: SIZE_TITLE_PAGE_HUGE, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360, line: LINE_15 },
      children: [new TextRun({ text: isEn ? 'MASTER\'S THESIS' : 'TEZA DE MASTER', font: FONT, size: SIZE_TITLE_PAGE_MID, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120, line: LINE_15 },
      children: [new TextRun({ text: `${isEn ? 'General study area' : 'Domeniul general de studii'}: ............`, font: FONT, size: 28, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120, line: LINE_15 },
      children: [new TextRun({ text: `${isEn ? 'Field of professional training' : 'Domeniul de formare profesionala'}: ............`, font: FONT, size: 28, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 720, line: LINE_15 },
      children: [new TextRun({ text: `${isEn ? 'Master programme' : 'Programul de masterat'}: ${info.program || '............'}`, font: FONT, size: 28, bold: true })],
    }),
    // Two-column-ish footer using a 1-row table
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorders(),
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: noBorders(),
              children: [
                p(isEn ? 'Admitted for defence' : 'Admis la sustinere', { bold: true, align: AlignmentType.LEFT, spaceAfter: 60 }),
                p(`${isEn ? 'Head of department' : 'Sef catedra'}:`, { align: AlignmentType.LEFT, spaceAfter: 60 }),
                p('________________________', { align: AlignmentType.LEFT, spaceAfter: 60 }),
                p('"___" ______________ 20___', { align: AlignmentType.LEFT, spaceAfter: 60 }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: noBorders(),
              children: [
                p(isEn ? 'Scientific advisor:' : 'Conducator stiintific:', { bold: true, align: AlignmentType.LEFT, spaceAfter: 60 }),
                p(info.advisorName || '_______________________', { bold: true, align: AlignmentType.LEFT, spaceAfter: 60 }),
                p('________________________', { align: AlignmentType.LEFT, spaceAfter: 360 }),
                p(isEn ? 'Author:' : 'Autor:', { bold: true, align: AlignmentType.LEFT, spaceAfter: 60 }),
                p(info.authorName || '_______________________', { bold: true, align: AlignmentType.LEFT, spaceAfter: 60 }),
                p('________________________', { align: AlignmentType.LEFT, spaceAfter: 60 }),
              ],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 720, line: LINE_15 },
      children: [new TextRun({ text: `Chisinau - ${info.year || new Date().getFullYear()}`, font: FONT, size: 28, bold: true })],
    }),
  ]
}

function noBorders() {
  const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
  return { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none }
}

function buildDeclaration(info, lang) {
  const isEn = lang === 'en'
  const author = info.authorName || '__________________________'
  const program = info.program || '__________________________'
  const title = info.thesisTitle || '__________________________'
  const out = []
  out.push(sectionTitleParagraph(isEn ? 'STATEMENT ON PERSONAL RESPONSIBILITY' : 'DECLARATIA PRIVIND PROPRIA RASPUNDERE'))
  if (isEn) {
    out.push(p(`I, the undersigned, ${author}, graduate of the Academy of Economic Studies of Moldova, master programme ${program}, hereby declare on my own responsibility that the master's thesis on the topic "${title}" was prepared by me and has never been submitted to another master programme or higher education institution in the country or abroad, and that the printed copy submitted to the department fully matches the electronic version uploaded into the Anti-plagiarism system.`, { spaceAfter: 240 }))
    out.push(p('I also declare that the sources used in the thesis, including those from the Internet, are listed in compliance with the rules for avoiding plagiarism:', { spaceAfter: 120 }))
    out.push(p('— text fragments are reproduced verbatim and placed between quotation marks, with a precise reference to the source;', { align: AlignmentType.LEFT, spaceAfter: 60 }))
    out.push(p('— paraphrasing of texts of other authors contains a precise reference;', { align: AlignmentType.LEFT, spaceAfter: 60 }))
    out.push(p('— summaries of other authors\' ideas contain a precise reference to the original.', { align: AlignmentType.LEFT, spaceAfter: 480 }))
  } else {
    out.push(p(`Subsemnatul(a), ${author}, absolvent al Academiei de Studii Economice din Moldova, programul de masterat ${program}, declar pe propria raspundere ca teza de master pe tema "${title}" a fost elaborata de mine si nu a mai fost prezentata niciodata la un alt program de masterat sau institutie de invatamant superior din tara sau din strainatate, iar exemplarul prezentat si inregistrat la catedra corespunde integral cu varianta electronica plasata in sistemul Anti-plagiat.`, { spaceAfter: 240 }))
    out.push(p('De asemenea, declar ca sursele utilizate in teza, inclusiv cele din Internet, sunt indicate cu respectarea regulilor de evitare a plagiatului:', { spaceAfter: 120 }))
    out.push(p('— fragmentele de text sunt reproduse intocmai si sunt scrise in ghilimele, detinand referinta precisa a sursei;', { align: AlignmentType.LEFT, spaceAfter: 60 }))
    out.push(p('— redarea/reformularea in cuvinte proprii a textelor altor autori contine referinta precisa;', { align: AlignmentType.LEFT, spaceAfter: 60 }))
    out.push(p('— rezumarea ideilor altor autori contine referinta precisa a originalului.', { align: AlignmentType.LEFT, spaceAfter: 480 }))
  }
  out.push(p(`${isEn ? 'Name and surname' : 'Numele Prenumele'}: ${author}`, { align: AlignmentType.RIGHT, spaceAfter: 120 }))
  out.push(p(`${isEn ? 'Signature' : 'Semnatura'}: __________________________`, { align: AlignmentType.RIGHT, spaceAfter: 120 }))
  out.push(p(`${isEn ? 'Date' : 'Data'}: __________________________`, { align: AlignmentType.RIGHT, spaceAfter: 120 }))
  return out
}

function buildAbbreviations(lang) {
  const isEn = lang === 'en'
  return [
    sectionTitleParagraph(isEn ? 'LIST OF ABBREVIATIONS' : 'LISTA ABREVIERILOR'),
    p(isEn
      ? 'Add here in alphabetical order all acronyms used in the text, with their meaning and (where relevant) translation into Romanian.'
      : 'Adaugati aici, in ordine alfabetica, toate acronimele folosite in text, impreuna cu semnificatia initialelor si traducerea in limba romana.', { italic: true }),
  ]
}

function buildListsOfFiguresTables(lang) {
  const isEn = lang === 'en'
  return [
    sectionTitleParagraph(isEn ? 'LIST OF FIGURES AND TABLES' : 'LISTA FIGURILOR SI LISTA TABELELOR'),
    p(isEn
      ? '(Add here all figures and tables in the order they appear in the thesis, with the page number on which each appears.)'
      : '(Adaugati aici toate figurile si tabelele in ordinea aparitiei in teza, cu numarul paginii unde apare fiecare.)', { italic: true }),
  ]
}

function buildTOC(lang) {
  const isEn = lang === 'en'
  return [
    sectionTitleParagraph(isEn ? 'CONTENTS' : 'CUPRINS'),
    new TableOfContents(isEn ? 'Contents' : 'Cuprins', {
      hyperlink: true,
      headingStyleRange: '1-3',
      stylesWithLevels: [
        new StyleLevel('Heading 1', 1),
        new StyleLevel('Heading 2', 2),
      ],
    }),
  ]
}

function buildBibliography(lang, entries) {
  const isEn = lang === 'en'
  const out = [sectionTitleParagraph(isEn ? 'BIBLIOGRAPHY' : 'BIBLIOGRAFIE')]
  if (!entries || entries.length === 0) {
    out.push(p(isEn
      ? '(Add here all sources used, formatted according to SM ISO 690:2012.)'
      : '(Adaugati aici toate sursele utilizate, formatate conform SM ISO 690:2012.)', { italic: true }))
    return out
  }
  entries.forEach((entry, i) => {
    out.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: LINE_15, after: 120 },
      indent: { left: 360, hanging: 360 },
      children: [new TextRun({ text: `${i + 1}. ${entry}`, font: FONT, size: SIZE_BODY })],
    }))
  })
  return out
}

function buildAnnexes(lang) {
  const isEn = lang === 'en'
  return [
    sectionTitleParagraph(isEn ? 'ANNEXES' : 'ANEXE'),
    p(isEn
      ? '(Place annexes here. Each annex starts on a new page, marked "Annex 1", "Annex 2", etc., in the upper right corner.)'
      : '(Plasati aici anexele. Fiecare anexa incepe pe o pagina noua, marcata "Anexa 1", "Anexa 2" etc., in coltul din dreapta sus.)', { italic: true }),
  ]
}

// ===== Main entry =====

export async function generateThesisDocx(state) {
  const { language: lang, info, plan, sections, bibliography } = state

  // Numbering for the chapters list (Roman numerals via I, II, III...)
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI']

  const allChildren = []

  // Title page
  allChildren.push(...buildTitlePage(info, lang))

  // Declaration (new page)
  allChildren.push(...buildDeclaration(info, lang))

  // Abbreviations (new page)
  allChildren.push(...buildAbbreviations(lang))

  // Lists of figures/tables (new page)
  allChildren.push(...buildListsOfFiguresTables(lang))

  // Table of contents (new page)
  allChildren.push(...buildTOC(lang))

  // Introduction
  allChildren.push(sectionTitleParagraph(lang === 'en' ? 'INTRODUCTION' : 'INTRODUCERE'))
  allChildren.push(...markdownToParagraphs(sections.introduction || ''))

  // Chapters
  plan.chapters.forEach((chapter, idx) => {
    const r = roman[idx] || `${idx + 1}`
    allChildren.push(chapterTitleParagraph(r, chapter.title))
    const md = sections.chapters?.[idx] || ''
    // The AI is instructed to start each subchapter with "## 1.1 Title".
    // We split on those markers and render them with our subchapter style.
    const parts = md.split(/^##\s+/m).filter(Boolean)
    if (parts.length === 0) {
      allChildren.push(p('(continut lipsa)', { italic: true }))
    } else {
      parts.forEach((part, sIdx) => {
        // Split first line for heading; rest for body.
        const firstLineEnd = part.indexOf('\n')
        const headingLine = firstLineEnd === -1 ? part : part.slice(0, firstLineEnd)
        const body = firstLineEnd === -1 ? '' : part.slice(firstLineEnd + 1)
        // Heading line may look like "1.1 Title"
        const m = headingLine.match(/^([\d.]+)\s+(.*)$/)
        const number = m ? m[1].replace(/\.$/, '') : `${idx + 1}.${sIdx + 1}`
        const title = m ? m[2] : headingLine
        allChildren.push(subchapterTitleParagraph(number, title.trim()))
        allChildren.push(...markdownToParagraphs(body))
      })
    }
  })

  // Conclusions
  allChildren.push(sectionTitleParagraph(lang === 'en' ? 'CONCLUSIONS AND RECOMMENDATIONS' : 'CONCLUZII SI RECOMANDARI'))
  allChildren.push(...markdownToParagraphs(sections.conclusions || ''))

  // Bibliography
  allChildren.push(...buildBibliography(lang, bibliography || []))

  // Annotations: always RO + EN per ASEM rules
  allChildren.push(sectionTitleParagraph('ADNOTARE'))
  allChildren.push(...markdownToParagraphs(sections.annotationRo || ''))

  allChildren.push(sectionTitleParagraph('ANNOTATION'))
  allChildren.push(...markdownToParagraphs(sections.annotationEn || ''))

  // Annexes
  allChildren.push(...buildAnnexes(lang))

  // ===== Document assembly =====
  const doc = new Document({
    creator: 'Generator Teza de Master',
    title: info.thesisTitle,
    description: 'Generated per ASEM GD.0.ESTM',
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZE_BODY },
          paragraph: { spacing: { line: LINE_15 } },
        },
        heading1: {
          run: { font: FONT, size: SIZE_CHAPTER, bold: true },
          paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 240, line: LINE_15 } },
        },
        heading2: {
          run: { font: FONT, size: SIZE_SUBCHAPTER, bold: true },
          paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 200, after: 160, line: LINE_15 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: convertMillimetersToTwip(210), height: convertMillimetersToTwip(297) },
            margin: {
              top: convertMillimetersToTwip(25),
              right: convertMillimetersToTwip(15),
              bottom: convertMillimetersToTwip(25),
              left: convertMillimetersToTwip(30),
            },
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
          titlePage: true,
        },
        headers: {
          // No header content; just keep separate so first page has no number.
          first: new Header({ children: [emptyP()] }),
          default: new Header({ children: [emptyP()] }),
        },
        footers: {
          first: new Footer({ children: [emptyP()] }),
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: SIZE_BODY }),
                ],
              }),
            ],
          }),
        },
        children: allChildren,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const safeTitle = (info.thesisTitle || 'teza-master').replace(/[^a-zA-Z0-9-_ ]/g, '').slice(0, 60).trim() || 'teza-master'
  const fileName = `${safeTitle}.docx`
  saveAs(blob, fileName)
  return fileName
}
