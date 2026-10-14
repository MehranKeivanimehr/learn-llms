export interface Slide {
  title: string;
  html: string;
}

/** Splits rendered lesson HTML into slides, one per <h2> section. */
export function splitSlides(html: string): Slide[] {
  return html
    .split(/(?=<h2[\s>])/i)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const m = part.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
      if (!m || part.indexOf(m[0]) !== 0) return { title: '', html: part };
      return { title: m[1].replace(/<[^>]+>/g, '').trim(), html: part.slice(m[0].length).trim() };
    });
}
