import Image from "next/image";
import {
  GOOGLE_AUTH_CONFIG,
  LOGIN_ERROR_MESSAGES,
  LOGIN_PAGE_ASSETS,
  LOGIN_PAGE_TEXT,
  type LoginErrorCode,
} from "@/constants/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

function getLoginErrorMessage(error: string | string[] | undefined) {
  const errorCode = Array.isArray(error) ? error[0] : error;

  if (!isLoginErrorCode(errorCode)) {
    return null;
  }

  return LOGIN_ERROR_MESSAGES[errorCode];
}

function isLoginErrorCode(
  errorCode: string | undefined,
): errorCode is LoginErrorCode {
  return Boolean(errorCode && errorCode in LOGIN_ERROR_MESSAGES);
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const errorMessage = getLoginErrorMessage(error);

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

        <a
          href={GOOGLE_AUTH_CONFIG.startPath}
          className="mx-auto mt-7 flex h-14 w-full max-w-[300px] items-center justify-center rounded-md bg-sky-800 px-6 text-base font-bold text-white transition hover:bg-sky-700"
        >
          {LOGIN_PAGE_TEXT.googleAuthButton}
        </a>

        {errorMessage ? (
          <p className="mt-3 text-sm font-semibold text-red-600">
            {errorMessage}
          </p>
        ) : null}

        <p className="mt-10 text-sm font-semibold text-slate-600">
          {LOGIN_PAGE_TEXT.note}
        </p>
      </section>
    </main>
  );
}
