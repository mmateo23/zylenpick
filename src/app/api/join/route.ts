import { NextResponse } from "next/server";

import {
  getJoinInterestLabel,
  isJoinInterest,
  type JoinInterest,
} from "@/features/join/join-interest";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type JoinRequestPayload = {
  venueName: string;
  businessType: string;
  area: string;
  address: string;
  venuePhone: string;
  venueEmail: string;
  website: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  serviceType: string;
  interest: JoinInterest | null;
  message: string;
  privacyAccepted: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SERVICE_TYPES = new Set(["pickup", "delivery", "both"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getServiceLabel(serviceType: string) {
  switch (serviceType) {
    case "pickup":
      return "Recogida";
    case "delivery":
      return "Domicilio";
    case "both":
      return "Ambos";
    default:
      return serviceType;
  }
}

function normalizePayload(value: unknown): JoinRequestPayload {
  const payload = isRecord(value) ? value : {};

  return {
    venueName: normalizeString(payload.venueName),
    businessType: normalizeString(payload.businessType),
    area: normalizeString(payload.area),
    address: normalizeString(payload.address),
    venuePhone: normalizeString(payload.venuePhone),
    venueEmail: normalizeString(payload.venueEmail),
    website: normalizeString(payload.website),
    contactName: normalizeString(payload.contactName),
    contactPhone: normalizeString(payload.contactPhone),
    contactEmail: normalizeString(payload.contactEmail),
    serviceType: normalizeString(payload.serviceType),
    interest: isJoinInterest(payload.interest) ? payload.interest : null,
    message: normalizeString(payload.message),
    privacyAccepted: Boolean(payload.privacyAccepted),
  };
}

function validatePayload(payload: JoinRequestPayload) {
  if (!payload.venueName) {
    return "El nombre del local es obligatorio.";
  }
  if (!payload.businessType) {
    return "El tipo de negocio es obligatorio.";
  }
  if (!payload.area) {
    return "La ciudad o zona es obligatoria.";
  }
  if (!payload.address) {
    return "La dirección es obligatoria.";
  }
  if (!payload.contactName) {
    return "La persona de contacto es obligatoria.";
  }
  if (!payload.contactPhone) {
    return "El teléfono de contacto es obligatorio.";
  }
  if (!payload.contactEmail) {
    return "El email de contacto es obligatorio.";
  }
  if (!EMAIL_PATTERN.test(payload.contactEmail)) {
    return "Introduce un email de contacto válido.";
  }
  if (payload.venueEmail && !EMAIL_PATTERN.test(payload.venueEmail)) {
    return "Introduce un email válido para el local.";
  }
  if (!ALLOWED_SERVICE_TYPES.has(payload.serviceType)) {
    return "El tipo de servicio es obligatorio.";
  }
  if (!payload.interest) {
    return "Elige cómo quieres que Pickyalo ayude a tu local.";
  }
  if (!payload.privacyAccepted) {
    return "Debes aceptar la política de privacidad para enviar la solicitud.";
  }

  return null;
}

function buildEmailHtml(payload: JoinRequestPayload) {
  const rows = [
    ["Nombre del local", payload.venueName],
    ["Tipo de negocio", payload.businessType],
    ["Ciudad o zona", payload.area],
    ["Dirección", payload.address],
    ["Teléfono del local", payload.venuePhone || "No facilitado"],
    ["Email del local", payload.venueEmail || "No facilitado"],
    ["Web o Instagram", payload.website || "No facilitado"],
    ["Persona de contacto", payload.contactName],
    ["Teléfono de contacto", payload.contactPhone],
    ["Email de contacto", payload.contactEmail],
    ["Tipo de servicio", getServiceLabel(payload.serviceType)],
    ["Interés", getJoinInterestLabel(payload.interest)],
    ["Mensaje adicional", payload.message || "Sin mensaje adicional"],
    ["Privacidad aceptada", payload.privacyAccepted ? "Sí" : "No"],
  ];

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.6;">
      <h1 style="margin-bottom: 16px;">Nueva solicitud para unirse a Pickyalo</h1>
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${rows
            .map(
              ([label, value]) => `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600; width: 220px;">${escapeHtml(label)}</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${escapeHtml(value)}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function buildEmailText(payload: JoinRequestPayload) {
  return [
    "Nueva solicitud para unirse a Pickyalo",
    "",
    `Nombre del local: ${payload.venueName}`,
    `Tipo de negocio: ${payload.businessType}`,
    `Ciudad o zona: ${payload.area}`,
    `Dirección: ${payload.address}`,
    `Teléfono del local: ${payload.venuePhone || "No facilitado"}`,
    `Email del local: ${payload.venueEmail || "No facilitado"}`,
    `Web o Instagram: ${payload.website || "No facilitado"}`,
    `Persona de contacto: ${payload.contactName}`,
    `Teléfono de contacto: ${payload.contactPhone}`,
    `Email de contacto: ${payload.contactEmail}`,
    `Tipo de servicio: ${getServiceLabel(payload.serviceType)}`,
    `Interés: ${getJoinInterestLabel(payload.interest)}`,
    `Mensaje adicional: ${payload.message || "Sin mensaje adicional"}`,
    `Privacidad aceptada: ${payload.privacyAccepted ? "Sí" : "No"}`,
  ].join("\n");
}

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const joinRequestToEmail = process.env.JOIN_REQUEST_TO_EMAIL;
  const joinRequestFromEmail =
    process.env.JOIN_REQUEST_FROM_EMAIL ?? "Pickyalo <onboarding@resend.dev>";

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      {
        message:
          "Falta configurar el almacenamiento de solicitudes en el servidor.",
      },
      { status: 500 },
    );
  }

  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json(
      { message: "La solicitud enviada no tiene un formato válido." },
      { status: 400 },
    );
  }

  const payload = normalizePayload(requestBody);
  const validationError = validatePayload(payload);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: savedRequest, error: insertError } = await supabase
    .from("join_requests")
    .insert({
      venue_name: payload.venueName,
      business_type: payload.businessType,
      area: payload.area,
      address: payload.address,
      venue_phone: payload.venuePhone || null,
      venue_email: payload.venueEmail || null,
      website: payload.website || null,
      contact_name: payload.contactName,
      contact_phone: payload.contactPhone,
      contact_email: payload.contactEmail,
      service_type: payload.serviceType,
      interest: payload.interest,
      message: payload.message || null,
      privacy_accepted: payload.privacyAccepted,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json(
      {
        message:
          "No hemos podido guardar la solicitud. Revisa la configuración de Supabase.",
        detail: insertError.message,
      },
      { status: 502 },
    );
  }

  if (resendApiKey && joinRequestToEmail) {
    try {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: joinRequestFromEmail,
          to: [joinRequestToEmail],
          subject: `Nueva solicitud de local: ${payload.venueName}`,
          html: buildEmailHtml(payload),
          text: buildEmailText(payload),
          reply_to: payload.contactEmail,
        }),
        signal: AbortSignal.timeout(8_000),
      });

      if (!resendResponse.ok) {
        console.error("Join request notification failed", {
          requestId: savedRequest.id,
          status: resendResponse.status,
        });
      }
    } catch (error) {
      console.error("Join request notification failed", {
        requestId: savedRequest.id,
        reason: error instanceof Error ? error.name : "unknown",
      });
    }
  } else {
    console.warn("Join request notification is not configured", {
      requestId: savedRequest.id,
    });
  }

  return NextResponse.json(
    {
      ok: true,
      message:
        "Solicitud enviada correctamente. Revisaremos tus datos y te contactaremos pronto.",
    },
    { status: 201 },
  );
}
