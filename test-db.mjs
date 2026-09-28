import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  console.log("Checking Supabase for recent syncs...");
  
  const { data: contacts, error: contactError } = await supabase.from('contacts').select('*').order('created_at', { ascending: false }).limit(2);
  console.log('Latest Contacts Error?', contactError);
  console.log('Latest Contacts:', contacts);
  
  const { data: notes, error: notesError } = await supabase.from('contact_notes').select('*').order('created_at', { ascending: false }).limit(2);
  console.log('Latest Notes Error?', notesError);
  console.log('Latest Notes:', notes);
}

check();
