"use client";

import { useRef, useState } from "react";
import { AdminExploreMediaField } from "./admin-explore-media-field";
import { ExploreStoryContent } from "@/components/explore/explore-story-content";

export function AdminExploreStoryEditor({ initialValue = "", scopeId }: { initialValue?: string; scopeId: string }) {
  const [value, setValue] = useState(initialValue);
  const [preview, setPreview] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  function insert(before: string, after = "", fallback = "Texto") {
    const start = input.current?.selectionStart ?? value.length;
    const end = input.current?.selectionEnd ?? start;
    const selected = value.slice(start, end) || fallback;
    setValue(value.slice(0, start) + before + selected + after + value.slice(end));
    setPreview(false);
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }
  function insertImage(url: string, description: string) {
    const position = input.current?.selectionEnd ?? value.length;
    const alt = description.replace(/[\[\]\r\n]/g, " ").trim();
    const markup = `\n\n![${alt}](${url})\n\n`;
    setValue(value.slice(0, position) + markup + value.slice(position));
    setPreview(false);
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.setSelectionRange(position + markup.length, position + markup.length);
    });
  }
  return <div className="space-y-3 text-[#24110E]">
    <label htmlFor="explore-story-editor" className="block text-sm font-semibold">Relato completo</label>
    <div role="group" aria-label="Formato del relato" className="flex flex-wrap gap-2">
      {[
        { label: "Negrita", before: "**", after: "**" },
        { label: "Cursiva", before: "*", after: "*" },
        { label: "Título", before: "\n\n## ", after: "\n\n" },
        { label: "Cita", before: "\n\n> ", after: "\n\n" },
      ].map((tool) => <button key={tool.label} type="button" onClick={() => insert(tool.before, tool.after)} className="min-h-11 rounded-lg border border-[#741314]/25 bg-white px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#741314]">{tool.label}</button>)}
      <button type="button" aria-pressed={preview} onClick={() => setPreview(!preview)} className="min-h-11 rounded-lg bg-[#741314] px-3 text-sm text-[#FFF7E8]">{preview ? "Editar texto" : "Vista previa"}</button>
    </div>
    <p className="text-xs leading-5">Selecciona una frase para darle énfasis. Se respetan tus mayúsculas, minúsculas y saltos de párrafo.</p>
    <textarea ref={input} id="explore-story-editor" name="story" value={value} onChange={(event) => setValue(event.target.value)} rows={12} maxLength={16000} hidden={preview} className="min-h-64 w-full rounded-xl border border-[#741314]/25 bg-white p-4 text-base leading-7 focus:outline-[#741314]" />
    {preview ? <div className="max-h-[32rem] overflow-auto rounded-xl border border-[#741314]/25 bg-[#FFF7E8] p-5 text-base leading-8 [&_p]:mb-4 [&_h3]:mb-4 [&_h3]:text-2xl [&_h3]:font-bold [&_img]:w-full [&_img]:rounded-xl [&_figure]:my-6 [&_figcaption]:text-sm [&_blockquote]:border-l-4 [&_blockquote]:border-[#741314] [&_blockquote]:pl-4"><ExploreStoryContent text={value} /></div> : null}
    <AdminExploreMediaField name="story-inline-image" label="Imagen para el relato" description="Elige una imagen del móvil o del ordenador, añade una descripción e insértala donde hayas dejado el cursor. Guarda la parada al terminar." kind="photo" scopeId={scopeId} onInsert={insertImage} />
  </div>;
}
