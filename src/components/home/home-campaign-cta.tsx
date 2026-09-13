import { ArrowUpRight, CalendarDays, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { BorderBeam } from "@/components/magicui/border-beam";
import type { HomeCampaignConfig } from "@/features/design/site-design-config";

type HomeCampaignCtaProps = {
  campaign: HomeCampaignConfig;
  compact?: boolean;
  feature?: boolean;
  featureAssetUrl?: string;
  preview?: boolean;
};

type HomeCampaignIconLinkProps = {
  campaign: HomeCampaignConfig;
};

const CONFETTI_PARTICLES = [
  [8, 1, 0.2, 7, -8],
  [17, 2, 1.7, 6, 7],
  [26, 0, 3.1, 8, -5],
  [36, 2, 0.9, 7, 9],
  [46, 1, 2.5, 6, -7],
  [57, 0, 1.2, 9, 6],
  [67, 2, 3.8, 7, -9],
  [76, 1, 0.5, 8, 8],
  [86, 0, 2.1, 6, -6],
  [94, 2, 3.4, 8, 5],
] as const;

function colorWithAlpha(color: string, alpha: number) {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color);
  if (!match) return color;
  const [, red, green, blue] = match;
  return `rgba(${parseInt(red, 16)}, ${parseInt(green, 16)}, ${parseInt(blue, 16)}, ${alpha})`;
}

function getSurfaceStyle(campaign: HomeCampaignConfig): CSSProperties {
  if (campaign.visualStyle === "glass") {
    return {
      backgroundColor: colorWithAlpha(campaign.backgroundColor, 0.78),
      borderColor: colorWithAlpha(campaign.borderColor, 0.72),
      color: campaign.textColor,
      boxShadow: `0 24px 65px ${colorWithAlpha(campaign.backgroundColor, 0.24)}, inset 0 1px 0 rgba(255,255,255,0.18)`,
    };
  }

  if (campaign.visualStyle === "outline") {
    return {
      backgroundColor: colorWithAlpha(campaign.backgroundColor, 0.1),
      borderColor: campaign.borderColor,
      color: campaign.textColor,
      boxShadow: `0 18px 45px ${colorWithAlpha(campaign.borderColor, 0.12)}`,
    };
  }

  return {
    backgroundColor: campaign.backgroundColor,
    borderColor: campaign.borderColor,
    color: campaign.textColor,
    boxShadow: `0 24px 65px ${colorWithAlpha(campaign.backgroundColor, 0.28)}`,
  };
}

function getIconMotionClass(campaign: HomeCampaignConfig) {
  return campaign.iconMotion === "float"
    ? "campaign-icon-float"
    : campaign.iconMotion === "pulse"
      ? "campaign-icon-pulse"
      : campaign.iconMotion === "rotate"
        ? "campaign-icon-rotate"
        : "";
}

export function CampaignIcon({ campaign, compact = false }: { campaign: HomeCampaignConfig; compact?: boolean }) {
  const iconMotionClass = getIconMotionClass(campaign);

  if (campaign.iconSvgUrl) {
    return (
      // SVG markup is never injected; it is loaded as an isolated image resource.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={campaign.iconSvgUrl}
        alt=""
        aria-hidden="true"
        className={`${compact ? "h-7 w-7" : "h-8 w-8"} object-contain ${iconMotionClass}`}
      />
    );
  }

  if (campaign.sponsored) {
    return (
      <Sparkles
        aria-hidden="true"
        className={`${compact ? "h-6 w-6" : "h-5 w-5"} ${iconMotionClass}`}
        strokeWidth={2}
      />
    );
  }

  return (
    <CalendarDays
      aria-hidden="true"
      className={`${compact ? "h-6 w-6" : "h-5 w-5"} ${iconMotionClass}`}
      strokeWidth={2}
    />
  );
}

function CampaignBackgroundMedia({ campaign }: { campaign: HomeCampaignConfig }) {
  if (
    campaign.backgroundMediaType === "none" ||
    !campaign.backgroundMediaUrl
  ) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
    >
      {campaign.backgroundMediaType === "video" ? (
        <video
          src={campaign.backgroundMediaUrl}
          className="h-full w-full object-cover"
          style={{ opacity: campaign.backgroundMediaOpacity / 100 }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        // The editor accepts arbitrary HTTPS and internal URLs, so this stays
        // independent from Next Image's deployment-time host allowlist.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={campaign.backgroundMediaUrl}
          alt=""
          className="h-full w-full object-cover"
          style={{ opacity: campaign.backgroundMediaOpacity / 100 }}
        />
      )}
      <span
        className="absolute inset-0"
        style={{
          backgroundColor: colorWithAlpha(
            campaign.backgroundColor,
            campaign.visualStyle === "glass" ? 0.58 : 0.7,
          ),
        }}
      />
      <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.2),transparent_72%)]" />
    </span>
  );
}

function CampaignFeatureMedia({ campaign }: { campaign: HomeCampaignConfig }) {
  if (
    campaign.backgroundMediaType === "none" ||
    !campaign.backgroundMediaUrl
  ) {
    return null;
  }

  const mediaClassName = "absolute inset-0 h-full w-full object-cover";
  const mediaStyle = { opacity: campaign.backgroundMediaOpacity / 100 };

  if (campaign.backgroundMediaType === "video") {
    return (
      <video
        src={campaign.backgroundMediaUrl}
        className={mediaClassName}
        style={mediaStyle}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    // The editor accepts arbitrary HTTPS and internal URLs.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={campaign.backgroundMediaUrl}
      alt=""
      className={mediaClassName}
      style={mediaStyle}
    />
  );
}

export function HomeCampaignIconLink({ campaign }: HomeCampaignIconLinkProps) {
  const baseSurfaceStyle = getSurfaceStyle(campaign);
  const surfaceStyle = campaign.beamEnabled
    ? {
        ...baseSurfaceStyle,
        boxShadow: `${baseSurfaceStyle.boxShadow}, 0 0 0 1px ${colorWithAlpha(campaign.accentColor, 0.48)}, 0 0 22px ${colorWithAlpha(campaign.accentColor, 0.24)}`,
      }
    : baseSurfaceStyle;
  const className =
    "group relative isolate inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border transition duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2 motion-reduce:transform-none";
  const content = (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 28% 20%, ${colorWithAlpha(campaign.accentColor, 0.3)}, transparent 48%)`,
        }}
      />
      {campaign.beamEnabled ? (
        <BorderBeam
          duration={7}
          size={180}
          borderWidth={2}
          colorFrom={campaign.accentColor}
          colorTo={campaign.textColor}
          glow
          className="motion-reduce:hidden"
        />
      ) : null}
      <span
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-[0.75rem] border"
        style={{
          borderColor: colorWithAlpha(campaign.accentColor, 0.36),
          backgroundColor: colorWithAlpha(campaign.accentColor, 0.13),
          color: campaign.accentColor,
        }}
      >
        <CampaignIcon campaign={campaign} compact />
      </span>
    </>
  );
  const label = `${campaign.ctaLabel}: ${campaign.title}`;

  if (/^https?:\/\//.test(campaign.href)) {
    return (
      <a
        href={campaign.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={surfaceStyle}
        aria-label={label}
        title={campaign.title}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={campaign.href}
      className={className}
      style={surfaceStyle}
      aria-label={label}
      title={campaign.title}
    >
      {content}
    </Link>
  );
}

function CampaignFeatureCta({
  campaign,
  featureAssetUrl,
  preview,
}: {
  campaign: HomeCampaignConfig;
  featureAssetUrl?: string;
  preview: boolean;
}) {
  const hasBackgroundMedia =
    campaign.backgroundMediaType !== "none" &&
    Boolean(campaign.backgroundMediaUrl);
  const className =
    "group relative isolate block min-h-[14rem] overflow-visible rounded-[1.65rem] border border-[#741314]/30 px-5 py-6 text-left text-[#24110E] shadow-[0_28px_72px_rgba(116,19,20,0.16)] transition duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-4 sm:min-h-[16rem] sm:rounded-[2rem] sm:px-9 sm:py-8 motion-reduce:transform-none";
  const content = (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 translate-x-2 translate-y-2 rounded-[inherit] border border-[#741314]/20 bg-[#F6D99A] sm:translate-x-3 sm:translate-y-3"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit] bg-[#FFF7E8]"
      >
        {hasBackgroundMedia ? <CampaignFeatureMedia campaign={campaign} /> : null}
        <span
          className="absolute inset-0"
          style={{
            background: hasBackgroundMedia
              ? "linear-gradient(90deg,rgba(255,247,232,0.98) 0%,rgba(255,247,232,0.94) 37%,rgba(255,247,232,0.62) 55%,rgba(255,247,232,0.08) 78%)"
              : `radial-gradient(circle at 78% 34%, ${colorWithAlpha(campaign.accentColor, 0.2)}, transparent 35%)`,
          }}
        />
        <span className="absolute -bottom-8 left-5 select-none font-black uppercase leading-none tracking-[0.08em] text-[#741314]/[0.035] text-[clamp(4rem,12vw,9rem)]">
          Ahora
        </span>
      </span>

      {campaign.beamEnabled ? (
        <BorderBeam
          duration={6}
          size={520}
          borderWidth={2.5}
          colorFrom={campaign.accentColor}
          colorTo={campaign.textColor}
          glow
          className="motion-reduce:hidden"
        />
      ) : null}

      <span className="relative z-20 grid max-w-[66%] content-between gap-5 sm:max-w-[58%] sm:gap-7">
        <span className="grid gap-2.5">
          <span
          className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.19em] sm:text-[10px]"
            style={{ color: campaign.borderColor || "#741314" }}
          >
            <CampaignIcon campaign={campaign} compact />
            {campaign.eyebrow || "Edición especial"}
          </span>
          <span className="block text-balance font-[var(--font-clash-grotesk-bold)] text-[clamp(1.75rem,5vw,3.45rem)] font-bold leading-[0.94] tracking-normal">
            {campaign.title}
          </span>
          {campaign.description ? (
            <span className="hidden max-w-[43ch] text-sm leading-5 opacity-75 sm:block">
              {campaign.description}
            </span>
          ) : null}
        </span>

        <span
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-extrabold"
          style={{
            borderColor: campaign.borderColor || "#741314",
            backgroundColor: campaign.backgroundColor || "#741314",
            color: campaign.textColor || "#FFF7E8",
          }}
        >
          {campaign.ctaLabel}
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" />
        </span>
      </span>

      {featureAssetUrl ? (
        <>
          <Image
            src={featureAssetUrl}
            alt=""
            aria-hidden="true"
            width={1600}
            height={1600}
            sizes="(max-width: 639px) 250px, 430px"
            className="pointer-events-none absolute -bottom-12 -right-16 z-10 h-auto w-[16.5rem] select-none object-contain drop-shadow-[-16px_26px_20px_rgba(36,17,14,0.3)] transition-transform duration-500 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:scale-[1.02] sm:-bottom-20 sm:right-[1%] sm:w-[27rem] motion-reduce:transform-none"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-5 right-2 z-0 h-12 w-[46%] rounded-full bg-[#24110E]/25 blur-2xl sm:right-[3%] sm:w-[40%]"
          />
        </>
      ) : null}
    </>
  );

  if (preview) {
    return (
      <div className={className}>{content}</div>
    );
  }

  if (/^https?:\/\//.test(campaign.href)) {
    return (
      <a
        href={campaign.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={campaign.href}
      className={className}
    >
      {content}
    </Link>
  );
}

export function HomeCampaignCta({
  campaign,
  compact = false,
  feature = false,
  featureAssetUrl,
  preview = false,
}: HomeCampaignCtaProps) {
  if (feature) {
    return (
      <CampaignFeatureCta
        campaign={campaign}
        featureAssetUrl={featureAssetUrl}
        preview={preview}
      />
    );
  }

  const content = (
    <>
      {!compact ? <CampaignBackgroundMedia campaign={campaign} /> : null}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-90"
        style={{
          background:
            campaign.visualStyle === "spotlight"
              ? `radial-gradient(circle at 14% 0%, ${colorWithAlpha(campaign.accentColor, 0.34)}, transparent 42%), linear-gradient(120deg, transparent, rgba(255,255,255,0.1), transparent 68%)`
              : `radial-gradient(circle at 14% 0%, ${colorWithAlpha(campaign.accentColor, 0.18)}, transparent 38%), linear-gradient(120deg, transparent, rgba(255,255,255,0.07), transparent 68%)`,
        }}
      />
      {campaign.confettiEnabled && !compact ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
          {CONFETTI_PARTICLES.map(([left, colorIndex, delay, duration, drift], index) => {
            const colors = [campaign.accentColor, campaign.textColor, campaign.borderColor];
            return (
              <span
                key={`${left}-${index}`}
                className="campaign-confetti-particle absolute top-[-18%] block"
                style={{
                  "--confetti-left": `${left}%`,
                  "--confetti-delay": `${delay}s`,
                  "--confetti-duration": `${duration}s`,
                  "--confetti-drift": `${drift}px`,
                  "--confetti-rotation": `${index % 2 === 0 ? 150 : -170}deg`,
                  backgroundColor: colors[colorIndex],
                } as CSSProperties}
              />
            );
          })}
        </div>
      ) : null}
      {campaign.beamEnabled ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[1px] rounded-[inherit] border"
            style={{
              borderColor: colorWithAlpha(campaign.accentColor, 0.34),
              boxShadow: `inset 0 0 18px ${colorWithAlpha(campaign.accentColor, 0.15)}`,
            }}
          />
          <BorderBeam
            duration={compact ? 8 : 6}
            size={400}
            borderWidth={compact ? 1.7 : 2.5}
            colorFrom={campaign.accentColor}
            colorTo={campaign.textColor}
            glow
            className="motion-reduce:hidden"
          />
          {!compact ? (
            <BorderBeam
              duration={6}
              delay={-3}
              size={400}
              borderWidth={2}
              initialOffset={180}
              colorFrom={campaign.textColor}
              colorTo={campaign.accentColor}
              glow
              className="opacity-90 motion-reduce:hidden"
            />
          ) : null}
        </>
      ) : null}

      <span
        className={`relative flex shrink-0 items-center justify-center overflow-hidden border transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105 motion-reduce:transform-none ${compact ? "h-10 w-10 rounded-[0.8rem]" : "h-12 w-12 rounded-[0.95rem]"}`}
        style={{
          borderColor: colorWithAlpha(campaign.accentColor, 0.34),
          backgroundColor: colorWithAlpha(campaign.accentColor, 0.12),
          color: campaign.accentColor,
        }}
      >
        <CampaignIcon campaign={campaign} />
      </span>

      <span className="relative min-w-0 flex-1 text-left">
        <span
          className={`flex flex-wrap items-center gap-2 font-bold uppercase opacity-75 ${compact ? "text-[9px] tracking-[0.14em]" : "text-[10px] tracking-[0.18em]"}`}
          style={{ color: campaign.accentColor }}
        >
          {campaign.eyebrow || "Edición especial"}
          {campaign.sponsored ? (
            <span
              className="rounded-full border px-2 py-0.5 tracking-[0.12em]"
              style={{ borderColor: colorWithAlpha(campaign.accentColor, 0.34) }}
            >
              Colaboración
            </span>
          ) : null}
        </span>
        <span className={`${compact ? "mt-0.5 line-clamp-1 text-sm" : "mt-1 text-balance text-[1.05rem] sm:text-lg"} block font-semibold leading-tight`}>
          {campaign.title}
        </span>
        {campaign.description && !compact ? (
          <span className="mt-1 block text-sm leading-5 opacity-70">{campaign.description}</span>
        ) : null}
      </span>

      <span
        className={`relative flex shrink-0 items-center gap-1 font-bold uppercase tracking-[0.08em] ${compact ? "text-[10px]" : "text-xs"}`}
        style={{ color: campaign.accentColor }}
      >
        <span className={compact ? "hidden" : "hidden sm:inline"}>{campaign.ctaLabel}</span>
        <ArrowUpRight
          aria-hidden="true"
          className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
          strokeWidth={2}
        />
      </span>
    </>
  );

  const className = `group relative isolate flex w-full items-center overflow-hidden border transition duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-3 motion-reduce:transform-none ${compact ? "min-h-[4rem] gap-2.5 rounded-[1.05rem] px-3 py-2.5" : "min-h-[6.5rem] gap-3 rounded-[1.35rem] px-4 py-4 sm:gap-4 sm:px-5"} ${
    campaign.visualStyle === "glass" ? "backdrop-blur-xl" : ""
  }`;
  const baseSurfaceStyle = getSurfaceStyle(campaign);
  const surfaceStyle = campaign.beamEnabled
    ? {
        ...baseSurfaceStyle,
        boxShadow: `${baseSurfaceStyle.boxShadow}, 0 0 0 1px ${colorWithAlpha(campaign.accentColor, 0.48)}, 0 0 22px ${colorWithAlpha(campaign.accentColor, 0.24)}`,
      }
    : baseSurfaceStyle;

  if (preview) {
    return <div className={className} style={surfaceStyle}>{content}</div>;
  }

  if (/^https?:\/\//.test(campaign.href)) {
    return <a href={campaign.href} target="_blank" rel="noopener noreferrer" className={className} style={surfaceStyle}>{content}</a>;
  }

  return <Link href={campaign.href} className={className} style={surfaceStyle}>{content}</Link>;
}
