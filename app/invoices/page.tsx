import Link from "next/link";
import {
  INVOICE_STATUS_LABELS,
  type InvoiceStatus,
  toInvoiceStatus,
} from "@/features/invoices/types/invoice-status";

type InvoicesPageProps = {
  searchParams: Promise<{
    status?: string | string[];
  }>;
};

function getFilterMessage(status: InvoiceStatus | null) {
  if (!status) return "すべての請求書を表示しています。";

  return `${INVOICE_STATUS_LABELS[status]}の請求書を表示しています。`;
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const params = await searchParams;
  const invoiceStatus = toInvoiceStatus(params.status);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">請求書一覧</h1>
          <p className="mt-2 text-sm text-slate-600">
            {getFilterMessage(invoiceStatus)}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/invoices"
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 transition hover:bg-slate-100"
          >
            すべて
          </Link>
          <Link
            href="/invoices?status=draft"
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 transition hover:bg-slate-100"
          >
            下書き
          </Link>
          <Link
            href="/invoices?status=returned"
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 transition hover:bg-slate-100"
          >
            差戻
          </Link>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600">
        請求書データ取得処理は今後ここに接続します。
      </div>
    </section>
  );
}
