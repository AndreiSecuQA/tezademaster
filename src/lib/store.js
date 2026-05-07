import { create } from 'zustand'

export const STEPS = [
  { id: 'welcome', label: 'Start' },
  { id: 'apiKey', label: 'Cheia AI' },
  { id: 'basicInfo', label: 'Date teza' },
  { id: 'structure', label: 'Structura' },
  { id: 'documents', label: 'Studiu de caz' },
  { id: 'plan', label: 'Plan' },
  { id: 'generation', label: 'Generare' },
  { id: 'bibliography', label: 'Bibliografie' },
  { id: 'download', label: 'Descarcare' },
]

export const useStore = create((set, get) => ({
  step: 'welcome',
  language: 'ro', // 'ro' | 'en'

  // AI provider config
  provider: 'openai',
  model: '',
  apiKey: '',

  // Basic thesis info
  info: {
    thesisTitle: '',
    authorName: '',
    authorGroup: '',
    advisorName: '',
    advisorTitle: '',
    department: '',
    program: '',
    year: new Date().getFullYear().toString(),
  },

  // Optional structure suggestion
  structureHint: '',

  // Uploaded case-study documents (parsed)
  documents: [],

  // Generated plan (objectives, chapters with subchapters, etc.)
  plan: null,

  // Generated text sections
  sections: {
    introduction: '',
    chapters: [],         // string[]; index matches plan.chapters
    conclusions: '',
    annotationRo: '',
    annotationEn: '',
  },

  // Bibliography (string[])
  bibliography: [],

  // ----- actions -----
  setStep: (step) => set({ step }),
  setLanguage: (language) => set({ language }),
  setProvider: (provider) => set({ provider, model: '' }),
  setModel: (model) => set({ model }),
  setApiKey: (apiKey) => set({ apiKey }),
  setInfoField: (key, value) => set((s) => ({ info: { ...s.info, [key]: value } })),
  setStructureHint: (structureHint) => set({ structureHint }),
  setDocuments: (documents) => set({ documents }),
  addDocuments: (docs) => set((s) => ({ documents: [...s.documents, ...docs] })),
  removeDocument: (idx) => set((s) => ({ documents: s.documents.filter((_, i) => i !== idx) })),
  setPlan: (plan) => set({ plan }),
  setIntroduction: (text) => set((s) => ({ sections: { ...s.sections, introduction: text } })),
  setChapter: (idx, text) => set((s) => {
    const chapters = [...(s.sections.chapters || [])]
    chapters[idx] = text
    return { sections: { ...s.sections, chapters } }
  }),
  setConclusions: (text) => set((s) => ({ sections: { ...s.sections, conclusions: text } })),
  setAnnotation: (which, text) => set((s) => ({ sections: { ...s.sections, [which === 'ro' ? 'annotationRo' : 'annotationEn']: text } })),
  setBibliography: (entries) => set({ bibliography: entries }),

  reset: () => set({
    step: 'welcome',
    info: {
      thesisTitle: '', authorName: '', authorGroup: '', advisorName: '', advisorTitle: '',
      department: '', program: '', year: new Date().getFullYear().toString(),
    },
    structureHint: '',
    documents: [],
    plan: null,
    sections: { introduction: '', chapters: [], conclusions: '', annotationRo: '', annotationEn: '' },
    bibliography: [],
  }),
}))
