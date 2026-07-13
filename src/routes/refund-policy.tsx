import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";
import { policyBySlug, policyHead } from "@/data/policies";

const policy = policyBySlug("refund-policy")!;

export const Route = createFileRoute("/refund-policy")({
  head: () => policyHead(policy),
  component: () => <PolicyPage policy={policy} />,
});
