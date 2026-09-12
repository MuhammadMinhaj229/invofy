const { Client } = require('pg');

async function fixDuplicates() {
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
        
        // The one with ID '867591b5-8688-4c45-b154-a3ff17f538d7' has phone +966575843484
        // The one with ID '7021c931-04f8-4f22-8cce-0db2880e7257' has phone 966575843484
        
        // Point all invoices to the first one (867591b5) just in case
        await client.query("UPDATE public.invoices SET contact_id = '7021c931-04f8-4f22-8cce-0db2880e7257' WHERE contact_id = '867591b5-8688-4c45-b154-a3ff17f538d7'");
        
        // Delete the duplicate so it never confuses the CRM again
        await client.query("DELETE FROM public.contacts WHERE id = '867591b5-8688-4c45-b154-a3ff17f538d7'");
        
        console.log("Duplicate contact merged and deleted!");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.end();
    }
}
fixDuplicates();
