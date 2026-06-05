"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import { jp } from "@/assets/translations/jp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { filterHalfWidthAlphanumericInput } from "@/utils/validator/input/filter";

type AppLoginContentProps = {
  googleVerifiedEmail: string;
};

const inputClassName =
  "h-11 rounded-md border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:border-sky-700 focus-visible:ring-sky-100";

export function AppLoginContent({ googleVerifiedEmail }: AppLoginContentProps) {
  const [password, setPassword] = useState("");

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(filterHalfWidthAlphanumericInput(event.target.value));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

          <Button
            type="submit"
            className="h-12 w-full rounded-md bg-sky-800 px-6 text-base font-bold text-white hover:bg-sky-700"
          >
            {jp.appLogin.loginButton}
          </Button>
        </form>
      </section>
    </main>
  );
}
