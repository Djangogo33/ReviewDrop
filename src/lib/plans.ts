// Central plan definitions and limits.
// Used by dashboard, project settings, and widget config endpoint.

export type PlanId = "free" | "pro" | "max";

export interface PlanLimits {
  maxActiveProjects: number | null; // null = unlimited
  customBrandColor: boolean;        // can pick widget color
  csvExport: boolean;
  webhooks: boolean;
  removeBadge: boolean;             // hide "Powered by ReviewDrop"
  customDomain: boolean;
  prioritySupport: boolean;
  dedicatedSupport: boolean;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    maxActiveProjects: 3,
    customBrandColor: false,
    csvExport: false,
    webhooks: false,
    removeBadge: false,
    customDomain: false,
    prioritySupport: false,
    dedicatedSupport: false,
  },
  pro: {
    maxActiveProjects: null,
    customBrandColor: true,
    csvExport: true,
    webhooks: false,
    removeBadge: false,
    customDomain: false,
    prioritySupport: true,
    dedicatedSupport: false,
  },
  max: {
    maxActiveProjects: null,
    customBrandColor: true,
    csvExport: true,
    webhooks: true,
    removeBadge: true,
    customDomain: true,
    prioritySupport: true,
    dedicatedSupport: true,
  },
};

export const DEFAULT_BRAND_COLOR = "#6366f1";

export function normalizePlan(plan: string | null | undefined): PlanId {
  return plan === "pro" || plan === "max" ? plan : "free";
}

export function getLimits(plan: string | null | undefined): PlanLimits {
  return PLAN_LIMITS[normalizePlan(plan)];
}

export const PLAN_LABEL: Record<PlanId, string> = {
  free: "Free",
  pro: "Pro",
  max: "Max",
};
