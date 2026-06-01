import { jp } from "@/assets/translations/jp";

type AppLoginContentProps = {
  googleVerifiedEmail: string;
};

export function AppLoginContent({ googleVerifiedEmail }: AppLoginContentProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-6">
      <section className="w-full max-w-[440px] rounded-md border border-slate-200 bg-white px-8 py-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          {jp.appLogin.title}
        </h1>

        <p className="mt-6 text-sm font-semibold text-slate-600">
          {jp.appLogin.googleVerifiedEmailLabel}
        </p>

        <p className="mt-2 rounded-md bg-slate-100 px-4 py-3 text-base font-bold text-slate-800">
          {googleVerifiedEmail}
        </p>

        <p className="mt-8 text-sm leading-relaxed text-slate-600">
          {jp.appLogin.nextImplementationNote}
        </p>
      </section>
    </main>
  );
}
