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

    if (data.receiver.phone) {
      const phone = data.receiver.phone.trim();
      const { data: contact } = await supabase
        .from("contacts")
        .select("id, account_id, user_id")
        .or(`phone.eq.${phone},phone.eq.${phone.replace(/\s/g, "")}`)
        .maybeSingle();

      if (contact) {
        contactId = contact.id;
        contactData = { account_id: contact.account_id, user_id: contact.user_id };
      }
    }

    if (!contactId) {
      console.log("No CRM contact matched. Smartly creating a new contact...");
      
      // Grab ANY contact to get the tenant/account ids (since it's a single business CRM)
      const { data: existingContact } = await supabase
          .from("contacts")
          .select("account_id, user_id")
          .limit(1)
          .maybeSingle();

      if (!existingContact) {
          return NextResponse.json({ success: false, error: "Cannot create contact: No account ownership reference found in CRM." }, { status: 400 });
      }
      contactData = existingContact;

      const { data: newContact, error: createErr } = await supabase
          .from("contacts")
          .insert({
              name: data.receiver.name || "Unknown Customer",
              phone: data.receiver.phone || "Unknown Phone",
              email: data.receiver.email || null,
              account_id: contactData.account_id,
              user_id: contactData.user_id
          })
          .select("id")
          .single();
          
      if (createErr || !newContact) {
          return NextResponse.json({ success: false, error: "Failed to smartly create contact: " + (createErr?.message || "Unknown error") }, { status: 400 });
      }
      contactId = newContact.id;
      
      const { data: notesData } = await supabase
          .from('contact_notes')
          .select('note_text')
          .ilike('note_text', '%Customer ID: CUS_SNM-%')
          .order('created_at', { ascending: false })
          .limit(1);

      let nextSeq = 1;
      if (notesData && notesData.length > 0) {
          const match = notesData[0].note_text.match(/CUS_SNM-(\d+)/);
          if (match) {
              nextSeq = parseInt(match[1], 10) + 1;
          }
      }
      const safarCustomerId = `CUS_SNM-${String(nextSeq).padStart(6, '0')}`;
      
      await supabase.from("contact_notes").insert({
          contact_id: contactId,
          account_id: contactData.account_id,
          user_id: contactData.user_id,
          note_text: `Customer ID: ${safarCustomerId}\nLocation: ${data.receiver.address || 'Unknown'}\nService Interest: Smart Creation from Invoify`
      });
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

    // Create a structured note text for the invoice
    let noteText = `[INVOICE]
Number: ${data.details.invoiceNumber}
Date: ${invoiceDate}
Total: ${data.details.totalAmount} ${data.details.currency}
Service: ${serviceCode}`;

    if (data.details.items && data.details.items.length > 0) {
      const itemsList = data.details.items.map((item: any) => `- ${item.name} (x${item.quantity}) = ${item.total}`).join('\n');
      noteText += `\nItems:\n` + itemsList;
    }

    // Push the note to contact_notes
    const { data: inserted, error } = await supabase.from("contact_notes").insert({
      contact_id: contactId,
      account_id: contactData.account_id,
      user_id: contactData.user_id,
      note_text: noteText
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
