const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=\"(.*?)\"/)[1].trim();
const supabaseKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=\"(.*?)\"/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSync() {
  try {
    const data = {
      receiver: {
        name: 'John Doe',
        phone: '+1 555-0198',
        email: 'john@example.com',
        address: '123 Test St'
      },
      details: {
        invoiceNumber: 'INV-1001',
        invoiceDate: '2026-09-11',
        totalAmount: 1500,
        currency: 'USD',
        items: [
          { name: 'SNM-IN10 Flight Booking', quantity: 1, total: 1500 }
        ]
      }
    };

    console.log('Fetching profile...');
    const { data: profile, error: profErr } = await supabase.from('profiles').select('account_id, user_id').limit(1).maybeSingle();
    if (profErr) throw profErr;
    if (!profile) throw new Error('No profile found');
    console.log('Got profile:', profile.account_id);

    console.log('Inserting contact...');
    const { data: newContact, error: createErr } = await supabase.from('contacts').insert({
      name: data.receiver.name,
      phone: data.receiver.phone,
      email: data.receiver.email,
      account_id: profile.account_id,
      user_id: profile.user_id
    }).select('id').single();
    
    if (createErr) throw createErr;
    console.log('Created contact:', newContact.id);

    console.log('Inserting note...');
    const noteText = '[INVOICE]\nNumber: ' + data.details.invoiceNumber;
    const { data: note, error: noteErr } = await supabase.from('contact_notes').insert({
      contact_id: newContact.id,
      account_id: profile.account_id,
      user_id: profile.user_id,
      note_text: noteText
    }).select('id').single();
    
    if (noteErr) throw noteErr;
    console.log('Created note:', note.id);
    
    // Cleanup
    await supabase.from('contacts').delete().eq('id', newContact.id);
    console.log('Test successful, cleaned up.');
  } catch (err) {
    console.error('Test failed:', err);
  }
}
testSync();
