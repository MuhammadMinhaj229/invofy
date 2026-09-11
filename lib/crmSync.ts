import { InvoiceType } from "@/types";

export interface CrmSyncResult {
  success: boolean;
  invoiceId?: string;
  error?: string;
}

export async function syncInvoiceToCrm(
  data: InvoiceType
): Promise<CrmSyncResult> {
  try {
    const res = await fetch("/api/invoice/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json as CrmSyncResult;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[CRM Sync API Call] Exception:", msg);
    return { success: false, error: msg };
  }
}
