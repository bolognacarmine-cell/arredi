import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { SECTORS } from "../data"
import * as quotesApi from "../api/quotesApi"
import Alert from "../components/Alert"
import SEOHead from "../components/SEOHead"

export default function Quote() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    setTimeout(() => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }, 100)
    setTimeout(() => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }, 300)
  }, [])

  const [params] = useSearchParams()
  const preselect = params.get("settore") || ""
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([])
  const [documentDragActive, setDocumentDragActive] = useState(false)
  const [documentError, setDocumentError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nome: "",
    cognome: "",
    azienda: "",
    email: "",
    telefono: "",
    settore: preselect,
    arredo: "",
    metratura: "",
    messaggio: "",
    privacy: false,
  })

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }))

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 8 * 1024 * 1024 // 8MB

    if (!allowedTypes.includes(file.type)) {
      return 'Formato non supportato. Usa JPEG, PNG o WebP.'
    }

    if (file.size > maxSize) {
      return 'File troppo grande. Massimo 8MB per immagine.'
    }

    if (file.size === 0) {
      return 'File vuoto o corrotto.'
    }

    return null
  }

  const validateDocument = (file: File): string | null => {
    const allowedTypes = ['application/pdf']
    const maxSize = 8 * 1024 * 1024 // 8MB

    if (!allowedTypes.includes(file.type)) {
      return 'Formato non supportato. Usa solo PDF.'
    }

    if (file.size > maxSize) {
      return 'File troppo grande. Massimo 8MB per documento.'
    }

    if (file.size === 0) {
      return 'File vuoto o corrotto.'
    }

    return null
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    setFileError(null)
    const newFiles: File[] = []
    const errors: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const error = validateFile(file)

      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        newFiles.push(file)
      }
    }

    if (errors.length > 0) {
      setFileError(errors.join('; '))
    }

    if (newFiles.length > 0) {
      setSelectedFiles((prev) => {
        const total = prev.length + newFiles.length
        if (total > 6) {
          setFileError('Massimo 6 immagini per preventivo.')
          return [...prev, ...newFiles.slice(0, 6 - prev.length)]
        }
        return [...prev, ...newFiles]
      })
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setFileError(null)
  }

  const handleDocuments = (files: FileList | null) => {
    if (!files) return

    setDocumentError(null)
    const newDocuments: File[] = []
    const errors: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const error = validateDocument(file)

      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        newDocuments.push(file)
      }
    }

    if (errors.length > 0) {
      setDocumentError(errors.join('; '))
    }

    if (newDocuments.length > 0) {
      setSelectedDocuments((prev) => {
        const total = prev.length + newDocuments.length
        if (total > 3) {
          setDocumentError('Massimo 3 documenti per preventivo.')
          return [...prev, ...newDocuments.slice(0, 3 - prev.length)]
        }
        return [...prev, ...newDocuments]
      })
    }
  }

  const handleDocumentDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDocumentDragActive(true)
    } else if (e.type === 'dragleave') {
      setDocumentDragActive(false)
    }
  }

  const handleDocumentDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDocumentDragActive(false)
    handleDocuments(e.dataTransfer.files)
  }

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleDocuments(e.target.files)
  }

  const removeDocument = (index: number) => {
    setSelectedDocuments((prev) => prev.filter((_, i) => i !== index))
    setDocumentError(null)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const today = new Date().toLocaleDateString("it-IT")

      if (selectedFiles.length > 0 || selectedDocuments.length > 0) {
        const formData = new FormData()
        formData.append('nome', form.nome)
        formData.append('cognome', form.cognome)
        formData.append('azienda', form.azienda)
        formData.append('settore', form.settore)
        formData.append('email', form.email)
        formData.append('telefono', form.telefono)
        formData.append('data', today)
        formData.append('stato', 'nuovo')
        formData.append('metratura', form.metratura)
        formData.append('arredo', form.arredo)
        formData.append('messaggio', form.messaggio)
        formData.append('note', '')
        formData.append('createdAt', new Date().toISOString())
        formData.append('updatedAt', new Date().toISOString())

        selectedFiles.forEach((file) => {
          formData.append('attachments', file)
        })

        selectedDocuments.forEach((doc) => {
          formData.append('documents', doc)
        })

        try {
          await quotesApi.createQuoteWithAttachments(formData)
        } catch (uploadError: any) {
          // If upload fails due to Cloudinary not configured, fallback to regular quote
          if (uploadError.message && uploadError.message.includes('Servizio di upload non configurato')) {
            console.warn('Cloudinary not configured, submitting quote without attachments')
            // Show warning to user that images weren't uploaded
            setError("Il servizio di upload immagini non è configurato. Il preventivo è stato inviato senza allegati.")
            await quotesApi.createQuote({
              id: "",
              nome: form.nome,
              cognome: form.cognome,
              azienda: form.azienda,
              settore: form.settore,
              email: form.email,
              telefono: form.telefono,
              data: today,
              stato: "nuovo",
              metratura: form.metratura,
              arredo: form.arredo,
              messaggio: form.messaggio,
              note: "",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          } else {
            throw uploadError
          }
        }
      } else {
        await quotesApi.createQuote({
          id: "",
          nome: form.nome,
          cognome: form.cognome,
          azienda: form.azienda,
          settore: form.settore,
          email: form.email,
          telefono: form.telefono,
          data: today,
          stato: "nuovo",
          metratura: form.metratura,
          arredo: form.arredo,
          messaggio: form.messaggio,
          note: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }

      setSubmitted(true)
    } catch (err) {
      console.error("Error submitting quote:", err)
      setError("Impossibile inviare la richiesta. Riprova o contattaci direttamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center pt-20 px-6">
        <div className="text-center max-w-lg">
          <div className="w-16 h-16 bg-[var(--primary)] flex items-center justify-center mx-auto mb-6 rounded-full">
            <span className="text-white text-2xl">✓</span>
          </div>
          <h1 className="font-display text-3xl font-light text-[var(--foreground)] mb-4">
            Richiesta inviata con successo
          </h1>
          <p className="text-[var(--muted-foreground)] leading-relaxed mb-8">
            Grazie per la tua richiesta. Il nostro team ti contatterà entro 24
            ore lavorative per discutere il tuo progetto e, se necessario,
            fissare un sopralluogo gratuito.
          </p>
          <Link
            to="/"
            className="inline-flex items-center bg-[var(--primary)] text-white text-sm font-medium px-6 py-3.5 hover:bg-[var(--foreground)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            Torna alla home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--background)] min-h-screen pt-24">
      <SEOHead
        title="Preventivo Arredamento Gratuito - Farcom Srl Macerata Campania e Italia"
        description="Richiedi un preventivo gratuito per arredamento su misura a Macerata Campania, Caserta e in tutta Italia. Sopralluogo gratuito e consulenza senza impegno. Arredatore di interni esperti."
        canonical="https://arredi.onrender.com/preventivo"
        schema={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Come richiedere un preventivo per arredamento?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Compila il modulo di richiesta preventivo sul nostro sito. Ti ricontatteremo entro 24 ore lavorative per discutere il tuo progetto e fissare un sopralluogo gratuito se necessario."
              }
            },
            {
              "@type": "Question",
              "name": "Il preventivo per arredamento è gratuito?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sì, il preventivo e il sopralluogo sono completamente gratuiti e senza impegno. Inviaci la richiesta tramite il modulo e riceverai un'offerta personalizzata."
              }
            },
            {
              "@type": "Question",
              "name": "Farcom lavora solo in Campania o anche in altre regioni?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Farcom Srl ha sede a Macerata Campania ma offre servizio di arredamento e progettazione interni in tutta Italia. Operiamo a livello nazionale con la stessa qualità artigianale."
              }
            },
            {
              "@type": "Question",
              "name": "Quanto tempo ci vuole per ricevere il preventivo?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Dopo la richiesta, ti ricontatteremo entro 24 ore lavorative. Per progetti complessi, i tempi possono variare in base alla necessità di sopralluogo e raccolta informazioni dettagliate."
              }
            },
            {
              "@type": "Question",
              "name": "Cosa serve per richiedere un preventivo?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Compila il modulo con i tuoi dati di contatto, descrivi il progetto, indica la metratura approssimativa e il tipo di arredi richiesti. Puoi anche allegare immagini o documenti PDF del progetto per aiutarci a comprendere meglio le tue esigenze."
              }
            }
          ]
        }}
      />
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-16">
        <div className="mb-12">
          <span className="text-[var(--muted-foreground)] text-xs tracking-widest uppercase font-semibold">
            Sopralluogo gratuito
          </span>
          <h1 className="font-display text-5xl font-light text-[var(--foreground)] mt-2 mb-4">
            Preventivo Arredamento Gratuito
          </h1>
          <p className="text-[var(--muted-foreground)] max-w-lg leading-relaxed">
            Richiedi un preventivo gratuito per arredamento su misura a Macerata Campania, Caserta e in tutta Italia. Il sopralluogo e la prima consulenza sono sempre gratuiti e senza impegno.
          </p>
        </div>

        {error && (
          <Alert type="error">{error}</Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal */}
          <fieldset>
            <legend className="font-display text-xl font-light text-[var(--foreground)] mb-5 pb-3 border-b border-[var(--border)] w-full">
              Dati di contatto
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                ["nome", "Nome *", "text", true],
                ["cognome", "Cognome *", "text", true],
                ["azienda", "Azienda / Attività", "text", false],
                ["email", "Email *", "email", true],
                ["telefono", "Telefono *", "tel", true],
              ].map(([k, label, type, req]) => (
                <div
                  key={k as string}
                  className={k === "azienda" ? "sm:col-span-2" : ""}
                >
                  <label className="block text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-1.5">
                    {label as string}
                  </label>
                  <input
                    type={type as string}
                    required={req as boolean}
                    value={form[(k as keyof typeof form)] as string}
                    onChange={(e) => set(k as string, e.target.value)}
                    className="w-full border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 transition-colors"
                  />
                </div>
              ))}
            </div>
          </fieldset>

          {/* Project */}
          <fieldset>
            <legend className="font-display text-xl font-light text-[var(--foreground)] mb-5 pb-3 border-b border-[var(--border)] w-full">
              Dettaglio progetto
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-1.5">
                  Settore *
                </label>
                <select
                  required
                  value={form.settore}
                  onChange={(e) => set("settore", e.target.value)}
                  className="w-full border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 transition-colors"
                >
                  <option value="">Seleziona settore</option>
                  {SECTORS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-1.5">
                  Metratura approssimativa (m²)
                </label>
                <input
                  type="number"
                  min="5"
                  value={form.metratura}
                  onChange={(e) => set("metratura", e.target.value)}
                  className="w-full border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 transition-colors"
                  placeholder="es. 40"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-1.5">
                  Tipo di arredi richiesti
                </label>
                <input
                  type="text"
                  value={form.arredo}
                  onChange={(e) => set("arredo", e.target.value)}
                  placeholder="es. banco reception, postazioni, specchiere…"
                  className="w-full border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-1.5">
                  Descrizione del progetto
                </label>
                <textarea
                  rows={5}
                  value={form.messaggio}
                  onChange={(e) => set("messaggio", e.target.value)}
                  placeholder="Raccontaci la tua idea, le dimensioni dello spazio, i materiali preferiti, i tempi previsti…"
                  className="w-full border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 transition-colors resize-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-1.5">
                  Immagini del progetto (opzionale)
                </label>
                <div
                  className={`border border-dashed bg-white p-6 text-center text-sm text-[var(--muted-foreground)] transition-colors ${
                    dragActive ? 'border-[var(--primary)] bg-[var(--background)]' : 'border-[var(--border)]'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <span className="block text-2xl mb-2">📎</span>
                  <span>Trascina qui le immagini o </span>
                  <label className="text-[var(--primary)] underline cursor-pointer">
                    sfoglia
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <span className="block text-xs mt-1 text-[var(--muted-foreground)]">
                    JPG, PNG, WebP – max 8MB per immagine, max 6 immagini
                  </span>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs text-[var(--muted-foreground)] mb-2">
                      {selectedFiles.length} {selectedFiles.length === 1 ? 'immagine selezionata' : 'immagini selezionate'}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-[var(--background)] rounded-lg overflow-hidden border border-[var(--border)]">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            aria-label="Rimuovi immagine"
                          >
                            ✕
                          </button>
                          <div className="mt-1 text-xs text-[var(--muted-foreground)] truncate" title={file.name}>
                            {file.name}
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)]">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {fileError && (
                  <Alert type="warning" className="mt-2">{fileError}</Alert>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-1.5">
                  Documenti del progetto (opzionale)
                </label>
                <div
                  className={`border border-dashed bg-white p-6 text-center text-sm text-[var(--muted-foreground)] transition-colors ${
                    documentDragActive ? 'border-[var(--primary)] bg-[var(--background)]' : 'border-[var(--border)]'
                  }`}
                  onDragEnter={handleDocumentDrag}
                  onDragLeave={handleDocumentDrag}
                  onDragOver={handleDocumentDrag}
                  onDrop={handleDocumentDrop}
                >
                  <span className="block text-2xl mb-2">📄</span>
                  <span>Trascina qui i documenti o </span>
                  <label className="text-[var(--primary)] underline cursor-pointer">
                    sfoglia
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      accept="application/pdf"
                      onChange={handleDocumentSelect}
                    />
                  </label>
                  <span className="block text-xs mt-1 text-[var(--muted-foreground)]">
                    PDF – max 8MB per documento, max 3 documenti
                  </span>
                </div>

                {selectedDocuments.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs text-[var(--muted-foreground)] mb-2">
                      {selectedDocuments.length} {selectedDocuments.length === 1 ? 'documento selezionato' : 'documenti selezionati'}
                    </div>
                    <div className="space-y-2">
                      {selectedDocuments.map((file, index) => (
                        <div key={index} className="relative group flex items-center gap-3 bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]">
                          <div className="text-2xl">📄</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-[var(--foreground)] font-medium truncate" title={file.name}>
                              {file.name}
                            </div>
                            <div className="text-xs text-[var(--muted-foreground)]">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            aria-label="Rimuovi documento"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {documentError && (
                  <Alert type="warning" className="mt-2">{documentError}</Alert>
                )}
              </div>
            </div>
          </fieldset>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="privacy"
              required
              checked={form.privacy}
              onChange={(e) => set("privacy", e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
            />
            <label htmlFor="privacy" className="text-sm text-[var(--foreground)]">
              Ho letto e accetto la{" "}
              <a href="/privacy" className="text-[var(--primary)] underline">Privacy Policy</a>
              {" "}e acconsento al trattamento dei dati personali per finalità commerciali. *
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-[var(--primary)] text-white text-sm font-semibold px-10 py-4 hover:bg-[var(--foreground)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            {isSubmitting ? "Invio in corso..." : "Invia richiesta"}
          </button>
        </form>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="font-display text-2xl font-light text-[var(--foreground)] mb-8">
            Domande frequenti sul preventivo arredamento
          </h2>
          <div className="space-y-6">
            <div className="border border-[var(--border)] bg-white p-6 rounded-lg">
              <h3 className="font-semibold text-[var(--foreground)] mb-2">Come richiedere un preventivo per arredamento?</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                Compila il modulo di richiesta preventivo sul nostro sito. Ti ricontatteremo entro 24 ore lavorative per discutere il tuo progetto e fissare un sopralluogo gratuito se necessario.
              </p>
            </div>
            <div className="border border-[var(--border)] bg-white p-6 rounded-lg">
              <h3 className="font-semibold text-[var(--foreground)] mb-2">Il preventivo per arredamento è gratuito?</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                Sì, il preventivo e il sopralluogo sono completamente gratuiti e senza impegno. Inviaci la richiesta tramite il modulo e riceverai un'offerta personalizzata.
              </p>
            </div>
            <div className="border border-[var(--border)] bg-white p-6 rounded-lg">
              <h3 className="font-semibold text-[var(--foreground)] mb-2">Farcom lavora solo in Campania o anche in altre regioni?</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                Farcom Srl ha sede a Macerata Campania ma offre servizio di arredamento e progettazione interni in tutta Italia. Operiamo a livello nazionale con la stessa qualità artigianale.
              </p>
            </div>
            <div className="border border-[var(--border)] bg-white p-6 rounded-lg">
              <h3 className="font-semibold text-[var(--foreground)] mb-2">Quanto tempo ci vuole per ricevere il preventivo?</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                Dopo la richiesta, ti ricontatteremo entro 24 ore lavorative. Per progetti complessi, i tempi possono variare in base alla necessità di sopralluogo e raccolta informazioni dettagliate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
