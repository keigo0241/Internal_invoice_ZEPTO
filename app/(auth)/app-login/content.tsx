"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { jp } from "@/assets/translations/jp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { filterHalfWidthAlphanumericInput } from "@/utils/validator/input/filter";

type AppLoginContentProps = {
  googleVerifiedEmail: string;
};

const inputClassName =
  "h-11 rounded-md border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:border-sky-700 focus-visible:ring-sky-100";

type AppLoginResponse = {
  data?: {
    redirectPath?: string;
  };
  message?: string;
};

function getFormStringValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

async function parseAppLoginResponse(response: Response) {
  try {
    return (await response.json()) as AppLoginResponse;
  } catch {
    return {};
  }
}

export function AppLoginContent({ googleVerifiedEmail }: AppLoginContentProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(filterHalfWidthAlphanumericInput(event.target.value));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(GOOGLE_AUTH_CONFIG.appLoginApiPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: getFormStringValue(formData, "email"),
          password: getFormStringValue(formData, "password"),
        }),
      });
      const result = await parseAppLoginResponse(response);

      if (!response.ok) {
        setErrorMessage(result.message ?? jp.appLogin.loginError);
        setIsSubmitting(false);

        return;
      }

      router.push(result.data?.redirectPath ?? GOOGLE_AUTH_CONFIG.successPath);
    } catch {
      setErrorMessage(jp.appLogin.loginError);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-6">
      <section className="w-full max-w-[440px] rounded-md border border-slate-200 bg-white px-8 py-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            {jp.appLogin.title}
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {jp.appLogin.description}
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="text-sm font-semibold text-slate-700"
            >
              {jp.appLogin.labels.email}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={googleVerifiedEmail}
              placeholder={jp.appLogin.placeholders.email}
              required
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-semibold text-slate-700"
            >
              {jp.appLogin.labels.password}
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={handlePasswordChange}
              placeholder={jp.appLogin.placeholders.password}
              required
              className={inputClassName}
            />
          </div>

          <div className="flex justify-end">
            <a
              href="#"
              className="text-sm font-semibold text-sky-800 hover:text-sky-700"
            >
              {jp.appLogin.passwordResetLink}
            </a>
          </div>

          {errorMessage ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-md bg-sky-800 px-6 text-base font-bold text-white hover:bg-sky-700"
          >
            {isSubmitting ? jp.appLogin.submittingButton : jp.appLogin.loginButton}
          </Button>
        </form>
      </section>
    </main>
  );
}
