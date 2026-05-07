// Plan generation: produces a structured outline (returned as JSON) that the user can review and edit.

export function planUserPrompt({ lang, info, structureHint, contextSummary }) {
  const isEn = lang === 'en'
  const titles = info.thesisTitle
  const program = info.program || ''
  const department = info.department || ''
  const year = info.year || ''
  const author = info.authorName || ''

  const struct = (structureHint || '').trim()

  if (isEn) {
    return `Generate a complete plan (outline) for a master's thesis with the following data:

- Title: ${titles}
- Master program: ${program}
- Department: ${department}
- Author: ${author}
- Year: ${year}
- Optional structure suggested by author:
${struct || '(none — propose a logical structure)'}

- Brief case-study context extracted from uploaded documents:
${contextSummary || '(no documents uploaded yet)'}

OUTPUT: Return ONLY valid JSON, with this exact shape (no Markdown fences):
{
  "objectives": [string, ...],          // 3-5 research objectives
  "researchQuestions": [string, ...],    // 2-4 research questions
  "methodology": string,                 // 1-2 paragraphs describing the methodology (qualitative/quantitative)
  "chapters": [
    {
      "title": "Chapter I title (no 'Chapter I:' prefix)",
      "summary": "1-2 sentences describing the chapter",
      "subchapters": [
        { "number": "1.1", "title": "Subchapter title", "summary": "1 sentence" }
      ]
    }
  ],                                     // 2-4 chapters
  "innovation": string,                  // 1 paragraph: scientific innovation elements
  "expectedContribution": string         // 1 paragraph: personal contribution of the author
}

Constraints:
- 2-4 chapters total. Usually: I=theoretical, II=analytical/methodology, III=case study & recommendations.
- Each chapter has 2-4 subchapters.
- Subchapter numbering follows the chapter (1.1, 1.2, 2.1, ..., 3.3).
- Stay strictly aligned with the title. Avoid generic boilerplate.`
  }

  return `Genereaza un plan complet (cuprins detaliat) pentru o teza de master cu datele:

- Titlu: ${titles}
- Program de master: ${program}
- Catedra: ${department}
- Autor: ${author}
- Anul: ${year}
- Structura sugerata de autor (optional):
${struct || '(niciuna — propune o structura logica)'}

- Context studiu de caz extras din documentele incarcate:
${contextSummary || '(nu sunt documente incarcate)'}

IESIRE: Returneaza DOAR JSON valid, in formatul exact (fara backticks, fara cod-fence):
{
  "objectives": [string, ...],            // 3-5 obiective ale cercetarii
  "researchQuestions": [string, ...],     // 2-4 intrebari de cercetare
  "methodology": string,                  // 1-2 paragrafe care descriu metodologia (cantitativa/calitativa)
  "chapters": [
    {
      "title": "Titlul capitolului I (fara prefix 'Capitolul I:')",
      "summary": "1-2 propozitii care descriu capitolul",
      "subchapters": [
        { "number": "1.1", "title": "Titlul subcapitolului", "summary": "1 propozitie" }
      ]
    }
  ],                                      // 2-4 capitole
  "innovation": string,                   // 1 paragraf: elemente de inovatie stiintifica
  "expectedContribution": string          // 1 paragraf: contributia personala a autorului
}

Restrictii:
- 2-4 capitole in total. De obicei: I=teoretic, II=analiza/metodologie, III=studiu de caz & recomandari.
- Fiecare capitol are 2-4 subcapitole.
- Numerotare: 1.1, 1.2, 2.1, ..., 3.3.
- Pastreaza alinierea stricta cu titlul. Evita formulari generice de umplutura.`
}
