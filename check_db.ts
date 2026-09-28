import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
    console.log("Checking contact_notes for [INVOICE]...");
    const { data: notes, error } = await supabase
        .from("contact_notes")
        .select("id, contact_id, note_text, created_at, account_id, user_id")
        .ilike("note_text", "%[INVOICE]%")
        .order("created_at", { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error fetching notes:", error);
        return;
    }

    console.log(`Found ${notes?.length || 0} invoice notes.`);
    if (notes && notes.length > 0) {
        console.log("Most recent invoice note:");
        console.log(JSON.stringify(notes[0], null, 2));
    }
}

checkDatabase();
