import { toInvoiceStatus } from "@/features/invoices/types/invoice-status";
import { InvoicesContent } from "./content";

type InvoicesPageProps = {
  searchParams: Promise<{
    status?: string | string[];
  }>;
};

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const params = await searchParams;
  const invoiceStatus = toInvoiceStatus(params.status);

  return <InvoicesContent invoiceStatus={invoiceStatus} />;
}
