"use client";

import { FormEvent, useState } from "react";

const serviceOptions = [
  { value: "pickup", label: "Recogida" },
  { value: "delivery", label: "Domicilio" },
  { value: "both", label: "Ambos" },
];

const businessTypes = [
  "Restaurante",
  "Hamburguesería",
  "Pizzería",
  "Sushi",
  "Cafetería",
  "Pastelería",
  "Otro",
];

function fieldClassName() {
  return "w-full rounded-[1.1rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)]";
}

export function JoinForm() {
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

    const payload = {
      venueName: String(formData.get("venueName") ?? "").trim(),
      businessType: String(formData.get("businessType") ?? "").trim(),
      area: String(formData.get("area") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim(),
      venuePhone: String(formData.get("venuePhone") ?? "").trim(),
      venueEmail: String(formData.get("venueEmail") ?? "").trim(),
      website: String(formData.get("website") ?? "").trim(),
      contactName: String(formData.get("contactName") ?? "").trim(),
      contactPhone: String(formData.get("contactPhone") ?? "").trim(),
      contactEmail: String(formData.get("contactEmail") ?? "").trim(),
      serviceType: String(formData.get("serviceType") ?? "").trim(),
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
      setFeedbackType("success");
      setFeedback(
        "Solicitud enviada correctamente. Revisaremos tus datos y te contactaremos pronto.",
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
      className="glass-panel rounded-[2rem] border border-[color:var(--border)] p-6 shadow-[var(--shadow)] sm:p-8"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Nombre del local
          </span>
          <input
            name="venueName"
            className={fieldClassName()}
            required
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Tipo de negocio
          </span>
          <select
            name="businessType"
            className={fieldClassName()}
            defaultValue=""
            required
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            {businessTypes.map((businessType) => (
              <option key={businessType} value={businessType}>
                {businessType}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Ciudad o zona
          </span>
          <input name="area" className={fieldClassName()} required />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Dirección
          </span>
          <input name="address" className={fieldClassName()} required />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Nombre de la persona de contacto
          </span>
          <input name="contactName" className={fieldClassName()} required />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Teléfono de contacto
          </span>
          <input
            name="contactPhone"
            type="tel"
            className={fieldClassName()}
            required
          />
        </label>

        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Email de contacto
          </span>
          <input
            name="contactEmail"
            type="email"
            className={fieldClassName()}
            required
          />
        </label>

        <fieldset className="grid gap-3 md:col-span-2">
          <legend className="text-sm font-medium text-[color:var(--foreground)]">
            Tipo de servicio
          </legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {serviceOptions.map((serviceOption) => (
              <label
                key={serviceOption.value}
                className="flex items-center gap-3 rounded-[1.1rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)]"
              >
                <input
                  type="radio"
                  name="serviceType"
                  value={serviceOption.value}
                  className="h-4 w-4 accent-[color:var(--brand)]"
                  required
                />
                <span>{serviceOption.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Teléfono del local
          </span>
          <input name="venuePhone" type="tel" className={fieldClassName()} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Email del local
          </span>
          <input name="venueEmail" type="email" className={fieldClassName()} />
        </label>

        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Web o Instagram
          </span>
          <input name="website" className={fieldClassName()} />
        </label>

        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Mensaje adicional
          </span>
          <textarea
            name="message"
            rows={5}
            className={fieldClassName()}
            placeholder="Cuéntanos brevemente qué tipo de local tienes y cómo encaja ZylenPick."
          />
        </label>

        <label className="flex items-start gap-3 rounded-[1.1rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4 md:col-span-2">
          <input
            type="checkbox"
            name="privacyAccepted"
            className="mt-1 h-4 w-4 accent-[color:var(--brand)]"
            required
          />
          <span className="text-sm leading-6 text-[color:var(--muted-strong)]">
            Acepto la política de privacidad y autorizo a ZylenPick a ponerse en
            contacto conmigo sobre esta solicitud.
          </span>
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-[color:var(--muted)]">
          Primero revisamos tu solicitud y, si encaja, daremos de alta el local
          manualmente desde nuestro panel interno.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)] transition hover:bg-[color:var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Enviando solicitud..." : "Enviar solicitud"}
        </button>
      </div>

      {feedback ? (
        <p
          className={`mt-4 rounded-[1rem] border px-4 py-3 text-sm leading-6 ${
            feedbackType === "success"
              ? "border-[color:var(--border)] bg-[color:var(--surface-dark)] text-[color:var(--muted-strong)]"
              : "border-[#E5484D]/35 bg-[#E5484D]/10 text-white"
          }`}
        >
          {feedback}
        </p>
      ) : null}
    </form>
  );
}
