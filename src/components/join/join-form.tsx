"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

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
  return "w-full rounded-[1rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)]/78 px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)] focus:bg-[color:var(--surface-strong)]/92 focus:shadow-[0_0_0_4px_rgba(0,223,129,0.06)]";
}

function sectionTitleClassName() {
  return "text-[11px] font-medium uppercase tracking-[0.24em] text-[color:var(--brand)]";
}

function keepOnlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function JoinForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(
    null,
  );
  const rootRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(
        [
          "[data-join-head]",
          "[data-join-section]",
          "[data-join-footer]",
          "[data-join-feedback]",
        ],
        {
          y: 18,
          autoAlpha: 0,
        },
      );

      gsap.to("[data-join-glow]", {
        y: -8,
        x: 6,
        duration: 8.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to("[data-join-head]", {
        y: 0,
        autoAlpha: 1,
        duration: 0.72,
      })
        .to(
          "[data-join-section]",
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.62,
            stagger: 0.08,
          },
          "-=0.36",
        )
        .to(
          "[data-join-footer]",
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.58,
          },
          "-=0.28",
        );
    }, root);

    return () => {
      ctx.revert();
    };
  }, []);

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
      ref={rootRef}
      onSubmit={handleSubmit}
      className="spotlight-panel relative overflow-hidden rounded-[2.1rem] border border-[color:var(--border)] bg-[color:var(--surface)]/76 p-6 shadow-[var(--shadow)] backdrop-blur-md sm:p-8"
    >
      <div
        data-join-glow
        className="pointer-events-none absolute right-[-10%] top-[-12%] h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(124,255,184,0.14),transparent_68%)] blur-3xl"
      />

      <div data-join-head className="relative z-[1]">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-[color:var(--muted-strong)]">
          <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--brand)]" />
          Solicitud para nuevos locales
        </div>

        <h2 className="mt-5 max-w-[14ch] text-balance text-3xl font-semibold leading-[0.95] tracking-[-0.05em] text-[color:var(--foreground)] sm:text-[2.55rem]">
          Déjanos tus datos y vemos cómo ayudarte.
        </h2>

        <p className="mt-4 max-w-[52ch] text-sm leading-7 text-[color:var(--muted)] sm:text-[0.96rem]">
          Solo necesitamos lo básico para revisar tu local y explicarte el
          siguiente paso con calma.
        </p>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-[color:var(--muted-strong)]">
            Recogida
          </span>
          <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-[color:var(--muted-strong)]">
            Te guiamos
          </span>
          <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-[color:var(--muted-strong)]">
            Sin líos técnicos
          </span>
        </div>
      </div>

      <div className="relative z-[1] mt-8 space-y-5">
        <section
          data-join-section
          className="rounded-[1.45rem] border border-[color:var(--border)] bg-[color:var(--surface-dark)]/28 p-5"
        >
          <p className={sectionTitleClassName()}>Local</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-[color:var(--foreground)]">
                Nombre del local
              </span>
              <input name="venueName" className={fieldClassName()} required />
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
                Teléfono del local
              </span>
              <input
                name="venuePhone"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="tel"
                className={fieldClassName()}
                onInput={(event) => {
                  event.currentTarget.value = keepOnlyDigits(
                    event.currentTarget.value,
                  );
                }}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-[color:var(--foreground)]">
                Email del local
              </span>
              <input
                name="venueEmail"
                type="email"
                className={fieldClassName()}
              />
            </label>

            <label className="grid gap-2 md:col-span-2">
              <span className="text-sm font-medium text-[color:var(--foreground)]">
                Web o Instagram
              </span>
              <input name="website" className={fieldClassName()} />
            </label>
          </div>
        </section>

        <section
          data-join-section
          className="rounded-[1.45rem] border border-[color:var(--border)] bg-[color:var(--surface-dark)]/28 p-5"
        >
          <p className={sectionTitleClassName()}>Contacto y servicio</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-[color:var(--foreground)]">
                Nombre de la persona de contacto
              </span>
              <input
                name="contactName"
                className={fieldClassName()}
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-[color:var(--foreground)]">
                Teléfono de contacto
              </span>
              <input
                name="contactPhone"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="tel"
                className={fieldClassName()}
                onInput={(event) => {
                  event.currentTarget.value = keepOnlyDigits(
                    event.currentTarget.value,
                  );
                }}
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
                    className="flex items-center gap-3 rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)]/88 px-4 py-3 text-sm text-[color:var(--foreground)] transition-[border-color,background-color] duration-200 hover:border-[color:var(--brand)]/40 hover:bg-[color:var(--surface-strong)]"
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
          </div>
        </section>

        <section
          data-join-section
          className="rounded-[1.45rem] border border-[color:var(--border)] bg-[color:var(--surface-dark)]/28 p-5"
        >
          <p className={sectionTitleClassName()}>Contexto adicional</p>
          <div className="mt-5 grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-[color:var(--foreground)]">
                Mensaje adicional
              </span>
              <textarea
                name="message"
                rows={5}
                className={fieldClassName()}
                placeholder="Cuéntanos qué vendes mejor, qué zona cubres o qué quieres mejorar."
              />
            </label>

            <label className="flex items-start gap-3 rounded-[1rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)]/72 px-4 py-4">
              <input
                type="checkbox"
                name="privacyAccepted"
                className="mt-1 h-4 w-4 accent-[color:var(--brand)]"
                required
              />
              <span className="text-sm leading-6 text-[color:var(--muted-strong)]">
                Acepto la política de privacidad y autorizo a ZylenPick a
                ponerse en contacto conmigo sobre esta solicitud.
              </span>
            </label>
          </div>
        </section>
      </div>

      <div
        data-join-footer
        className="relative z-[1] mt-6 flex flex-col gap-4 border-t border-white/8 pt-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="max-w-[40ch] text-sm leading-6 text-[color:var(--muted)]">
          Revisamos cada solicitud personalmente. Si encaja, te ayudamos a dejar
          la ficha lista para empezar a recibir pedidos.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="magnetic-button inline-flex justify-center rounded-full border border-[color:var(--brand)]/24 bg-[linear-gradient(135deg,rgba(124,255,184,0.1),rgba(0,223,129,0.9))] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,223,129,0.16)] transition disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[12rem]"
        >
          {isSubmitting ? "Enviando solicitud..." : "Quiero que me contactéis"}
        </button>
      </div>

      {feedback ? (
        <p
          data-join-feedback
          className={`relative z-[1] mt-4 rounded-[1rem] border px-4 py-3 text-sm leading-6 ${
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
