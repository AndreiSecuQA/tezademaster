// Per-section prompts: introduction, chapter, conclusions, annotation.

const wordsPerPage = 350 // ~ TNR 12pt at 1.5 line spacing
export function pagesToWords(pages) {
  return Math.round(pages * wordsPerPage)
}

export function introUserPrompt({ lang, info, plan, contextSummary }) {
  const isEn = lang === 'en'
  if (isEn) {
    return `Write the INTRODUCTION for the master's thesis. Title: "${info.thesisTitle}".

Plan:
${JSON.stringify(plan, null, 2)}

Case-study context summary:
${contextSummary || '(none)'}

REQUIRED CONTENT (3-4 pages, ~${pagesToWords(3.5)} words):
- Importance and topicality of the topic
- Degree to which it has been studied in the literature
- Aim and objectives of the thesis
- Object of study
- Scientific-methodological basis
- Elements of scientific innovation
- A short summary of each chapter

Output: plain text in markdown-light (use ## for any internal subheading, but the whole thing is the "Introduction" section). No bibliography here.`
  }
  return `Scrie INTRODUCEREA pentru teza de master. Titlu: "${info.thesisTitle}".

Plan:
${JSON.stringify(plan, null, 2)}

Rezumat context studiu de caz:
${contextSummary || '(niciunul)'}

CONTINUT OBLIGATORIU (3-4 pagini, ~${pagesToWords(3.5)} cuvinte):
- Importanta si actualitatea temei
- Gradul de studiere in literatura de specialitate
- Scopul si sarcinile tezei
- Obiectul studiului
- Baza stiintifico-metodologica
- Elemente de inovatie stiintifica
- Sumarul (rezumatul scurt) al fiecarui capitol

Iesire: text simplu, fara titlu "Introducere" la inceput (acela il pun eu). Fara bibliografie aici.`
}

export function chapterUserPrompt({ lang, info, plan, chapter, contextSummary, isCaseStudy }) {
  const isEn = lang === 'en'
  const subList = chapter.subchapters
    .map(s => `- ${s.number}. ${s.title}${s.summary ? ` — ${s.summary}` : ''}`)
    .join('\n')
  const targetPages = isCaseStudy ? 22 : 18
  const targetWords = pagesToWords(targetPages)

  if (isEn) {
    return `Write CHAPTER "${chapter.title}" of the master's thesis "${info.thesisTitle}".

Subchapters to cover (in this exact order):
${subList}

Plan context:
${JSON.stringify({ objectives: plan.objectives, methodology: plan.methodology }, null, 2)}

${isCaseStudy ? `IMPORTANT: This chapter is the CASE-STUDY chapter. Use the documents the user provided:\n${contextSummary || '(none)'}` : ''}

REQUIREMENTS:
- Target length: ~${targetWords} words (~${targetPages} pages, TNR 12pt 1.5 spacing).
- Output as Markdown. Use a heading "## ${chapter.subchapters[0].number} ..." style for each subchapter.
- Within each subchapter, write 4-8 substantial paragraphs.
- Where data would normally appear, describe the structure of the table/figure (e.g., "Table 1.${0} below shows...") — do NOT invent fake numbers if the user didn't provide them.
- Every paragraph should have content; no filler like "this section will discuss".
- Do NOT include the chapter's main title yourself; just start with the first subchapter heading.`
  }
  return `Scrie CAPITOLUL "${chapter.title}" din teza de master "${info.thesisTitle}".

Subcapitole de acoperit (in aceasta ordine exacta):
${subList}

Context din plan:
${JSON.stringify({ objectives: plan.objectives, methodology: plan.methodology }, null, 2)}

${isCaseStudy ? `IMPORTANT: Acesta este capitolul cu STUDIUL DE CAZ. Foloseste documentele furnizate de utilizator:\n${contextSummary || '(niciunul)'}` : ''}

CERINTE:
- Lungime tinta: ~${targetWords} cuvinte (~${targetPages} pagini, TNR 12pt, 1.5 spatiu).
- Iesire in Markdown. Foloseste "## ${chapter.subchapters[0].number} ..." pentru fiecare subcapitol.
- In fiecare subcapitol scrie 4-8 paragrafe substantiale.
- Unde ar aparea date, descrie structura tabelului/figurii ("Tabelul 1.${0} de mai jos prezinta...") — NU inventa cifre concrete daca utilizatorul nu le-a furnizat.
- Fara fraze de umplutura tip "in aceasta sectiune se va discuta".
- NU include titlul mare al capitolului; incepe direct cu primul subcapitol.`
}

export function conclusionsUserPrompt({ lang, info, plan, summaries }) {
  const isEn = lang === 'en'
  if (isEn) {
    return `Write the "CONCLUSIONS AND RECOMMENDATIONS" section for the thesis "${info.thesisTitle}".

Brief summaries of each chapter that has been written:
${summaries.map((s, i) => `Chapter ${i + 1}: ${s}`).join('\n')}

Plan:
${JSON.stringify(plan, null, 2)}

REQUIREMENTS:
- ~2-3 pages (~${pagesToWords(2.5)} words).
- Two parts:
  (a) General conclusions: synthesis of theoretical and practical findings.
  (b) Recommendations: 5-8 numbered, actionable recommendations.
- Highlight the AUTHOR'S OWN CONTRIBUTION explicitly.
- Do NOT include a heading "Conclusions and Recommendations" yourself.`
  }
  return `Scrie sectiunea "CONCLUZII SI RECOMANDARI" pentru teza "${info.thesisTitle}".

Rezumate scurte ale capitolelor deja scrise:
${summaries.map((s, i) => `Capitolul ${i + 1}: ${s}`).join('\n')}

Plan:
${JSON.stringify(plan, null, 2)}

CERINTE:
- ~2-3 pagini (~${pagesToWords(2.5)} cuvinte).
- Doua parti:
  (a) Concluzii generale: sinteza constatarilor teoretice si practice.
  (b) Recomandari: 5-8 recomandari numerotate, actionabile.
- Evidentiaza explicit CONTRIBUTIA PROPRIE A AUTORULUI.
- NU include singur titlul "Concluzii si recomandari".`
}

export function annotationUserPrompt({ lang, langOfThesis, info, plan, structureSummary }) {
  // langOfThesis is the language the thesis is written in. We always need RO + EN annotations.
  // 'lang' here is which language to write THIS annotation in (ro or en).
  const isEn = lang === 'en'
  if (isEn) {
    return `Write the ANNOTATION (rezumat / abstract) IN ENGLISH for the master's thesis "${info.thesisTitle}".

Plan and structure:
${JSON.stringify(plan, null, 2)}

Structure summary (volume, chapters, etc.):
${structureSummary}

REQUIRED FORMAT (1 page max):
- Title of the work
- Author
- Structure (e.g.: introduction, three chapters, conclusions and recommendations, X bibliography titles, X annexes, X pages of main text, X figures, X tables)
- Keywords (up to 10, one line)
- Then short paragraphs labeled: Field of study, Aim and objectives, Research methodology, Elements of innovation and scientific originality, Personal contribution, Conclusions and recommendations.

Output as plain text. The label for each subsection should be bold-marked with **double asterisks** so we can render it.`
  }
  return `Scrie ADNOTAREA (rezumatul) IN LIMBA ROMANA pentru teza de master "${info.thesisTitle}".

Plan si structura:
${JSON.stringify(plan, null, 2)}

Rezumat structura (volum, capitole, etc.):
${structureSummary}

FORMAT OBLIGATORIU (maxim 1 pagina):
- Titlul lucrarii
- Numele autorului
- Structura tezei (ex.: introducere, trei capitole, concluzii generale si recomandari, X titluri bibliografie, X anexe, X pagini text de baza, X figuri, X tabele)
- Cuvinte-cheie (pana la 10, intr-un rand)
- Apoi paragrafe scurte etichetate: Domeniul de studiu, Scopul si obiectivele, Metodologia cercetarii, Elementele de inovatie si originalitatea stiintifica, Contributia personala, Concluzii si recomandari.

Iesire: text simplu. Marcheaza eticheta fiecarei sub-sectiuni cu **doua asteriscuri** pentru a fi recunoscute.`
}

export function bibliographySuggestPrompt({ lang, info, plan }) {
  const isEn = lang === 'en'
  if (isEn) {
    return `Suggest 25-35 bibliography entries the user could verify and use for the master's thesis "${info.thesisTitle}".

Plan:
${JSON.stringify(plan, null, 2)}

REQUIREMENTS:
- Mix: legal acts, books/monographs, conference papers, journal articles, electronic resources.
- Format each entry STRICTLY in SM ISO 690:2012 style (the same one ASEM uses).
- Each entry on a single line, prefixed with a number "1. ", "2. " ...
- Realistic-looking entries only. If you are uncertain whether a specific source exists, prefer well-known textbooks and authors in the field. Mark uncertain entries with "[verifica]" at the end of the line.
- Output: numbered list, no extra commentary.`
  }
  return `Sugereaza 25-35 surse bibliografice pe care utilizatorul sa le verifice si sa le foloseasca pentru teza de master "${info.thesisTitle}".

Plan:
${JSON.stringify(plan, null, 2)}

CERINTE:
- Mix: acte normative, manuale/monografii, lucrari de conferinta, articole de revista, resurse electronice.
- Formateaza STRICT in SM ISO 690:2012 (acelasi stil folosit de ASEM).
- Fiecare intrare pe un singur rand, cu prefix numeric "1. ", "2. " ...
- Doar intrari plauzibile. Cand nu esti sigur ca o sursa specifica exista, prefera manuale si autori de referinta in domeniu. Marcheaza intrarile incerte cu "[verifica]" la final.
- Iesire: lista numerotata, fara comentarii.`
}
