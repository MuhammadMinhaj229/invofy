const { Client } = require('pg');

async function createTemplatesTable() {
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
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Give unrestricted access for this global templates table
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.templates FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.templates FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.templates FOR DELETE USING (true);
        `;
        
        await client.query(sql);
        console.log("Templates table created successfully!");
    } catch (e) {
        console.error("Error creating templates table:", e);
    } finally {
        await client.end();
    }
}
createTemplatesTable();
