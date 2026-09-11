import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("Missing Supabase credentials for CRM sync.");
        return NextResponse.json({ success: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY in environment variables." }, { status: 500 });
    }

    // Server-side admin client to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const data = await req.json();

    let contactId: string | null = null;
    let contactData: { account_id: string; user_id: string } | null = null;

    // Extract safar_customer_id from any field in receiver (e.g. "Mohammed (CUS_SNM-000001)")
    const receiverStr = JSON.stringify(data.receiver || {});
    const customerIdMatch = receiverStr.match(/CUS_SNM-\d{6}/);
    const safarCustomerId = customerIdMatch ? customerIdMatch[0] : null;

    if (data.receiver.phone && safarCustomerId) {
      const phone = data.receiver.phone.trim();
      const normalizedPhone = phone.replace(/\D/g, ""); // Strip all non-digits
      
      let orQuery = `phone.eq.${phone},phone.eq.${phone.replace(/\s/g, "")}`;
      if (normalizedPhone) {
        orQuery += `,phone_normalized.eq.${normalizedPhone}`;
      }

      // STRICT VERIFICATION: Must match both safar_customer_id AND phone
      const { data: contact, error: fetchErr } = await supabase
        .from("contacts")
        .select("id, account_id, user_id")
        .eq("safar_customer_id", safarCustomerId)
        .or(orQuery)
        .limit(1)
        .maybeSingle();

      if (contact) {
        contactId = contact.id;
        contactData = { account_id: contact.account_id, user_id: contact.user_id };
      } else {
        return NextResponse.json({ 
          success: false, 
          error: "Strict Verification Failed: The provided Customer ID and Phone Number do not match any existing contact." 
        }, { status: 403 });
      }
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "Strict Verification Failed: Both Customer ID (e.g., CUS_SNM-000001) and Phone Number are strictly required." 
      }, { status: 400 });
    }

    if (!contactData) {
      return NextResponse.json({ success: false, error: "Contact data not found or failed to initialize." }, { status: 400 });
    }

    // Derive service code from first line item if it looks like an SNM code
    const firstItemName = data.details.items?.[0]?.name ?? "";
    const serviceCodeMatch = firstItemName.match(/^(SNM-[A-Z]{2}\d{2})/);
    const serviceCode = serviceCodeMatch ? serviceCodeMatch[1] : "N/A";
    const invoiceDate = data.details.invoiceDate instanceof Date
        ? (data.details.invoiceDate as any).toISOString().split("T")[0]
        : (data.details.invoiceDate || new Date().toISOString().split("T")[0]);

    // Insert structured data into the invoices table
    const { data: inserted, error } = await supabase.from("invoices").insert({
      contact_id: contactId,
      account_id: contactData.account_id,
      user_id: contactData.user_id,
      invoice_number: data.details.invoiceNumber || 'MANUAL',
      invoice_date: invoiceDate,
      total_amount: parseFloat(data.details.totalAmount || "0"),
      currency: data.details.currency || 'INR',
      service_code: serviceCode || 'Custom Service',
      line_items: data.details.items || [],
      status: 'PAID'
    }).select("id").single();

    if (error) {
      console.error("[CRM Sync API] Failed:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log("[CRM Sync API] Invoice synced as note:", inserted?.id);
    return NextResponse.json({ success: true, invoiceId: inserted?.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[CRM Sync API] Exception:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
