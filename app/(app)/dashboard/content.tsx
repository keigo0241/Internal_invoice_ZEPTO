import { jp } from "@/assets/translations/jp";
import { LogoutButton } from "./_components/logout-button";

export function DashboardContent() {
  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {jp.dashboard.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {jp.dashboard.description}
          </p>
        </div>

        <LogoutButton />
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600">
        {jp.dashboard.placeholder}
      </div>
    </section>
  );
}
