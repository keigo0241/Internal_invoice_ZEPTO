import Image from "next/image";
import { jp } from "@/assets/translations/jp";
import {
  GOOGLE_AUTH_CONFIG,
  LOGIN_PAGE_ASSETS,
} from "@/constants/auth";

type LoginContentProps = {
  errorMessage: string | null;
};

export function LoginContent({ errorMessage }: LoginContentProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-6">
      <section className="w-full max-w-[440px] rounded-md border border-slate-200 bg-white px-8 py-8 text-center shadow-sm">
        <div className="mb-6 flex justify-start">
          <div className="flex h-16 w-20 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
            <Image
              src={LOGIN_PAGE_ASSETS.logoSrc}
              alt={LOGIN_PAGE_ASSETS.logoAlt}
              width={44}
              height={44}
              priority
            />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900">
          {jp.login.title}
        </h1>

        <p className="mt-10 text-lg font-medium leading-relaxed text-slate-700">
          {jp.login.descriptionLine1}
          <br />
          {jp.login.descriptionLine2}
        </p>

        <a
          href={GOOGLE_AUTH_CONFIG.startPath}
          className="mx-auto mt-7 flex h-14 w-full max-w-[300px] items-center justify-center rounded-md bg-sky-800 px-6 text-base font-bold text-white transition hover:bg-sky-700"
        >
          {jp.login.googleAuthButton}
        </a>

        {errorMessage ? (
          <p className="mt-3 text-sm font-semibold text-red-600">
            {errorMessage}
          </p>
        ) : null}

        <p className="mt-10 text-sm font-semibold text-slate-600">
          {jp.login.note}
        </p>
      </section>
    </main>
  );
}
