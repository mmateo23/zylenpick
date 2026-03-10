import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import type { Database } from "@/types/database";

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
  message: string;
  privacyAccepted: boolean;
};

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

function normalizePayload(payload: JoinRequestPayload): JoinRequestPayload {
  return {
    venueName: String(payload.venueName ?? "").trim(),
    businessType: String(payload.businessType ?? "").trim(),
    area: String(payload.area ?? "").trim(),
    address: String(payload.address ?? "").trim(),
    venuePhone: String(payload.venuePhone ?? "").trim(),
    venueEmail: String(payload.venueEmail ?? "").trim(),
    website: String(payload.website ?? "").trim(),
    contactName: String(payload.contactName ?? "").trim(),
    contactPhone: String(payload.contactPhone ?? "").trim(),
    contactEmail: String(payload.contactEmail ?? "").trim(),
    serviceType: String(payload.serviceType ?? "").trim(),
    message: String(payload.message ?? "").trim(),
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
  if (!payload.serviceType) {
    return "El tipo de servicio es obligatorio.";
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
    ["Mensaje adicional", payload.message || "Sin mensaje adicional"],
    ["Privacidad aceptada", payload.privacyAccepted ? "Sí" : "No"],
  ];

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.6;">
      <h1 style="margin-bottom: 16px;">Nueva solicitud para unirse a ZylenPick</h1>
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${rows
            .map(
              ([label, value]) => `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600; width: 220px;">${label}</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${value}</td>
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
    "Nueva solicitud para unirse a ZylenPick",
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
    `Mensaje adicional: ${payload.message || "Sin mensaje adicional"}`,
    `Privacidad aceptada: ${payload.privacyAccepted ? "Sí" : "No"}`,
  ].join("\n");
}

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const joinRequestToEmail = process.env.JOIN_REQUEST_TO_EMAIL;
  const joinRequestFromEmail =
    process.env.JOIN_REQUEST_FROM_EMAIL ?? "ZylenPick <onboarding@resend.dev>";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !resendApiKey ||
    !joinRequestToEmail ||
    !supabaseUrl ||
    !supabaseAnonKey
  ) {
    return NextResponse.json(
      {
        message:
          "Falta configurar el envío de solicitudes en el servidor. Revisa las variables de entorno.",
      },
      { status: 500 },
    );
  }

  const payload = normalizePayload((await request.json()) as JoinRequestPayload);
  const validationError = validatePayload(payload);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

  const { error: insertError } = await supabase.from("join_requests").insert({
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
    message: payload.message || null,
    privacy_accepted: payload.privacyAccepted,
    status: "pending",
  });

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
  });

  if (!resendResponse.ok) {
    const resendError = await resendResponse.text();

    return NextResponse.json(
      {
        message:
          "No hemos podido enviar la solicitud por correo. Revisa la configuración del servicio de email.",
        detail: resendError,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message:
      "Solicitud enviada correctamente. Revisaremos tus datos y te contactaremos pronto.",
  });
}
