"use client";

import Script from "next/script";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { attributionParams } from "@/lib/attribution";
import { safePublicId, track, type HomeProsEvent } from "@/lib/tracking";

const gaId = safePublicId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, /^G-[A-Z0-9]+$/);
const pixelId = safePublicId(process.env.NEXT_PUBLIC_META_PIXEL_ID, /^\d{5,20}$/);

export function TrackingScripts() {
  return (
    <>
      <Script id="homepros-datalayer" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];`}
      </Script>
      {gaId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="homepros-gtag" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      ) : null}
      {pixelId ? (
        <Script id="homepros-meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
        </Script>
      ) : null}
    </>
  );
}

export function AttributionCapture() {
  const params = useSearchParams();

  useEffect(() => {
    const found: Record<string, string> = {};
    for (const key of attributionParams) {
      const value = params.get(key);
      if (value) found[key] = value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 200);
    }
    if (Object.keys(found).length === 0) return;
    const current = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith("hp_attr="))
      ?.slice("hp_attr=".length);
    let existing: Record<string, string> = {};
    if (current) {
      try {
        const parsed = JSON.parse(decodeURIComponent(current)) as Record<string, unknown>;
        for (const key of attributionParams) {
          if (typeof parsed[key] === "string") existing[key] = parsed[key];
        }
      } catch {
        existing = {};
      }
    }
    const merged = { ...existing, ...found };
    document.cookie = `hp_attr=${encodeURIComponent(JSON.stringify(merged))}; path=/; max-age=2592000; samesite=lax`;
  }, [params]);

  return null;
}

export function TrackOnMount({ event }: { event: HomeProsEvent }) {
  useEffect(() => {
    track(event);
  }, [event]);
  return null;
}
