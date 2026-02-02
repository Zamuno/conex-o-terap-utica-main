
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        // 1. Authenticate User
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        if (authError || !user) throw new Error('Unauthorized');

        const userId = user.id;

        // 2. Log Action (Audit) - Using Service Role to ensure insertion success regardless of RLS quirks on logs? 
        // Actually standard client is fine if policy 'Authenticated actors can insert logs' works. 
        // But let's be safe and use Service Role to log AUDIT events to ensure immutability and no tampering.
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        await supabaseAdmin.from('audit_logs').insert({
            actor_id: userId,
            action: 'export_data',
            target_resource: `user:${userId}`,
            ip_address: req.headers.get('x-forwarded-for') || 'unknown',
            user_agent: req.headers.get('user-agent'),
            metadata: { request_id: crypto.randomUUID() }
        });

        // 3. Fetch Data in Parallel
        const [profile, consents, checkIns, diaryEntries, emotionalRecords] = await Promise.all([
            supabaseClient.from('profiles').select('*').eq('id', userId).single(),
            supabaseClient.from('user_consents').select('*').eq('user_id', userId),
            supabaseClient.from('check_ins').select('*').eq('user_id', userId),
            supabaseClient.from('diary_entries').select('*').eq('user_id', userId),
            supabaseClient.from('emotional_records').select('*').eq('user_id', userId),
        ]);

        const exportData = {
            generated_at: new Date().toISOString(),
            user_id: userId,
            profile: profile.data,
            privacy: {
                consents: consents.data,
            },
            data: {
                check_ins: checkIns.data,
                diary_entries: diaryEntries.data,
                emotional_records: emotionalRecords.data,
            }
        };

        return new Response(JSON.stringify(exportData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
