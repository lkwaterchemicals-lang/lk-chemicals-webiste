import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";
import { policyBySlug, policyHead } from "@/data/policies";

const policy = policyBySlug("terms-and-conditions")!;

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => policyHead(policy),
  component: () => <PolicyPage policy={policy} />,
});
