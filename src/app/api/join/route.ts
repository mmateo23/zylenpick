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
    venueName: payload.venueName || "Solicitud de prueba desde /unete",
    businessType: payload.businessType || "No indicado",
    area: payload.area || "No indicado",
    address: payload.address || "No indicada",
    venuePhone: payload.venuePhone || "No indicado",
    venueEmail: payload.venueEmail || "no-indicado@zylenpick.test",
    website: payload.website || "",
    contactName: payload.contactName || "No indicado",
    contactPhone: payload.contactPhone || "No indicado",
    contactEmail: payload.contactEmail || "no-indicado@zylenpick.test",
    serviceType: payload.serviceType || "No indicado",
    message: payload.message || "",
    privacyAccepted: payload.privacyAccepted,
  };
}

function buildEmailHtml(payload: JoinRequestPayload) {
  const rows = [
    ["Nombre del local", payload.venueName],
    ["Tipo de negocio", payload.businessType],
    ["Ciudad o zona", payload.area],
    ["Dirección", payload.address],
    ["Teléfono del local", payload.venuePhone],
    ["Email del local", payload.venueEmail],
    ["Web o Instagram", payload.website || "No indicado"],
    ["Persona de contacto", payload.contactName],
    ["Teléfono de contacto", payload.contactPhone],
    ["Email de contacto", payload.contactEmail],
    ["Tipo de servicio", getServiceLabel(payload.serviceType)],
    ["Mensaje adicional", payload.message || "No indicado"],
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
    `Teléfono del local: ${payload.venuePhone}`,
    `Email del local: ${payload.venueEmail}`,
    `Web o Instagram: ${payload.website || "No indicado"}`,
    `Persona de contacto: ${payload.contactName}`,
    `Teléfono de contacto: ${payload.contactPhone}`,
    `Email de contacto: ${payload.contactEmail}`,
    `Tipo de servicio: ${getServiceLabel(payload.serviceType)}`,
    `Mensaje adicional: ${payload.message || "No indicado"}`,
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
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

  const { error: insertError } = await supabase.from("join_requests").insert({
    venue_name: payload.venueName,
    business_type: payload.businessType,
    area: payload.area,
    address: payload.address,
    venue_phone: payload.venuePhone,
    venue_email: payload.venueEmail,
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

  // Punto central de notificación para poder añadir Telegram más adelante.
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
