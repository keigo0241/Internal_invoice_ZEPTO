import Image from "next/image";
import { LOGIN_PAGE_ASSETS, LOGIN_PAGE_TEXT } from "@/constants/auth";

export default function LoginPage() {
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
          {LOGIN_PAGE_TEXT.title}
        </h1>

        <p className="mt-10 text-lg font-medium leading-relaxed text-slate-700">
          {LOGIN_PAGE_TEXT.descriptionLine1}
          <br />
          {LOGIN_PAGE_TEXT.descriptionLine2}
        </p>

        <button
          type="button"
          className="mt-7 h-14 w-full max-w-[300px] rounded-md bg-sky-800 px-6 text-base font-bold text-white transition hover:bg-sky-700"
        >
          {LOGIN_PAGE_TEXT.googleAuthButton}
        </button>

        <p className="mt-10 text-sm font-semibold text-slate-600">
          {LOGIN_PAGE_TEXT.note}
        </p>
      </section>
    </main>
  );
}
