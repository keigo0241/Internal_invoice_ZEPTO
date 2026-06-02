import { jp } from "@/assets/translations/jp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type InitialRegistrationContentProps = {
  googleVerifiedEmail: string;
};

const editableInputClassName =
  "h-11 rounded-md border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:border-sky-700 focus-visible:ring-sky-100";

const readOnlyInputClassName =
  "h-11 rounded-md border-slate-300 bg-slate-100 px-3 text-sm font-semibold text-slate-800";

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
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8">
      <section className="mx-auto w-full max-w-[760px] rounded-md border border-slate-200 bg-white px-8 py-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          {jp.initialRegistration.title}
        </h1>

        <form className="mt-8 space-y-8">
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
                placeholder={jp.initialRegistration.placeholders.name}
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
                readOnly
                className={readOnlyInputClassName}
              />

              <FieldLabel htmlFor="password">
                {jp.initialRegistration.labels.password}
              </FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={jp.initialRegistration.placeholders.password}
                className={editableInputClassName}
              />

              <FieldLabel htmlFor="passwordConfirmation">
                {jp.initialRegistration.labels.passwordConfirmation}
              </FieldLabel>
              <Input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                placeholder={
                  jp.initialRegistration.placeholders.passwordConfirmation
                }
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
                placeholder={jp.initialRegistration.placeholders.bankName}
                className={editableInputClassName}
              />

              <FieldLabel htmlFor="accountType">
                {jp.initialRegistration.labels.accountType}
              </FieldLabel>
              <select
                id="accountType"
                name="accountType"
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
                placeholder={jp.initialRegistration.placeholders.branchName}
                className={editableInputClassName}
              />

              <FieldLabel htmlFor="accountNumber">
                {jp.initialRegistration.labels.accountNumber}
              </FieldLabel>
              <Input
                id="accountNumber"
                name="accountNumber"
                inputMode="numeric"
                placeholder={jp.initialRegistration.placeholders.accountNumber}
                className={editableInputClassName}
              />

              <FieldLabel htmlFor="accountHolder">
                {jp.initialRegistration.labels.accountHolder}
              </FieldLabel>
              <Input
                id="accountHolder"
                name="accountHolder"
                placeholder={jp.initialRegistration.placeholders.accountHolder}
                className={editableInputClassName}
              />
            </div>
          </section>

          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              className="h-12 min-w-[220px] rounded-md bg-sky-800 px-6 text-base font-bold text-white hover:bg-sky-700"
            >
              {jp.initialRegistration.submitButton}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
