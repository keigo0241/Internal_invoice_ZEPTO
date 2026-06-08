import Link from "next/link";
import { jp } from "@/assets/translations/jp";
import {
  INVOICE_STATUS_LABELS,
  InvoiceStatus,
} from "@/features/invoices/types/invoice-status";

type InvoicesContentProps = {
  invoiceStatus: InvoiceStatus | null;
};

type InvoiceFilterLink = {
  label: string;
  status: InvoiceStatus | null;
};

const invoiceFilterLinks: InvoiceFilterLink[] = [
  { label: jp.invoices.filters.all, status: null },
  { label: jp.invoices.filters.draft, status: InvoiceStatus.Draft },
  { label: jp.invoices.filters.returned, status: InvoiceStatus.Returned },
];

function getInvoiceFilterHref(status: InvoiceStatus | null) {
  if (!status) return "/invoices";

  const searchParams = new URLSearchParams({ status });

  return `/invoices?${searchParams.toString()}`;
}

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
          {invoiceFilterLinks.map((link) => (
            <Link
              key={link.status ?? "all"}
              href={getInvoiceFilterHref(link.status)}
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 transition hover:bg-slate-100"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600">
        {jp.invoices.placeholder}
      </div>
    </section>
  );
}
