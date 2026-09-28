import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from("templates")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching templates:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const templates = data.map(item => ({
            ...item.payload,
            id: item.id
        }));

        return NextResponse.json(templates);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const templateName = payload.details?.templateName || "Untitled Template";

        const { data, error } = await supabase
            .from("templates")
            .insert({
                template_name: templateName,
                payload: payload
            })
            .select()
            .single();

        if (error) {
            console.error("Error saving template:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: data.id });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "No ID provided" }, { status: 400 });

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error } = await supabase
            .from("templates")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting template:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
