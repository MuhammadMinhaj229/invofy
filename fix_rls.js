const { Client } = require('pg');

async function fixRLS() {
    const client = new Client({
        user: 'postgres.uzpnvylarbfttzhjqduj',
        password: 'PASSWORD@123456789kk',
        host: 'aws-0-ap-southeast-1.pooler.supabase.com',
        port: 6543,
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const sql = `
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
CREATE POLICY "Users can view their own invoices" ON public.invoices
    FOR SELECT USING (
        account_id IN (SELECT account_id FROM public.profiles WHERE user_id = auth.uid()) 
        OR user_id = auth.uid()
        OR contact_id IN (SELECT id FROM public.contacts)
    );
        `;
        await client.query(sql);
        console.log("RLS Fixed! Now users can see invoices if they can see the contact.");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.end();
    }
}
fixRLS();
