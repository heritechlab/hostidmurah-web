import CallbackClient from "./CallbackClient";

// Halaman ini membawa access_token/refresh_token sekali pakai lewat hash fragment,
// jadi tidak boleh di-cache oleh CDN/browser.
export const dynamic = "force-dynamic";

export default function AuthCallbackPage() {
  return <CallbackClient />;
}
