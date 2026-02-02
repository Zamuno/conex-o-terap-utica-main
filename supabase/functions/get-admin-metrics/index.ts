
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14.21.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        // Verify user is admin
        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            throw new Error('Unauthorized')
        }

        // Use Service Role to query all subscriptions (bypass RLS)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Check if user is actually admin in DB
        const { data: roleData } = await supabaseAdmin
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single()

        if (roleData?.role !== 'admin') {
            throw new Error('Forbidden: Admin access required')
        }

        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
            apiVersion: '2023-10-16',
        })

        // 1. Calculate MRR & Churn from Subscriptions (DB)
        // Fetch all relevant subscriptions
        // We need: plan, status, updated_at
        const { data: subscriptions, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .select('plan, status, updated_at, created_at')

        if (subError) throw subError

        // Group by plan for MRR
        const planCounts: Record<string, number> = {}
        let totalActive = 0
        let totalCanceledLast30Days = 0

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        subscriptions?.forEach((sub) => {
            // MRR: Active or Past Due (assume past_due still counts until canceled/unpaid)
            if (['active', 'past_due', 'trialing'].includes(sub.status)) {
                planCounts[sub.plan] = (planCounts[sub.plan] || 0) + 1
                totalActive++
            }

            // Churn: Canceled in last 30 days
            if (sub.status === 'canceled') {
                const updated = new Date(sub.updated_at || sub.created_at || new Date())
                if (updated >= thirtyDaysAgo) {
                    totalCanceledLast30Days++
                }
            }
        })

        // 2. Fetch Coupons from Stripe
        // We want Promo Codes (user facing codes)
        const promoCodes = await stripe.promotionCodes.list({
            limit: 100,
            active: true,
            expand: ['data.coupon'], // expand coupon to get details
        })

        const couponsFormatted = promoCodes.data.map((pc: any) => ({
            code: pc.code,
            type: pc.coupon.percent_off ? 'percentage' : 'fixed_amount',
            value: pc.coupon.percent_off || pc.coupon.amount_off,
            origin: pc.metadata?.origin || 'unknown', // assuming metadata has origin
            redemptions: pc.times_redeemed,
            status: pc.active ? 'active' : 'inactive',
            created: pc.created
        }))

        return new Response(
            JSON.stringify({
                subscription_metrics: {
                    plan_counts: planCounts,
                    total_active: totalActive,
                    churn_last_30d: totalCanceledLast30Days,
                },
                coupons: couponsFormatted,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
