import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
    const phone = "+966575843484";
    const normalizedPhone = "966575843484";
    
    // Encode phone to handle '+' sign
    const encodedPhone = encodeURIComponent(phone);
    let orQuery = `phone.eq.${encodedPhone},phone.eq.${encodeURIComponent(phone.replace(/\s/g, ""))}`;
    if (normalizedPhone) {
        orQuery += `,phone_normalized.eq.${normalizedPhone}`;
    }

    console.log("orQuery:", orQuery);

    const { data: contact, error } = await supabase
    .from("contacts")
    .select("id, name, phone")
    .or(orQuery)
    .limit(1)
    .maybeSingle();

    console.log("Result:", contact);
    console.log("Error:", error);
}

test();
