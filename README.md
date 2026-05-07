# Generator Teza de Master

Aplicatie web statica care ajuta un masterand sa elaboreze o teza de master conform ghidului ASEM **GD.0.ESTM**, folosind AI generativ (OpenAI / Anthropic / Google) cu cheia proprie a utilizatorului. Tot procesul ruleaza in browser; nu exista server backend, deci se poate hosta gratis pe **GitHub Pages**.

## Ce face

1. Utilizatorul introduce cheia proprie API (OpenAI, Anthropic sau Google).
2. Completeaza datele tezei: tema, autor, conducator, catedra, programul, anul.
3. Optional, propune o structura initiala.
4. Incarca documente pentru studiul de caz (PDF, DOCX, XLSX/CSV, imagini).
5. AI-ul propune un plan detaliat (obiective, intrebari, capitole, subcapitole) — utilizatorul il editeaza.
6. AI-ul scrie automat introducerea, fiecare capitol, concluziile si adnotarea (RO + EN).
7. AI-ul sugereaza surse bibliografice in format ISO 690:2012; utilizatorul le valideaza.
8. Aplicatia genereaza un `.docx` formatat conform ghidului: TNR 12pt, 1.5 spatiu, margini 30/25/15/25 mm, paginatie, pagina de titlu si declaratie, cuprins automat, structura cu I/II/III si 1.1/1.2, adnotare in 2 limbi, etc.

## Tehnologii

- React 18 + Vite + Tailwind CSS
- `docx` (generare Word), `pdfjs-dist`, `mammoth`, `xlsx` (parsing local)
- Apeluri directe browser → providerul AI ales

## Local development

```bash
npm install
npm run dev
```

Deschide http://localhost:5173.

## Build

```bash
npm run build
```

Output static in `dist/`.

## Deploy pe GitHub Pages

1. Forkeaza/creeaza un repo GitHub si urca codul (`git push`).
2. In repo, mergi la **Settings → Pages → Build and deployment** si seteaza **Source: GitHub Actions**.
3. La fiecare push pe `main`, workflow-ul `.github/workflows/deploy.yml` ruleaza `npm run build` cu `VITE_BASE=/<numele-repo>/` si publica `dist/` pe Pages.
4. Site-ul va fi disponibil la `https://<user>.github.io/<numele-repo>/`.

Nu e nevoie de cheie API la nivel de repo — fiecare utilizator final isi introduce singur cheia in browser.

## Securitate si limite

- Cheile API se stocheaza doar in starea aplicatiei in browser; daca reincarci pagina pierzi tot. Nu salvam nimic.
- Apelurile catre Anthropic se fac cu header-ul `anthropic-dangerous-direct-browser-access: true`. Pentru deployment "production-grade", recomandam un proxy server.
- Modelele AI pot inventa surse bibliografice — toate intrarile bibliografice trebuie verificate manual.
- Documentele incarcate (PDF/DOCX/XLSX) sunt parsate local cu pdfjs/mammoth/SheetJS; pentru imagini nu facem OCR.
- Continutul generat este punct de plecare. Verifica integritatea, datele, exemplele si pragul antiplagiat ASEM.

## Structura proiectului

```
src/
  main.jsx, App.jsx, index.css
  components/         # Stepper + un fisier per pas
  lib/
    ai/               # OpenAI, Anthropic, Google + interfata unificata
    parsers/          # PDF, DOCX, XLSX, image, builder de context
    prompts/          # Prompturi pe sectiuni (system, plan, capitole, concluzii, adnotare, bibliografie)
    docx/             # Generator Word cu formatare ASEM completa
    store.js          # Zustand store
```

## Licenta

MIT — folositi liber, atributi sursa daca o publicati.
