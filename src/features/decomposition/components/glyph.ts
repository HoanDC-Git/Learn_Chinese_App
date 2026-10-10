// Detects characters the system fonts cannot render (tofu / □ boxes).
// Compares the rasterized glyph against U+FFFF (.notdef in virtually all
// fonts): identical pixels mean the character has no real glyph.
// Results are cached per character.

const cache = new Map<string, boolean>();

export function isCharRenderable(ch: string): boolean {
  const cached = cache.get(ch);
  if (cached !== undefined) return cached;

  let ok = true;
  try {
    if (typeof document === "undefined") return true;
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return true;
    const font =
      '48px "FandolKai","Noto Sans SC","SimSun",STKaiti,KaiTi,serif';
    const raster = (c: string): string => {
      ctx.clearRect(0, 0, 64, 64);
      ctx.font = font;
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#000";
      ctx.fillText(c, 4, 32);
      return ctx.getImageData(0, 0, 64, 64).data.join(",");
    };
    // U+FFFF renders as .notdef (tofu) in virtually every font.
    ok = raster(ch) !== raster("\uFFFF");
  } catch {
    ok = true;
  }
  cache.set(ch, ok);
  return ok;
}
