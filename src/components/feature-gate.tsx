
import React from "react";
import { usePlan } from "@/hooks/use-plan";

interface FeatureGateProps {
    feature?: string;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export const FeatureGate = ({ feature, fallback, children }: FeatureGateProps) => {
    const { plan, isLoading } = usePlan();

    if (isLoading) return null; // Or skeleton

    if (feature && plan?.features && !plan.features.includes(feature)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
