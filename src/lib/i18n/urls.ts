import type { SiteLocale } from "./locale";

/** Strip a leading /en prefix, if present, back to the bare French path. */
function stripEn(pathname: string): string {
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3);
  return pathname;
}

/** The equivalent path for `locale`: fr stays bare, en gains the /en prefix. */
export function localizedPath(pathname: string, locale: SiteLocale): string {
  const bare = stripEn(pathname);
  if (locale === "fr") return bare;
  return bare === "/" ? "/en" : `/en${bare}`;
}
