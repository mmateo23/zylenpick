"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Check,
  Copy,
  Download,
  Eye,
  LoaderCircle,
  Palette,
  PenSquare,
  Rows3,
  Send,
} from "lucide-react";

import {
  buildEmailingHtml,
  cloneEmailingDocument,
  emailingPresets,
  emailingThemes,
  type EmailingDocument,
} from "@/features/emailing/template";

type EditorTab = "content" | "rows" | "style";

type SendState = {
  to: string;
  subject: string;
};

const tabs: Array<{
  id: EditorTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "content", label: "Contenido", icon: PenSquare },
  { id: "rows", label: "Filas", icon: Rows3 },
  { id: "style", label: "Estilo", icon: Palette },
];

function downloadHtmlFile(filename: string, html: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function EmailingStudio() {
  const [document, setDocument] = useState<EmailingDocument>(() =>
    cloneEmailingDocument(emailingPresets[0].document),
  );
  const [activePreset, setActivePreset] = useState(emailingPresets[0].id);
  const [activeTab, setActiveTab] = useState<EditorTab>("content");
  const [sendState, setSendState] = useState<SendState>(() => ({
    to: "",
    subject: emailingPresets[0].document.title,
  }));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const html = useMemo(() => buildEmailingHtml(document), [document]);
  const theme = useMemo(
    () =>
      emailingThemes.find((item) => item.id === document.themeId) ??
      emailingThemes[0],
    [document.themeId],
  );

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  const updateDocument = <Key extends keyof EmailingDocument>(
    key: Key,
    value: EmailingDocument[Key],
  ) => {
    setDocument((current) => ({ ...current, [key]: value }));
  };

  const updateItem = (
    index: number,
    key: keyof EmailingDocument["items"][number],
    value: string,
  ) => {
    setDocument((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const applyPreset = (presetId: string) => {
    const preset = emailingPresets.find((item) => item.id === presetId);

    if (!preset) {
      return;
    }

    setActivePreset(presetId);
    setDocument(cloneEmailingDocument(preset.document));
    setSendState((current) => ({
      ...current,
      subject: preset.document.title,
    }));
  };

  const copyHtml = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
  };

  const sendEmail = () => {
    startTransition(async () => {
      setFeedback(null);

      try {
        const response = await fetch("/api/emailing/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: sendState.to,
            subject: sendState.subject,
            document,
          }),
        });
        const payload = (await response.json()) as { message?: string };

        if (!response.ok) {
          setFeedback(payload.message ?? "No se pudo enviar.");
          return;
        }

        setFeedback(payload.message ?? "Email enviado.");
      } catch {
        setFeedback("No se pudo conectar con el servicio.");
      }
    });
  };

  return (
    <main className="min-h-screen bg-[#eee7dd] text-[#151515]">
      <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col px-3 py-3 sm:px-5 sm:py-5">
        <header className="mb-4 flex flex-col gap-4 rounded-[1.4rem] bg-white px-5 py-4 ring-1 ring-black/8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-black/35">
              Designer
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              Creador de emailings
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-black/55">
              Edita a la izquierda, previsualiza en el centro y copia o envía a
              la derecha.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <TopButton onClick={copyHtml}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado" : "Copiar HTML"}
            </TopButton>
            <TopButton
              onClick={() =>
                downloadHtmlFile(
                  `${document.brand.toLowerCase().replaceAll(/\s+/g, "-")}.html`,
                  html,
                )
              }
            >
              <Download className="h-4 w-4" />
              Descargar
            </TopButton>
          </div>
        </header>

        <section className="grid flex-1 overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-black/8 xl:grid-cols-[340px_minmax(0,1fr)_380px]">
          <aside className="border-b border-black/8 bg-[#faf7f2] xl:border-b-0 xl:border-r">
            <div className="border-b border-black/8 px-4 py-3">
              <div className="flex gap-2 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm ${
                        active
                          ? "bg-[#151515] text-white"
                          : "bg-white text-black/65 ring-1 ring-black/10"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-[calc(100vh-18rem)] overflow-y-auto px-4 py-4">
              {activeTab === "content" ? (
                <div className="space-y-8">
                  <SimpleSection title="Plantilla" help="Empieza por una base.">
                    <div className="space-y-3">
                      {emailingPresets.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applyPreset(preset.id)}
                          className={`w-full rounded-2xl px-4 py-4 text-left ${
                            activePreset === preset.id
                              ? "bg-[#151515] text-white"
                              : "bg-white text-[#151515] ring-1 ring-black/10"
                          }`}
                        >
                          <p className="text-sm font-semibold">{preset.label}</p>
                          <p className="mt-2 text-sm leading-6 opacity-70">
                            {preset.document.preheader}
                          </p>
                        </button>
                      ))}
                    </div>
                  </SimpleSection>

                  <SimpleSection title="Cabecera" help="La parte principal del email.">
                    <Field
                      label="Marca"
                      value={document.brand}
                      onChange={(value) => updateDocument("brand", value)}
                    />
                    <Field
                      label="Texto previo"
                      value={document.preheader}
                      onChange={(value) => updateDocument("preheader", value)}
                    />
                    <Field
                      label="Etiqueta superior"
                      value={document.eyebrow}
                      onChange={(value) => updateDocument("eyebrow", value)}
                    />
                    <Field
                      label="Titulo principal"
                      value={document.title}
                      onChange={(value) => updateDocument("title", value)}
                    />
                    <TextArea
                      label="Texto de apertura"
                      value={document.intro}
                      onChange={(value) => updateDocument("intro", value)}
                      rows={4}
                    />
                  </SimpleSection>

                  <SimpleSection title="Zona central" help="El destaque y el botón.">
                    <Field
                      label="Nombre del destaque"
                      value={document.highlightLabel}
                      onChange={(value) =>
                        updateDocument("highlightLabel", value)
                      }
                    />
                    <Field
                      label="Valor del destaque"
                      value={document.highlightValue}
                      onChange={(value) =>
                        updateDocument("highlightValue", value)
                      }
                    />
                    <Field
                      label="Titulo de la zona central"
                      value={document.sectionTitle}
                      onChange={(value) => updateDocument("sectionTitle", value)}
                    />
                    <TextArea
                      label="Texto de la zona central"
                      value={document.sectionText}
                      onChange={(value) => updateDocument("sectionText", value)}
                      rows={3}
                    />
                    <Field
                      label="Texto del botón"
                      value={document.ctaLabel}
                      onChange={(value) => updateDocument("ctaLabel", value)}
                    />
                    <Field
                      label="URL"
                      value={document.ctaUrl}
                      onChange={(value) => updateDocument("ctaUrl", value)}
                    />
                  </SimpleSection>
                </div>
              ) : null}

              {activeTab === "rows" ? (
                <div className="space-y-8">
                  {document.items.map((item, index) => (
                    <SimpleSection
                      key={item.id}
                      title={`Fila ${index + 1}`}
                      help="Edita este bloque del correo."
                    >
                      <Field
                        label="Etiqueta corta"
                        value={item.label}
                        onChange={(value) => updateItem(index, "label", value)}
                      />
                      <Field
                        label="Titulo de la fila"
                        value={item.title}
                        onChange={(value) => updateItem(index, "title", value)}
                      />
                      <TextArea
                        label="Texto de la fila"
                        value={item.text}
                        onChange={(value) => updateItem(index, "text", value)}
                        rows={3}
                      />
                      <Field
                        label="Dato extra"
                        value={item.meta}
                        onChange={(value) => updateItem(index, "meta", value)}
                      />
                    </SimpleSection>
                  ))}
                </div>
              ) : null}

              {activeTab === "style" ? (
                <div className="space-y-8">
                  <SimpleSection title="Tema" help="Escoge una paleta visual.">
                    <div className="grid gap-3">
                      {emailingThemes.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => updateDocument("themeId", item.id)}
                          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left ${
                            document.themeId === item.id
                              ? "bg-[#151515] text-white"
                              : "bg-white text-[#151515] ring-1 ring-black/10"
                          }`}
                        >
                          <span
                            className="h-10 w-10 rounded-full ring-1 ring-black/10"
                            style={{ backgroundColor: item.accent }}
                          />
                          <div>
                            <p className="text-sm font-semibold">{item.label}</p>
                            <p className="text-sm opacity-65">{item.id}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </SimpleSection>

                  <SimpleSection title="Cierre" help="Texto final y respuesta.">
                    <TextArea
                      label="Texto final"
                      value={document.footer}
                      onChange={(value) => updateDocument("footer", value)}
                      rows={3}
                    />
                    <Field
                      label="Correo de respuesta"
                      value={document.replyTo}
                      onChange={(value) => updateDocument("replyTo", value)}
                    />
                  </SimpleSection>
                </div>
              ) : null}
            </div>
          </aside>

          <main className="border-b border-black/8 bg-[#f3efe8] xl:border-b-0 xl:border-r">
            <div className="border-b border-black/8 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-black/35">
                    Preview
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-[#151515]">
                    Vista previa
                  </h3>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs uppercase tracking-[0.22em] text-black/50 ring-1 ring-black/10">
                  <Eye className="h-3.5 w-3.5" />
                  Live
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="mb-4 rounded-[1rem] bg-white px-4 py-3 ring-1 ring-black/10">
                <p className="text-[11px] uppercase tracking-[0.22em] text-black/35">
                  Asunto
                </p>
                <p className="mt-1 text-lg font-semibold text-[#151515]">
                  {sendState.subject || document.title}
                </p>
              </div>

              <iframe
                title="Preview del emailing"
                srcDoc={html}
                className="h-[80vh] min-h-[820px] w-full rounded-[1rem] border-0 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
              />
            </div>
          </main>

          <aside className="bg-[#f7f4ee]">
            <div className="border-b border-black/8 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.28em] text-black/35">
                Código y envío
              </p>
              <h3 className="mt-1 text-sm font-semibold text-[#151515]">
                Salida lista para usar
              </h3>
            </div>

            <div className="grid h-[calc(100vh-18rem)] grid-rows-[auto_minmax(0,1fr)]">
              <div className="border-b border-black/8 px-4 py-4">
                <SimpleSection
                  title="Enviar prueba"
                  help="Manda una prueba cuando el preview esté bien."
                  compact
                >
                  <Field
                    label="Destinatario"
                    value={sendState.to}
                    onChange={(value) =>
                      setSendState((current) => ({ ...current, to: value }))
                    }
                  />
                  <Field
                    label="Asunto"
                    value={sendState.subject}
                    onChange={(value) =>
                      setSendState((current) => ({ ...current, subject: value }))
                    }
                  />
                  <button
                    type="button"
                    onClick={sendEmail}
                    disabled={isPending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#151515] px-4 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-70"
                  >
                    {isPending ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Enviar email
                  </button>
                  {feedback ? (
                    <p className="text-sm leading-6 text-black/55">{feedback}</p>
                  ) : null}
                </SimpleSection>
              </div>

              <div className="min-h-0 px-4 py-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-black/35">
                      HTML
                    </p>
                    <h4 className="mt-1 text-sm font-semibold text-[#151515]">
                      Copia o descarga
                    </h4>
                  </div>
                  <div className="flex gap-2">
                    <MiniButton onClick={copyHtml}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </MiniButton>
                    <MiniButton
                      onClick={() =>
                        downloadHtmlFile(
                          `${document.brand.toLowerCase().replaceAll(/\s+/g, "-")}.html`,
                          html,
                        )
                      }
                    >
                      <Download className="h-4 w-4" />
                    </MiniButton>
                  </div>
                </div>

                <textarea
                  readOnly
                  value={html}
                  className="h-full min-h-[28rem] w-full resize-none rounded-[1rem] bg-white p-4 font-mono text-[13px] leading-7 text-[#223036] outline-none ring-1 ring-black/10"
                />
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function TopButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full bg-[#151515] px-4 py-2.5 text-sm text-white"
    >
      {children}
    </button>
  );
}

function MiniButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#151515] ring-1 ring-black/10"
    >
      {children}
    </button>
  );
}

function SimpleSection({
  title,
  help,
  children,
  compact = false,
}: {
  title: string;
  help: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section>
      <div className={compact ? "" : "mb-4"}>
        <h4 className="text-base font-semibold tracking-[-0.02em] text-[#151515]">
          {title}
        </h4>
        <p className="mt-1 text-sm leading-6 text-black/52">{help}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.18em] text-black/36">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm text-[#151515] outline-none ring-1 ring-black/10 placeholder:text-black/25"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.18em] text-black/36">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full resize-none rounded-2xl border-0 bg-white px-4 py-3 text-sm leading-6 text-[#151515] outline-none ring-1 ring-black/10"
      />
    </label>
  );
}
