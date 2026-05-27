import { redirect } from "next/navigation";
import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { getCurrentGoogleVerifiedEmail } from "@/features/auth/services/session";

export default async function AppLoginPage() {
  const googleVerifiedEmail = await getCurrentGoogleVerifiedEmail();

  if (!googleVerifiedEmail) {
    redirect(GOOGLE_AUTH_CONFIG.loginPath);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-6">
      <section className="w-full max-w-[440px] rounded-md border border-slate-200 bg-white px-8 py-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          アプリ内ログイン
        </h1>

        <p className="mt-6 text-sm font-semibold text-slate-600">
          Google認証済みメールアドレス
        </p>

        <p className="mt-2 rounded-md bg-slate-100 px-4 py-3 text-base font-bold text-slate-800">
          {googleVerifiedEmail}
        </p>

        <p className="mt-8 text-sm leading-relaxed text-slate-600">
          次の実装で、初回利用判定とアプリ内ログインを接続します。
        </p>
      </section>
    </main>
  );
}
