/**
 * Branding configuration.
 *
 * Override these values to rebrand the app without touching components.
 * Optional env override: VITE_BRAND_NAME, VITE_BRAND_LOGO (path under /public).
 */

const env = import.meta.env;

export interface BrandConfig {
  /** Full display name shown in headers and login. */
  name: string;
  /** Short tagline shown under the brand on the start screen. */
  tagline: string;
  /** Public URL of the logo image. `null` renders the SVG monogram fallback. */
  logoPath: string | null;
  /** 1–3 character monogram used by the SVG fallback. */
  monogram: string;
  /** Tab title shown in the browser. */
  documentTitle: string;
}

export const BRAND: BrandConfig = {
  name: (env.VITE_BRAND_NAME as string | undefined) ?? "Sales Floor",
  tagline: "Real time · live trading floor",
  logoPath:
    (env.VITE_BRAND_LOGO as string | undefined) ?? null,
  monogram: "S",
  documentTitle:
    (env.VITE_BRAND_NAME as string | undefined) ?? "Sales Floor",
};
