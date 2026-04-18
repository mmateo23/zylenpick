export type EmailingItem = {
  id: string;
  label: string;
  title: string;
  text: string;
  meta: string;
};

export type EmailingTheme = {
  id: string;
  label: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  buttonText: string;
};

export type EmailingDocument = {
  brand: string;
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  highlightLabel: string;
  highlightValue: string;
  sectionTitle: string;
  sectionText: string;
  ctaLabel: string;
  ctaUrl: string;
  footer: string;
  replyTo: string;
  themeId: string;
  items: EmailingItem[];
};

export const emailingThemes: EmailingTheme[] = [
  {
    id: "sand",
    label: "Sand",
    accent: "#d96b33",
    bg: "#efe6dc",
    surface: "#fffaf4",
    text: "#181614",
    muted: "#6a615a",
    border: "#dfd3c7",
    buttonText: "#fffaf4",
  },
  {
    id: "forest",
    label: "Forest",
    accent: "#3d7a57",
    bg: "#e9efe8",
    surface: "#fbfdf8",
    text: "#141814",
    muted: "#5f6a60",
    border: "#d1dbd2",
    buttonText: "#fbfdf8",
  },
  {
    id: "night",
    label: "Night",
    accent: "#63c7ef",
    bg: "#0d1318",
    surface: "#121c22",
    text: "#edf3f7",
    muted: "#8da0aa",
    border: "#24343f",
    buttonText: "#081015",
  },
];

export const emailingPresets: Array<{
  id: string;
  label: string;
  document: EmailingDocument;
}> = [
  {
    id: "base-1",
    label: "Campaña simple",
    document: {
      brand: "FknFood",
      preheader: "Tres platos listos para activar hoy.",
      eyebrow: "Edición semanal",
      title: "Activa hoy el emailing del mediodía.",
      intro:
        "Una estructura simple para editar rápido sin tocar el layout del correo.",
      highlightLabel: "Momento",
      highlightValue: "Hoy · 12:30",
      sectionTitle: "Selección del día",
      sectionText: "Tres bloques claros para que el usuario entienda qué pedir y por qué hacerlo ahora.",
      ctaLabel: "Pedir ahora",
      ctaUrl: "https://zylenpick.com",
      footer: "Has recibido este email porque formas parte de la base activa.",
      replyTo: "",
      themeId: "sand",
      items: [
        {
          id: "1",
          label: "Top ventas",
          title: "Burger smash + bebida",
          text: "Una opción directa, fácil de decidir y buena para conversión rápida.",
          meta: "Desde 11,90 EUR",
        },
        {
          id: "2",
          label: "Novedad",
          title: "Birria tacos listos",
          text: "Perfecto para refrescar la campaña con algo nuevo y visual.",
          meta: "Solo hoy",
        },
        {
          id: "3",
          label: "Oficina",
          title: "Bowls para equipo",
          text: "Una línea útil para pedidos de grupo o ticket medio más alto.",
          meta: "Entrega agrupada",
        },
      ],
    },
  },
];

export function cloneEmailingDocument(document: EmailingDocument): EmailingDocument {
  return {
    ...document,
    items: document.items.map((item) => ({ ...item })),
  };
}

export function getEmailingTheme(themeId: string) {
  return emailingThemes.find((item) => item.id === themeId) ?? emailingThemes[0];
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildEmailingHtml(document: EmailingDocument) {
  const theme = getEmailingTheme(document.themeId);

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(document.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${theme.bg};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      ${escapeHtml(document.preheader)}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:${theme.bg};width:100%;">
      <tr>
        <td align="center" style="padding:32px 12px;">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:640px;">
            <tr>
              <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:2px;text-transform:uppercase;color:${theme.muted};padding:0 0 16px;">
                ${escapeHtml(document.brand)}
              </td>
            </tr>
            <tr>
              <td style="background:${theme.surface};border:1px solid ${theme.border};padding:32px 28px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:2px;text-transform:uppercase;color:${theme.accent};">
                  ${escapeHtml(document.eyebrow)}
                </div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:40px;line-height:44px;font-weight:700;color:${theme.text};padding-top:12px;">
                  ${escapeHtml(document.title)}
                </div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:${theme.muted};padding-top:14px;">
                  ${escapeHtml(document.intro)}
                </div>
                <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:22px;background:${theme.bg};">
                  <tr>
                    <td style="padding:12px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:1.4px;text-transform:uppercase;color:${theme.muted};">
                      ${escapeHtml(document.highlightLabel)}
                    </td>
                    <td style="padding:12px 14px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;font-weight:700;color:${theme.text};">
                      ${escapeHtml(document.highlightValue)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:2px;text-transform:uppercase;color:${theme.muted};">
                ${escapeHtml(document.sectionTitle)}
              </td>
            </tr>
            <tr>
              <td style="padding:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:${theme.muted};">
                ${escapeHtml(document.sectionText)}
              </td>
            </tr>
            ${document.items
              .map(
                (item) => `
                  <tr>
                    <td style="padding-bottom:16px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:${theme.surface};border:1px solid ${theme.border};">
                        <tr>
                          <td style="padding:22px 24px 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:1.6px;text-transform:uppercase;color:${theme.accent};">
                            ${escapeHtml(item.label)}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 24px 8px;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:32px;font-weight:700;color:${theme.text};">
                            ${escapeHtml(item.title)}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 24px 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:${theme.muted};">
                            ${escapeHtml(item.text)}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 24px 24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:${theme.text};">
                            ${escapeHtml(item.meta)}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                `,
              )
              .join("")}
            <tr>
              <td style="padding:10px 0 30px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td bgcolor="${theme.accent}" style="border-radius:999px;">
                      <a href="${escapeHtml(document.ctaUrl)}" style="display:inline-block;padding:16px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:18px;font-weight:700;color:${theme.buttonText};text-decoration:none;">
                        ${escapeHtml(document.ctaLabel)}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:${theme.muted};padding-bottom:10px;">
                ${escapeHtml(document.footer)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
