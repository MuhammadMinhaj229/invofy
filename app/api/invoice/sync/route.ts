import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({
            success: false,
            configured: false,
            error: "Supabase credentials are unconfigured on this deployment. Configure SUPABASE_SERVICE_ROLE_KEY to enable automated CRM synchronization."
        }, { status: 200 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const data = await req.json();

    let contactId: string | null = null;
    let contactData: { account_id: string; user_id: string } | null = null;

    const entireInvoiceStr = JSON.stringify(data || {});
    const customerIdMatch = entireInvoiceStr.match(/CUS_SNM-\d{6}/);
    const safarCustomerId = customerIdMatch ? customerIdMatch[0] : null;

    if (!data.receiver?.phone) {
      return NextResponse.json({ 
        success: false, 
        error: "Sync Failed: A Phone Number is strictly required to sync this invoice to the CRM." 
      }, { status: 400 });
    }

    const phone = data.receiver.phone.trim();
    const normalizedPhone = phone.replace(/\D/g, "");
    
    let orQuery = `phone.eq.${phone},phone.eq.${phone.replace(/\s/g, "")}`;
    if (normalizedPhone) {
      orQuery += `,phone.ilike.%${normalizedPhone}%`;
    }

    let dbQuery = supabase.from("contacts").select("id, account_id, user_id").limit(1);
    
    if (safarCustomerId) {
       dbQuery = dbQuery.or(`safar_customer_id.eq.${safarCustomerId},${orQuery}`);
    } else {
       dbQuery = dbQuery.or(orQuery);
    }

    const { data: contact, error: fetchErr } = await dbQuery.maybeSingle();

    if (fetchErr) {
      console.error("[CRM Sync API] Contact fetch error:", fetchErr);
      return NextResponse.json({ 
        success: false, 
        error: "Database verification error: " + fetchErr.message 
      }, { status: 500 });
    }

    if (contact) {
      contactId = contact.id;
      contactData = { account_id: contact.account_id, user_id: contact.user_id };
    } else {
      return NextResponse.json({ 
        success: false, 
        error: `Sync Failed: No customer found in the CRM matching phone number ${phone}.` 
      }, { status: 403 });
    }

    if (!contactData) {
      return NextResponse.json({ success: false, error: "Contact data not found or failed to initialize." }, { status: 400 });
    }

    const firstItemName = data.details?.items?.[0]?.name ?? "";
    const serviceCodeMatch = firstItemName.match(/^(SNM-[A-Z]{2}\d{2})/);
    const serviceCode = serviceCodeMatch ? serviceCodeMatch[1] : "N/A";
    const invoiceDate = data.details?.invoiceDate instanceof Date
        ? (data.details.invoiceDate as any).toISOString().split("T")[0]
        : (data.details?.invoiceDate || new Date().toISOString().split("T")[0]);

    const { data: inserted, error } = await supabase.from("invoices").insert({
      contact_id: contactId,
      account_id: contactData.account_id,
      user_id: contactData.user_id,
      invoice_number: data.details?.invoiceNumber || 'MANUAL',
      invoice_date: invoiceDate,
      total_amount: parseFloat(data.details?.totalAmount || "0"),
      currency: data.details?.currency || 'INR',
      service_code: serviceCode || 'Custom Service',
      line_items: data.details?.items || [],
      status: 'PAID'
    }).select("id").single();

    if (error) {
      console.error("[CRM Sync API] Failed:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, invoiceId: inserted?.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[CRM Sync API] Exception:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
