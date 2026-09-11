import { Client } from 'pg';

async function migrate() {
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
        console.log("Connected to PostgreSQL");

        const sql = `
            CREATE TABLE IF NOT EXISTS public.invoices (
                id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
                contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
                account_id UUID,
                user_id UUID,
                invoice_number VARCHAR(100),
                invoice_date DATE,
                total_amount NUMERIC,
                currency VARCHAR(10),
                service_code VARCHAR(100),
                status VARCHAR(50) DEFAULT 'PAID',
                line_items JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- RLS Policies
            ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

            -- Drop existing policies if any
            DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
            DROP POLICY IF EXISTS "Users can insert their own invoices" ON public.invoices;
            DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
            DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;

            CREATE POLICY "Users can view their own invoices" ON public.invoices
                FOR SELECT USING (
                    account_id IN (SELECT account_id FROM public.profiles WHERE id = auth.uid())
                    OR user_id = auth.uid()
                );

            CREATE POLICY "Users can insert their own invoices" ON public.invoices
                FOR INSERT WITH CHECK (
                    account_id IN (SELECT account_id FROM public.profiles WHERE id = auth.uid())
                    OR user_id = auth.uid()
                );

            CREATE POLICY "Users can update their own invoices" ON public.invoices
                FOR UPDATE USING (
                    account_id IN (SELECT account_id FROM public.profiles WHERE id = auth.uid())
                    OR user_id = auth.uid()
                );

            CREATE POLICY "Users can delete their own invoices" ON public.invoices
                FOR DELETE USING (
                    account_id IN (SELECT account_id FROM public.profiles WHERE id = auth.uid())
                    OR user_id = auth.uid()
                );
        `;

        await client.query(sql);
        console.log("Migration executed successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.end();
    }
}

migrate();
