"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";

import type { JoinInterest } from "@/features/join/join-interest";

function fieldClassName() {
  return "w-full border-0 border-b border-[#24110E]/30 bg-transparent px-0 py-3 text-base font-semibold text-[#24110E] outline-none transition placeholder:text-[#24110E]/38 focus:border-[#741314]";
}

function keepOnlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

type JoinFormProps = {
  interest?: JoinInterest | "";
  onInterestChange?: (interest: JoinInterest | "") => void;
};

export function JoinForm({ onInterestChange }: JoinFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    setFeedbackType(null);

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const contactEmail = String(formData.get("contactEmail") ?? "").trim();
    const contactPhone = String(formData.get("contactPhone") ?? "").trim();

    const payload = {
      venueName: String(formData.get("venueName") ?? "").trim(),
      businessType: String(formData.get("businessType") ?? "").trim(),
      area: String(formData.get("area") ?? "").trim(),
      address: "",
      venuePhone: contactPhone,
      venueEmail: contactEmail,
      website: "",
      contactName: String(formData.get("contactName") ?? "").trim(),
      contactPhone,
      contactEmail,
      serviceType: "contact",
      interest: "free_presence" as const,
      message: String(formData.get("message") ?? "").trim(),
      privacyAccepted: formData.get("privacyAccepted") === "on",
    };

    if (!contactPhone && !contactEmail) {
      setFeedbackType("error");
      setFeedback("Déjanos un teléfono o un email para poder responderte.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseData = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(responseData.message ?? "No hemos podido enviar tu solicitud.");
      }

      formElement.reset();
      onInterestChange?.("");
      setFeedbackType("success");
      setFeedback("Recibido. Lo revisaremos y hablaremos contigo personalmente.");
    } catch (error) {
      setFeedbackType("error");
      setFeedback(error instanceof Error ? error.message : "No hemos podido enviar tu solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-[1.5rem] border border-[#24110E]/16 bg-[#FFF7E8] p-5 text-[#24110E] shadow-[0_24px_70px_rgba(36,17,14,0.14)] sm:p-8"
    >
      <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#741314]">Un primer contacto</p>
      <h2 className="mt-3 max-w-[16ch] text-3xl font-black leading-[.98] tracking-[-.045em] sm:text-4xl">Cuéntanos lo esencial.</h2>
      <p className="mt-3 max-w-[35rem] text-sm font-semibold leading-6 text-[#24110E]/65">Con esto basta para empezar. Después hablamos contigo y completamos lo demás juntos.</p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="grid gap-1.5 sm:col-span-2">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#741314]">Negocio o proyecto</span>
          <input name="venueName" className={fieldClassName()} placeholder="Cómo se llama" autoComplete="organization" required />
        </label>

        <label className="grid gap-1.5">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#741314]">Qué haces</span>
          <input name="businessType" className={fieldClassName()} placeholder="Cerámica, bar, taller…" />
        </label>

        <label className="grid gap-1.5">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#741314]">Dónde estás</span>
          <input name="area" className={fieldClassName()} placeholder="Ciudad o zona" autoComplete="address-level2" />
        </label>

        <label className="grid gap-1.5 sm:col-span-2">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#741314]">Tu nombre</span>
          <input name="contactName" className={fieldClassName()} placeholder="Cómo te llamamos" autoComplete="name" required />
        </label>

        <label className="grid gap-1.5">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#741314]">Teléfono</span>
          <input name="contactPhone" type="tel" inputMode="tel" autoComplete="tel" className={fieldClassName()} placeholder="Tu teléfono" onInput={(event) => { event.currentTarget.value = keepOnlyDigits(event.currentTarget.value); }} />
        </label>

        <label className="grid gap-1.5">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#741314]">Email</span>
          <input name="contactEmail" type="email" autoComplete="email" className={fieldClassName()} placeholder="tu@email.es" />
        </label>

        <p className="-mt-2 text-xs font-semibold text-[#24110E]/52 sm:col-span-2">Con teléfono o email es suficiente.</p>

        <label className="grid gap-1.5 sm:col-span-2">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#741314]">Si quieres, cuéntanos algo más</span>
          <textarea name="message" rows={2} className={fieldClassName()} placeholder="Qué te gustaría mostrar en Pickyalo." />
        </label>
      </div>

      <label className="mt-7 flex items-start gap-3 border-t border-dashed border-[#24110E]/24 pt-5">
        <input type="checkbox" name="privacyAccepted" className="mt-1 h-5 w-5 shrink-0 accent-[#741314]" required />
        <span className="text-sm font-semibold leading-6 text-[#24110E]/68">Acepto que Pickyalo me contacte y he leído la <Link href="/privacidad" className="text-[#741314] underline underline-offset-4">política de privacidad</Link>.</span>
      </label>

      <button type="submit" disabled={isSubmitting} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-[#741314] px-6 text-sm font-black text-[#FFF7E8] transition hover:bg-[#5F0F10] disabled:cursor-wait disabled:opacity-60 sm:w-auto">
        {isSubmitting ? "Enviando…" : "Quiero aparecer en Pickyalo"}
        {!isSubmitting ? <ArrowRight size={18} aria-hidden="true" /> : null}
      </button>

      {feedback ? (
        <p role="status" className={`mt-5 rounded-xl border px-4 py-3 text-sm font-semibold leading-6 ${feedbackType === "success" ? "border-[#741314]/16 bg-[#FDE3AD]/72" : "border-[#E5484D]/35 bg-[#E5484D]/10 text-[#741314]"}`}>
          {feedback}
        </p>
      ) : null}
    </form>
  );
}
