import Link from "next/link";
import { jp } from "@/assets/translations/jp";
import {
  INVOICE_STATUS_LABELS,
  type InvoiceStatus,
} from "@/features/invoices/types/invoice-status";

type InvoicesContentProps = {
  invoiceStatus: InvoiceStatus | null;
};

function getFilterMessage(status: InvoiceStatus | null) {
  if (!status) return jp.invoices.allFilterMessage;

  return `${INVOICE_STATUS_LABELS[status]}${jp.invoices.filteredMessageSuffix}`;
}

export function InvoicesContent({ invoiceStatus }: InvoicesContentProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {jp.invoices.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {getFilterMessage(invoiceStatus)}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/invoices"
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 transition hover:bg-slate-100"
          >
            {jp.invoices.filters.all}
          </Link>
          <Link
            href="/invoices?status=draft"
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 transition hover:bg-slate-100"
          >
            {jp.invoices.filters.draft}
          </Link>
          <Link
            href="/invoices?status=returned"
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 transition hover:bg-slate-100"
          >
            {jp.invoices.filters.returned}
          </Link>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600">
        {jp.invoices.placeholder}
      </div>
    </section>
  );
}
