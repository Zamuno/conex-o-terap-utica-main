
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Service Role required to delete users and update strict tables
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // This function is intended to be called by ADMIN or CRON.
        // Security: Check for Admin Role in JWT or skip if internal (cron).
        const authHeader = req.headers.get('Authorization');
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

            // Simple check: Is user admin?
            if (user) {
                const { data: roleData } = await supabaseAdmin.from('user_roles').select('role').eq('user_id', user.id).single();
                if (roleData?.role !== 'admin') {
                    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403, headers: corsHeaders });
                }
            }
        }

        const { requestId, action } = await req.json();

        if (!requestId || !action) {
            throw new Error('Missing requestId or action');
        }

        const { data: request, error: reqError } = await supabaseAdmin
            .from('account_deletion_requests')
            .select('*')
            .eq('id', requestId)
            .single();

        if (reqError || !request) throw new Error('Request not found');

        if (action === 'approve') {
            // Soft Delete / Anonymize Logic can go here.
            // For now, we will DELETE the user from Auth (which cascades to profiles if set up, or we handle manual cleanup).
            // Given strict LGPD, let's delete Auth User.

            const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(request.user_id);
            if (deleteError) throw deleteError;

            // Send Email (Mock)
            // console.log(`Deleted user ${request.user_id}`);

            await supabaseAdmin.from('account_deletion_requests').update({
                status: 'completed',
                completed_at: new Date().toISOString()
            }).eq('id', requestId);

            await supabaseAdmin.from('audit_logs').insert({
                actor_id: null, // System
                action: 'delete_account_completed',
                target_resource: `user:${request.user_id}`,
                metadata: { request_id: requestId }
            });

        } else if (action === 'reject') {
            await supabaseAdmin.from('account_deletion_requests').update({
                status: 'rejected',
                completed_at: new Date().toISOString()
            }).eq('id', requestId);
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
