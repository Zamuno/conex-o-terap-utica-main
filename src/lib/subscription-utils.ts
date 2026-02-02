
import { addDays, isAfter, parseISO } from "date-fns";

export type SubscriptionStatus = "active" | "past_due" | "canceled" | "incomplete" | "incomplete_expired" | "trialing" | "unpaid";

export interface Subscription {
    status: SubscriptionStatus;
    current_period_end: string;
    [key: string]: any;
}

/**
 * Checks if the subscription is in the grace period.
 * Grace period is 7 days after the current_period_end date if the status is past_due.
 */
export const isInGracePeriod = (subscription: Subscription | null | undefined): boolean => {
    if (!subscription || subscription.status !== "past_due") return false;

    // Safety check: if current_period_end is missing, assume no grace period
    if (!subscription.current_period_end) return false;

    const periodEnd = parseISO(subscription.current_period_end);
    const gracePeriodEnd = addDays(periodEnd, 7);
    const now = new Date();

    // If now is BEFORE gracePeriodEnd, we are in grace period
    return isAfter(gracePeriodEnd, now);
};

/**
 * Checks if access should be blocked based on subscription status.
 * Blocked if:
 * - Status is canceled
 * - Status is unpaid/incomplete_expired
 * - Status is past_due AND grace period has expired
 */
export const isAccessBlocked = (subscription: Subscription | null | undefined): boolean => {
    if (!subscription) return true; // No subscription = blocked (unless free tier logic exists elsewhere, but strictly for subscription gating)

    if (subscription.status === "active" || subscription.status === "trialing") return false;

    if (subscription.status === "past_due") {
        return !isInGracePeriod(subscription);
    }

    // Canceled, unpaid, incomplete, etc. are blocked
    return true;
};

/**
 * Calculate days remaining in grace period
 */
export const getGracePeriodDaysRemaining = (subscription: Subscription | null | undefined): number => {
    if (!isInGracePeriod(subscription) || !subscription?.current_period_end) return 0;

    const periodEnd = parseISO(subscription.current_period_end);
    const gracePeriodEnd = addDays(periodEnd, 7);
    const now = new Date();

    const diffTime = gracePeriodEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
};
