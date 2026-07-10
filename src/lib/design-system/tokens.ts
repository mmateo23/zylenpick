export const pickyaloDesignTokens = {
  color: {
    bg: {
      page: "#FDE3AD",
      pageAlt: "#F6D99A",
      surface: "rgba(255, 247, 232, 0.86)",
      surfaceStrong: "#FFF7E8",
    },
    text: {
      primary: "#24110E",
      secondary: "rgba(36, 17, 14, 0.68)",
      muted: "rgba(36, 17, 14, 0.46)",
    },
    brand: {
      primary: "#741314",
      cream: "#FDE3AD",
      primarySoft: "rgba(116, 19, 20, 0.10)",
    },
    border: {
      subtle: "rgba(116, 19, 20, 0.16)",
      strong: "rgba(116, 19, 20, 0.28)",
    },
    cta: {
      primaryBg: "#741314",
      primaryText: "#FDE3AD",
      primaryHover: "#5F0F10",
    },
    focus: {
      ring: "#741314",
    },
    selection: {
      bg: "rgba(116, 19, 20, 0.10)",
    },
    status: {
      danger: "#e5484d",
      warning: "#d6a648",
    },
  },
  radius: {
    sm: "12px",
    md: "18px",
    lg: "24px",
    xl: "32px",
    full: "999px",
  },
  shadow: {
    soft: "0 18px 60px rgba(116, 19, 20, 0.12)",
  },
  space: {
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
  },
} as const;

export type PickyaloDesignTokens = typeof pickyaloDesignTokens;
export type PickyaloColorTokens = PickyaloDesignTokens["color"];
export type PickyaloRadiusTokens = PickyaloDesignTokens["radius"];
export type PickyaloShadowTokens = PickyaloDesignTokens["shadow"];
export type PickyaloSpaceTokens = PickyaloDesignTokens["space"];
