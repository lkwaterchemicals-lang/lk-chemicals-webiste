import { useRef, useState } from "react";
import { firestoreLite } from "@/integrations/firebase/lite";
import { getRecaptchaToken, honeypotProps, isLikelySpam } from "@/lib/spam";
import { useWhatsAppHandoff } from "@/lib/wa-handoff";
import { LiquidButton } from "./LiquidButton";
import { WhatsAppButton } from "./WhatsApp";
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
  const [honeypot, setHoneypot] = useState("");
  // Kept so the success panel can offer a tap-to-send link if the browser
  // blocked the automatic hand-off.
  const [waUrl, setWaUrl] = useState<string | null>(null);
  const openedAt = useRef(Date.now());
  const handoff = useWhatsAppHandoff();

  const update =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.phone || !form.requirement) {
      setError("Please share your name, phone and a short requirement.");
      return;
    }
    // Bots (filled honeypot / instant submit) get a silent fake success.
    if (isLikelySpam(honeypot, openedAt.current)) {
      setSent(true);
      return;
    }
    // Reserved HERE, synchronously: after the first await the click is no
    // longer a trusted gesture and the popup would be blocked.
    const tab = handoff.reserve();
    setSubmitting(true);
    try {
      const recaptcha = await getRecaptchaToken("enquiry");
      const { fs, db } = await firestoreLite();
      await fs.addDoc(fs.collection(db, "enquiries"), {
        name: form.name,
        company: form.company || null,
        phone: form.phone,
        email: form.email || null,
        requirement: form.requirement,
        product_ref: productRef || null,
        source,
        recaptcha: recaptcha ?? null,
        createdAt: fs.serverTimestamp(),
      });
      const { url } = handoff.deliver(tab, "New enquiry", [
        ["Name", form.name],
        ["Company", form.company],
        ["Phone", form.phone],
        ["Email", form.email],
        ["Product", productRef],
        ["Requirement", form.requirement],
      ]);
      setWaUrl(url);
      setSent(true);
    } catch {
      // Nothing was saved, so there is nothing to send on.
      tab.cancel();
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
          Our technical team will call you back shortly. WhatsApp should have opened with your
          details — send it to reach us straight away.
        </p>
        {waUrl && (
          <div className="mt-5 flex justify-center">
            <WhatsAppButton href={waUrl}>Send on WhatsApp</WhatsAppButton>
          </div>
        )}
      </div>
    );
  }

  const input =
    "w-full bg-transparent border-b border-white/15 focus:border-cyan-hi outline-none py-3 text-white placeholder:text-white/30 transition-colors";

  return (
    <form onSubmit={submit} className={"glass-dark rounded-2xl p-6 md:p-8 " + (compact ? "" : "")}>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          required
          className={input}
          placeholder="Your name"
          value={form.name}
          onChange={update("name")}
        />
        <input
          className={input}
          placeholder="Company (optional)"
          value={form.company}
          onChange={update("company")}
        />
        <input
          required
          className={input}
          placeholder="Phone"
          value={form.phone}
          onChange={update("phone")}
        />
        <input
          className={input}
          placeholder="Email (optional)"
          value={form.email}
          onChange={update("email")}
        />
      </div>
      <textarea
        required
        className={input + " min-h-32 resize-none mt-4"}
        placeholder="Tell us about your water — feed source, flow rate, current issue…"
        value={form.requirement}
        onChange={update("requirement")}
      />
      <input {...honeypotProps} value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
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
