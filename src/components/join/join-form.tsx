"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Logo } from "@/components/branding/logo";
import {
  isJoinInterest,
  JOIN_INTEREST_OPTIONS,
  type JoinInterest,
} from "@/features/join/join-interest";

const businessTypes = [
  "Restaurante",
  "Bar",
  "Cafetería",
  "Panadería",
  "Pastelería",
  "Tienda gourmet",
  "Otro",
];

function fieldClassName() {
  return "w-full border-0 border-b border-[#24110E]/32 bg-transparent px-0 py-3 text-base font-semibold text-[#24110E] outline-none transition placeholder:text-[#24110E]/38 focus:border-[#741314]";
}

function keepOnlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

type JoinFormProps = {
  interest: JoinInterest | "";
  onInterestChange: (interest: JoinInterest | "") => void;
};

export function JoinForm({ interest, onInterestChange }: JoinFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(
    null,
  );

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
      address: String(formData.get("address") ?? "").trim(),
      venuePhone: contactPhone,
      venueEmail: contactEmail,
      website: "",
      contactName: String(formData.get("contactName") ?? "").trim(),
      contactPhone,
      contactEmail,
      serviceType: "pickup",
      interest,
      message: String(formData.get("message") ?? "").trim(),
      privacyAccepted: formData.get("privacyAccepted") === "on",
    };

    try {
      const response = await fetch("/api/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(
          responseData.message ??
            "No hemos podido enviar tu solicitud. Revisa los campos e inténtalo de nuevo.",
        );
      }

      formElement.reset();
      onInterestChange("");
      setFeedbackType("success");
      setFeedback(
        "Solicitud enviada. La revisaremos y te contactaremos para el siguiente paso.",
      );
    } catch (error) {
      setFeedbackType("error");
      setFeedback(
        error instanceof Error
          ? error.message
          : "No hemos podido enviar tu solicitud. Revisa los campos e inténtalo de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative mx-auto w-full max-w-[44rem] overflow-hidden rounded-[1.35rem] border border-[#24110E]/18 bg-[#FFF7E8] px-5 py-6 text-[#24110E] shadow-[0_26px_70px_rgba(36,17,14,0.18)] sm:px-8 sm:py-8 lg:px-10"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(255,247,232,0.72), rgba(255,247,232,0.9)), url('/join/notebook-paper.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-3 bg-[radial-gradient(circle_at_8px_-4px,transparent_8px,#FFF7E8_9px)] bg-[length:18px_12px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-3 rotate-180 bg-[radial-gradient(circle_at_8px_-4px,transparent_8px,#FFF7E8_9px)] bg-[length:18px_12px]"
        aria-hidden="true"
      />

      <div className="relative z-[1] flex items-start justify-between gap-5 border-b border-dashed border-[#24110E]/28 pb-5">
        <div>
          <Logo priority iconClassName="h-9" />
          <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#741314]">
            Solicitud de alta
          </p>
        </div>
        <div className="rounded-full border border-[#24110E]/20 px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.18em]">
          Recogida
        </div>
      </div>

      <div className="relative z-[1] mt-6">
        <h2 className="max-w-[15ch] text-balance text-4xl font-black leading-[0.92] sm:text-5xl">
          Cuéntanos qué local tienes.
        </h2>
        <p className="mt-4 max-w-[38rem] text-sm font-semibold leading-7 text-[#24110E]/70">
          No tienes que elegir ninguna opción ahora. Déjanos tus datos, vemos tu
          caso y te explicamos qué podemos hacer contigo.
        </p>
      </div>

      <label className="relative z-[1] mt-7 grid gap-2 rounded-[1rem] border border-[#741314]/16 bg-[#FDE3AD]/58 px-4 py-4">
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#741314]">
          Cómo quieres empezar
        </span>
        <select
          id="join-interest"
          name="interest"
          value={interest}
          onChange={(event) => {
            const nextInterest = event.currentTarget.value;
            onInterestChange(
              isJoinInterest(nextInterest) ? nextInterest : "",
            );
          }}
          className="w-full border-0 border-b border-[#24110E]/32 bg-transparent px-0 py-2 text-base font-black text-[#24110E] outline-none focus:border-[#741314]"
          required
        >
          <option value="" disabled>
            Elige una opción
          </option>
          {JOIN_INTEREST_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.title}
            </option>
          ))}
        </select>
        <span className="text-xs font-semibold leading-5 text-[#24110E]/58">
          Esta elección nos ayuda a preparar la conversación; no activa ningún
          pago ni plan automáticamente.
        </span>
      </label>

      <div className="relative z-[1] mt-7 grid gap-5 sm:grid-cols-2">
        <label className="grid gap-1.5 sm:col-span-2">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#741314]">
            Local
          </span>
          <input
            name="venueName"
            className={fieldClassName()}
            placeholder="Nombre del local"
            required
          />
        </label>

        <label className="grid gap-1.5">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#741314]">
            Tipo
          </span>
          <select
            name="businessType"
            className={fieldClassName()}
            defaultValue=""
            required
          >
            <option value="" disabled>
              Elige una opción
            </option>
            {businessTypes.map((businessType) => (
              <option key={businessType} value={businessType}>
                {businessType}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#741314]">
            Zona
          </span>
          <input
            name="area"
            className={fieldClassName()}
            placeholder="Ciudad o barrio"
            required
          />
        </label>

        <label className="grid gap-1.5 sm:col-span-2">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#741314]">
            Dirección
          </span>
          <input
            name="address"
            className={fieldClassName()}
            placeholder="Dirección o zona aproximada"
            required
          />
        </label>

        <label className="grid gap-1.5">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#741314]">
            Contacto
          </span>
          <input
            name="contactName"
            className={fieldClassName()}
            placeholder="Tu nombre"
            required
          />
        </label>

        <label className="grid gap-1.5">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#741314]">
            Teléfono
          </span>
          <input
            name="contactPhone"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="tel"
            className={fieldClassName()}
            placeholder="Teléfono"
            onInput={(event) => {
              event.currentTarget.value = keepOnlyDigits(
                event.currentTarget.value,
              );
            }}
            required
          />
        </label>

        <label className="grid gap-1.5 sm:col-span-2">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#741314]">
            Email
          </span>
          <input
            name="contactEmail"
            type="email"
            className={fieldClassName()}
            placeholder="Email de contacto"
            required
          />
        </label>

        <label className="grid gap-1.5 sm:col-span-2">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#741314]">
            Algo que quieras contar
          </span>
          <textarea
            name="message"
            rows={3}
            className={fieldClassName()}
            placeholder="Qué vendes mejor, qué quieres destacar o cuándo prefieres que te contactemos."
          />
        </label>
      </div>

      <div className="relative z-[1] mt-7 border-y border-dashed border-[#24110E]/28 py-5">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="privacyAccepted"
            className="mt-1 h-4 w-4 shrink-0 accent-[#741314]"
            required
          />
          <span className="text-sm font-semibold leading-6 text-[#24110E]/72">
            Acepto que Pickyalo me contacte para valorar el alta del local y he
            leído la{" "}
            <Link
              href="/privacidad"
              className="text-[#741314] underline underline-offset-4"
            >
              política de privacidad
            </Link>
            .
          </span>
        </label>
      </div>

      <div className="relative z-[1] mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[27rem] text-xs font-semibold leading-5 text-[#24110E]/60">
          Sin compromiso y hablando con una persona, no con un proceso automático.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-full border border-[#741314] bg-[#741314] px-6 py-3.5 text-sm font-black text-[#FDE3AD] shadow-[0_16px_36px_rgba(116,19,20,0.16)] transition hover:bg-[#5F0F10] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Enviando..." : "Enviar solicitud"}
        </button>
      </div>

      {feedback ? (
        <p
          className={`relative z-[1] mt-5 rounded-[1rem] border px-4 py-3 text-sm font-semibold leading-6 ${
            feedbackType === "success"
              ? "border-[#741314]/16 bg-[#FDE3AD]/72 text-[#24110E]/78"
              : "border-[#E5484D]/35 bg-[#E5484D]/10 text-[#741314]"
          }`}
        >
          {feedback}
        </p>
      ) : null}
    </form>
  );
}
