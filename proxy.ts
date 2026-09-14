import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/dashboard"];
const AUTH_ONLY = ["/login", "/register"];

const ADMIN_HOST_PREFIX = "admin.";
const ADMIN_AUTH_ONLY = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = (request.headers.get("host") ?? "").split(":")[0];
  const token = request.cookies.get("auth_token")?.value;
  const isAdminHost = hostname.startsWith(ADMIN_HOST_PREFIX);

  if (isAdminHost) {
    // Subdomain admin tidak boleh pernah di-cache CDN — path yang sama persis
    // dengan domain utama (mis. "/") bisa ke-serve dari cache domain utama
    // kalau tidak dipaksa no-store di sini.
    const noStore = (res: NextResponse) => {
      res.headers.set("Cache-Control", "no-store, must-revalidate");
      return res;
    };

    // Halaman /admin/* hanya boleh diakses lewat subdomain admin, bukan domain utama
    if (pathname.startsWith("/admin")) {
      return noStore(NextResponse.redirect(new URL("/", request.url)));
    }

    const isAdminAuthOnly = ADMIN_AUTH_ONLY.some((p) => pathname.startsWith(p));

    if (!isAdminAuthOnly && !token) {
      return noStore(NextResponse.redirect(new URL("/login", request.url)));
    }

    if (isAdminAuthOnly && token) {
      return noStore(NextResponse.redirect(new URL("/", request.url)));
    }

    // Rewrite semua path di subdomain admin ke namespace /admin/* secara internal
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathname === "/" ? "/admin" : `/admin${pathname}`;
    return noStore(NextResponse.rewrite(rewriteUrl));
  }

  // Domain utama: blokir akses langsung ke namespace /admin/*
  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthOnly && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
