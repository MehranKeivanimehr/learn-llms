/** Join a base path (e.g. "/" or "/learn-llms") and a site-relative path. */
export function joinBase(base: string, path: string): string {
  const b = base.replace(/\/+$/, '');
  const p = path.replace(/^\/+/, '');
  return `${b}/${p}`;
}

/** Turn a site-relative path ("inside/") into a URL that works under the configured base. */
export function withBase(path: string): string {
  return joinBase(import.meta.env.BASE_URL, path);
}
