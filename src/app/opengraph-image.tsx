import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Pickyalo: descubre productos y platos de locales cercanos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          padding: "68px 74px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 430,
            height: 430,
            right: -80,
            top: -95,
            borderRadius: 999,
            background: "rgba(116,19,20,0.08)",
          }}
        />
        <div
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "column",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 54, fontWeight: 800, letterSpacing: "-3px" }}>Pickyalo</div>
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
              Local · Visual · Para recoger
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ display: "flex", maxWidth: 780, flexDirection: "column" }}>
              <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 0.95, letterSpacing: "-5px" }}>
                Descubre cerca.<br />Recoge fácil.
              </div>
              <div style={{ marginTop: 28, maxWidth: 720, fontSize: 26, lineHeight: 1.3, color: "rgba(36,17,14,0.72)" }}>
                Productos y platos de locales cercanos, elegidos de un vistazo.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                width: 188,
                height: 210,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 38,
                background: "#741314",
                color: "#FFF7E8",
                fontSize: 92,
                fontWeight: 800,
                transform: "rotate(3deg)",
              }}
            >
              P
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
