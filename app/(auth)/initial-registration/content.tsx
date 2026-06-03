"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { jp } from "@/assets/translations/jp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";

type InitialRegistrationContentProps = {
  googleVerifiedEmail: string;
};

const editableInputClassName =
  "h-11 rounded-md border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:border-sky-700 focus-visible:ring-sky-100";

const readOnlyInputClassName =
  "h-11 rounded-md border-slate-300 bg-slate-100 px-3 text-sm font-semibold text-slate-800";

type InitialRegistrationResponse = {
  data?: {
    redirectPath?: string;
  };
  message?: string;
};

function FieldLabel({ htmlFor, children }: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-semibold text-slate-700"
    >
      {children}
    </label>
  );
}

export function InitialRegistrationContent({
  googleVerifiedEmail,
}: InitialRegistrationContentProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(GOOGLE_AUTH_CONFIG.initialRegistrationApiPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          password: formData.get("password"),
          passwordConfirmation: formData.get("passwordConfirmation"),
          bankName: formData.get("bankName"),
          accountType: formData.get("accountType"),
          branchName: formData.get("branchName"),
          accountNumber: formData.get("accountNumber"),
          accountHolder: formData.get("accountHolder"),
        }),
      });
      const result = (await response.json()) as InitialRegistrationResponse;

      if (!response.ok) {
        setErrorMessage(result.message ?? jp.initialRegistration.registrationError);

        return;
      }

      router.push(result.data?.redirectPath ?? GOOGLE_AUTH_CONFIG.appLoginPath);
    } catch {
      setErrorMessage(jp.initialRegistration.registrationError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8">
      <section className="mx-auto w-full max-w-[760px] rounded-md border border-slate-200 bg-white px-8 py-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          {jp.initialRegistration.title}
        </h1>

        <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
          <section>
            <h2 className="border-b border-slate-200 pb-3 text-xl font-bold text-slate-900">
              {jp.initialRegistration.userSectionTitle}
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-[160px_1fr] sm:items-center">
              <FieldLabel htmlFor="name">
                {jp.initialRegistration.labels.name}
              </FieldLabel>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                maxLength={100}
                placeholder={jp.initialRegistration.placeholders.name}
                required
                className={editableInputClassName}
              />

              <FieldLabel htmlFor="email">
                {jp.initialRegistration.labels.email}
              </FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                value={googleVerifiedEmail}
                autoComplete="email"
                readOnly
                className={readOnlyInputClassName}
              />

              <FieldLabel htmlFor="password">
                {jp.initialRegistration.labels.password}
              </FieldLabel>
              <Input
                id="password"
                name="password"
                autoComplete="new-password"
                maxLength={128}
                minLength={8}
                type="password"
                placeholder={jp.initialRegistration.placeholders.password}
                required
                className={editableInputClassName}
              />

              <FieldLabel htmlFor="passwordConfirmation">
                {jp.initialRegistration.labels.passwordConfirmation}
              </FieldLabel>
              <Input
                id="passwordConfirmation"
                name="passwordConfirmation"
                autoComplete="new-password"
                maxLength={128}
                minLength={8}
                type="password"
                placeholder={
                  jp.initialRegistration.placeholders.passwordConfirmation
                }
                required
                className={editableInputClassName}
              />

              <FieldLabel htmlFor="companyName">
                {jp.initialRegistration.labels.companyName}
              </FieldLabel>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                value={jp.initialRegistration.companyName}
                readOnly
                className={readOnlyInputClassName}
              />
            </div>
          </section>

          <section>
            <h2 className="border-b border-slate-200 pb-3 text-xl font-bold text-slate-900">
              {jp.initialRegistration.bankSectionTitle}
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-[160px_1fr] sm:items-center">
              <FieldLabel htmlFor="bankName">
                {jp.initialRegistration.labels.bankName}
              </FieldLabel>
              <Input
                id="bankName"
                name="bankName"
                autoComplete="off"
                maxLength={100}
                placeholder={jp.initialRegistration.placeholders.bankName}
                required
                className={editableInputClassName}
              />

              <FieldLabel htmlFor="accountType">
                {jp.initialRegistration.labels.accountType}
              </FieldLabel>
              <select
                id="accountType"
                name="accountType"
                required
                className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
                defaultValue="ordinary"
              >
                <option value="ordinary">
                  {jp.initialRegistration.accountTypeOptions.ordinary}
                </option>
                <option value="checking">
                  {jp.initialRegistration.accountTypeOptions.checking}
                </option>
                <option value="savings">
                  {jp.initialRegistration.accountTypeOptions.savings}
                </option>
              </select>

              <FieldLabel htmlFor="branchName">
                {jp.initialRegistration.labels.branchName}
              </FieldLabel>
              <Input
                id="branchName"
                name="branchName"
                autoComplete="off"
                maxLength={100}
                placeholder={jp.initialRegistration.placeholders.branchName}
                required
                className={editableInputClassName}
              />

              <FieldLabel htmlFor="accountNumber">
                {jp.initialRegistration.labels.accountNumber}
              </FieldLabel>
              <Input
                id="accountNumber"
                name="accountNumber"
                autoComplete="off"
                inputMode="numeric"
                maxLength={20}
                placeholder={jp.initialRegistration.placeholders.accountNumber}
                required
                className={editableInputClassName}
              />

              <FieldLabel htmlFor="accountHolder">
                {jp.initialRegistration.labels.accountHolder}
              </FieldLabel>
              <Input
                id="accountHolder"
                name="accountHolder"
                autoComplete="off"
                maxLength={100}
                placeholder={jp.initialRegistration.placeholders.accountHolder}
                required
                className={editableInputClassName}
              />
            </div>
          </section>

          {errorMessage ? (
            <p className="text-center text-sm font-semibold text-red-600">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 min-w-[220px] rounded-md bg-sky-800 px-6 text-base font-bold text-white hover:bg-sky-700"
            >
              {isSubmitting
                ? jp.initialRegistration.submittingButton
                : jp.initialRegistration.submitButton}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
