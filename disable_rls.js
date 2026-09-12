const { Client } = require('pg');

async function testRLS() {
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
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
        `;
        await client.query(sql);
        console.log("RLS DISABLED on invoices table.");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.end();
    }
}
testRLS();
