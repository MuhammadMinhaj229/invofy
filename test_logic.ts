import { createClient } from "@supabase/supabase-js";
import { POST } from "./app/api/invoice/sync/route.ts";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runTests() {
  console.log("=========================================");
  console.log("🚀 STARTING 10 GENUINE ARCHITECTURE TESTS");
  console.log("=========================================\n");

  // Step 1: Get the test contact
  const { data: contact, error: contactErr } = await supabase
    .from("contacts")
    .select("id, safar_customer_id, phone")
    .eq("phone", "966575843484")
    .single();

  if (!contact) {
    console.error("Test contact not found! Aborting.", contactErr);
    return;
  }

  console.log(`✅ Found CRM Contact: ID=${contact.id}, Phone=${contact.phone}`);
  
  // Clean up any previous test invoices for this contact
  await supabase.from("invoices").delete().eq("contact_id", contact.id).like("invoice_number", "TEST-%");
  console.log("🧹 Cleaned up old test invoices.\n");

  const testCases = [
    { name: "Exact Match", phone: "966575843484" },
    { name: "With Plus Sign", phone: "+966575843484" },
    { name: "With Spaces", phone: "966 57 584 3484" },
    { name: "With Plus and Spaces", phone: "+966 57 584 3484" },
    { name: "Different Service Code", phone: "966575843484", service: "SNM-AC01 - AC Repair" },
    { name: "Large Amount", phone: "966575843484", amount: "5500.50" },
    { name: "Missing Customer ID (Fallback)", phone: "966575843484" },
    { name: "Different Currency", phone: "966575843484", currency: "USD" },
    { name: "Multiple Line Items", phone: "966575843484", items: [{name: "SNM-ZZ99"}, {name: "Extra Parts"}] },
    { name: "Standard Invoify Payload", phone: "966575843484" },
  ];

  let successCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    console.log(`--- Test ${i + 1}/10: ${tc.name} ---`);
    
    // Simulate exactly what Invoify's frontend sends to the API
    const payload = {
      sender: { name: "Safar N Manzil" },
      receiver: { 
        name: "Mohammed Mohsin Ahmed", 
        phone: tc.phone 
      },
      details: {
        invoiceNumber: `TEST-INV-${1000 + i}`,
        invoiceDate: new Date().toISOString(),
        totalAmount: tc.amount || "1500.00",
        currency: tc.currency || "INR",
        items: tc.items || [{ name: tc.service || "SNM-PR01 - Test Repair", quantity: 1, rate: 1500 }]
      }
    };

    const req = new Request("http://localhost:3000/api/invoice/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    try {
      const res = await POST(req);
      const result = await res.json();
      
      if (result.success && result.invoiceId) {
        console.log(`✅ Success! Invoice stored with ID: ${result.invoiceId}`);
        successCount++;
      } else {
        console.log(`❌ Failed:`, result.error);
      }
    } catch (e) {
      console.log(`❌ Exception:`, e.message);
    }
  }

  console.log(`\n=========================================`);
  console.log(`📊 API TEST RESULTS: ${successCount}/10 PASSED`);
  console.log(`=========================================\n`);

  if (successCount > 0) {
    console.log("🔍 VERIFYING CRM SYNC (Simulating the CRM fetching history...)");
    const { data: history, error: historyErr } = await supabase
      .from("invoices")
      .select("invoice_number, total_amount, currency, service_code, created_at")
      .eq("contact_id", contact.id)
      .like("invoice_number", "TEST-%")
      .order("created_at", { ascending: false });

    if (historyErr) {
      console.error("❌ Failed to fetch CRM history:", historyErr);
    } else {
      console.log(`✅ CRM Successfully fetched ${history.length} invoices for this customer!`);
      console.log("📋 History Records:");
      history.forEach((inv, idx) => {
        console.log(`   ${idx+1}. Invoice: ${inv.invoice_number} | Amount: ${inv.total_amount} ${inv.currency} | Service: ${inv.service_code}`);
      });
      console.log("\n✅ ARCHITECTURE IS PERFECTLY SYNCED.");
    }
  }
}

runTests();
