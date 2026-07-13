import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";
import { policyBySlug, policyHead } from "@/data/policies";

const policy = policyBySlug("shipping-policy")!;

export const Route = createFileRoute("/shipping-policy")({
  head: () => policyHead(policy),
  component: () => <PolicyPage policy={policy} />,
});
