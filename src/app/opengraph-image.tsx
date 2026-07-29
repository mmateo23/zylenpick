/* eslint-disable @next/next/no-img-element -- ImageResponse requires a plain image element. */
import { ImageResponse } from "next/og";

import { getSiteUrl } from "@/lib/seo";

export const runtime = "edge";
export const alt = "Pickyalo: descubre productos y platos de locales cercanos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const logoUrl = new URL(
    "/icons/pickyalo-icon-512.png",
    getSiteUrl(),
  ).toString();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#FDE3AD",
          color: "#741314",
          padding: "64px 70px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            right: -90,
            top: -180,
            borderRadius: 999,
            background: "rgba(116,19,20,0.07)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 390,
            height: 390,
            left: -180,
            bottom: -245,
            borderRadius: 999,
            background: "rgba(227,89,55,0.12)",
          }}
        />
        <div
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: "5px",
                textTransform: "uppercase",
              }}
            >
              Pickyalo
            </div>
            <div
              style={{
                display: "flex",
                border: "2px solid rgba(116,19,20,0.25)",
                borderRadius: 999,
                padding: "12px 20px",
                fontSize: 19,
                fontWeight: 700,
              }}
            >
              Descubre · Elige · Recoge
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 50,
            }}
          >
            <div
              style={{
                display: "flex",
                maxWidth: 735,
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  fontSize: 74,
                  fontWeight: 800,
                  lineHeight: 0.96,
                  letterSpacing: "-4px",
                }}
              >
                <div style={{ display: "flex" }}>Lo bueno de cerca,</div>
                <div style={{ display: "flex" }}>listo para recoger.</div>
              </div>
              <div
                style={{
                  marginTop: 26,
                  maxWidth: 690,
                  fontSize: 25,
                  lineHeight: 1.3,
                  color: "rgba(56,25,50,0.76)",
                }}
              >
                Una selección visual de productos y platos de locales cercanos.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                width: 270,
                height: 270,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 58,
                overflow: "hidden",
                boxShadow: "0 28px 68px rgba(116,19,20,0.24)",
                transform: "rotate(2deg)",
              }}
            >
              <img
                alt="Pickyalo"
                src={logoUrl}
                width="270"
                height="270"
                style={{
                  display: "flex",
                  width: "270px",
                  height: "270px",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
