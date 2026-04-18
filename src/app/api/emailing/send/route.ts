import { NextResponse } from "next/server";

import {
  buildEmailingHtml,
  type EmailingDocument,
} from "@/features/emailing/template";

type Payload = {
  to: string;
  subject: string;
  document: EmailingDocument;
};

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.EMAILING_FROM_EMAIL ??
    process.env.JOIN_REQUEST_FROM_EMAIL ??
    "FknFood <onboarding@resend.dev>";

  if (!resendApiKey) {
    return NextResponse.json(
      { message: "Falta RESEND_API_KEY para enviar emails." },
      { status: 500 },
    );
  }

  const payload = (await request.json()) as Payload;

  if (!payload.to?.trim()) {
    return NextResponse.json(
      { message: "El destinatario es obligatorio." },
      { status: 400 },
    );
  }

  if (!payload.subject?.trim()) {
    return NextResponse.json(
      { message: "El asunto es obligatorio." },
      { status: 400 },
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [payload.to],
      subject: payload.subject,
      html: buildEmailingHtml(payload.document),
      reply_to: payload.document.replyTo || undefined,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();

    return NextResponse.json(
      {
        message: "Resend ha rechazado el envío.",
        detail,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: `Email enviado a ${payload.to}.`,
  });
}
