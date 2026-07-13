import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";
import { policyBySlug, policyHead } from "@/data/policies";

const policy = policyBySlug("warranty-policy")!;

export const Route = createFileRoute("/warranty-policy")({
  head: () => policyHead(policy),
  component: () => <PolicyPage policy={policy} />,
});
