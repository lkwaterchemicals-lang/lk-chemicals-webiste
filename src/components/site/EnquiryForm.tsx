import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { LiquidButton } from "./LiquidButton";
import { Check } from "lucide-react";

export function EnquiryForm({
  source,
  productRef,
  compact,
}: {
  source: string;
  productRef?: string;
  compact?: boolean;
}) {
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    requirement: productRef ? `Enquiry about: ${productRef}\n\n` : "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.phone || !form.requirement) {
      setError("Please share your name, phone and a short requirement.");
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "enquiries"), {
        name: form.name,
        company: form.company || null,
        phone: form.phone,
        email: form.email || null,
        requirement: form.requirement,
        product_ref: productRef || null,
        source,
        createdAt: serverTimestamp(),
      });
      setSent(true);
    } catch {
      setError("Couldn't send just now — please try WhatsApp or call.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="glass-dark rounded-2xl p-8 text-center">
        <div className="grid mx-auto h-14 w-14 place-items-center rounded-full bg-leaf text-ink">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-display text-2xl text-white">Received.</h3>
        <p className="mt-2 text-sm text-white/70">
          Shiva Krishna will call you back shortly with a technical response.
        </p>
      </div>
    );
  }

  const input =
    "w-full bg-transparent border-b border-white/15 focus:border-cyan-hi outline-none py-3 text-white placeholder:text-white/30 transition-colors";

  return (
    <form onSubmit={submit} className={"glass-dark rounded-2xl p-6 md:p-8 " + (compact ? "" : "")}>
      <div className="grid gap-4 md:grid-cols-2">
        <input required className={input} placeholder="Your name" value={form.name} onChange={update("name")} />
        <input className={input} placeholder="Company (optional)" value={form.company} onChange={update("company")} />
        <input required className={input} placeholder="Phone" value={form.phone} onChange={update("phone")} />
        <input className={input} placeholder="Email (optional)" value={form.email} onChange={update("email")} />
      </div>
      <textarea
        required
        className={input + " min-h-32 resize-none mt-4"}
        placeholder="Tell us about your water — feed source, flow rate, current issue…"
        value={form.requirement}
        onChange={update("requirement")}
      />
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <LiquidButton size="lg" onClick={() => {}}>
          {submitting ? "Sending…" : "Send enquiry"}
        </LiquidButton>
        <span className="text-xs text-white/40">We reply within one business day.</span>
      </div>
    </form>
  );
}