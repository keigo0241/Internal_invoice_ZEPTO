export enum InvoiceStatus {
  Draft = "draft",
  Returned = "returned",
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.Draft]: "下書き",
  [InvoiceStatus.Returned]: "差戻",
};

export function toInvoiceStatus(status: string | string[] | undefined) {
  if (Array.isArray(status)) return null;

  if (status === InvoiceStatus.Draft || status === InvoiceStatus.Returned) {
    return status;
  }

  return null;
}
