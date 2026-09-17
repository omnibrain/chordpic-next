/** Only the surface chord-ssr.ts uses; svgdom ships no types of its own. */
declare module "svgdom" {
  interface SvgdomConfig {
    setFontDir(dir: string): SvgdomConfig;
    setFontFamilyMappings(map: Record<string, string>): SvgdomConfig;
    preloadFonts(): SvgdomConfig;
  }

  export const config: SvgdomConfig;
  export function createSVGWindow(): Window & typeof globalThis;
}
