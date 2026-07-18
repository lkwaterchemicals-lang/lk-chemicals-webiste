// Job application dialog — the careers page's real apply flow. Collects the
// applicant's details plus an optional resume (uploaded to Cloudinary) and
// files everything into the `applications` collection, which the admin
// reviews under Careers → Applications. Same spam layers as every public form.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, FileText, Loader2, Paperclip, Send, Trash2, X } from "lucide-react";
import { firestoreLite } from "@/integrations/firebase/lite";
import { uploadToCloudinary } from "@/integrations/cloudinary";
import { getRecaptchaToken, honeypotProps, isLikelySpam } from "@/lib/spam";
import type { CareerOpening } from "@/lib/content";

export function ApplyDialog({
  job,
  open,
  onClose,
}: {
  /** null = speculative application (no specific opening) */
  job: CareerOpening | null;
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", role: "", message: "" });
  const [resume, setResume] = useState<{ url: string; name: string } | null>(null);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const openedAt = useRef(Date.now());
  const fileRef = useRef<HTMLInputElement>(null);

  // Fresh sheet every time the dialog opens.
  useEffect(() => {
    if (open) {
      openedAt.current = Date.now();
      setSent(false);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    addEventListener("keydown", h);
    return () => removeEventListener("keydown", h);
  }, [open, onClose]);

  const update =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const pickResume = async (file: File | undefined | null) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Resume must be under 10 MB.");
      return;
    }
    setError(null);
    setUploadPct(0);
    try {
      const res = await uploadToCloudinary(file, setUploadPct);
      setResume({ url: res.secure_url, name: file.name });
    } catch {
      setError("Resume upload failed — you can still apply without it.");
    } finally {
      setUploadPct(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Please share at least your name and phone number.");
      return;
    }
    if (isLikelySpam(honeypot, openedAt.current)) {
      setSent(true);
      return;
    }
    setSubmitting(true);
    try {
      const recaptcha = await getRecaptchaToken("application");
      const { fs, db } = await firestoreLite();
      await fs.addDoc(fs.collection(db, "applications"), {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        currentRole: form.role.trim() || null,
        message: form.message.trim() || null,
        resumeUrl: resume?.url ?? null,
        resumeName: resume?.name ?? null,
        jobSlug: job?.slug ?? null,
        jobTitle: job?.title ?? "General application",
        source: "careers-page",
        recaptcha: recaptcha ?? null,
        createdAt: fs.serverTimestamp(),
      });
      setSent(true);
    } catch {
      setError("Couldn't send just now — please try WhatsApp or call us.");
    } finally {
      setSubmitting(false);
    }
  };

  const input =
    "w-full bg-transparent border-b border-white/15 focus:border-cyan-hi outline-none py-3 text-white placeholder:text-white/30 transition-colors";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-ink-2/90 backdrop-blur-xl p-0 sm:p-6"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={job ? `Apply for ${job.title}` : "Send your resume"}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            className="glass-dark w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="micro-label text-cyan-hi">
                  {job ? "Apply now" : "Open application"}
                </div>
                <h2 className="display-xl mt-1 text-2xl text-white">
                  {job ? job.title : "Send your resume."}
                </h2>
                {job?.location && <p className="mt-1 text-xs text-white/50">{job.location}</p>}
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full glass text-white hover:text-cyan-hi"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {sent ? (
              <div className="mt-8 text-center pb-2">
                <div className="grid mx-auto h-14 w-14 place-items-center rounded-full bg-leaf text-ink">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-2xl text-white">Application received.</h3>
                <p className="mt-2 text-sm text-white/70">
                  We read every application — expect a call or an email if there's a fit.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-6 py-2.5 text-sm text-white/85 hover:border-cyan-hi hover:text-white transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    required
                    className={input}
                    placeholder="Your name *"
                    value={form.name}
                    onChange={update("name")}
                    autoComplete="name"
                  />
                  <input
                    required
                    className={input}
                    placeholder="Phone *"
                    value={form.phone}
                    onChange={update("phone")}
                    autoComplete="tel"
                    inputMode="tel"
                  />
                  <input
                    className={input}
                    placeholder="Email (optional)"
                    value={form.email}
                    onChange={update("email")}
                    autoComplete="email"
                    inputMode="email"
                  />
                  <input
                    className={input}
                    placeholder="Current role / experience"
                    value={form.role}
                    onChange={update("role")}
                  />
                </div>
                <textarea
                  className={input + " min-h-24 resize-none mt-4"}
                  placeholder="Why you? A line or two is enough."
                  value={form.message}
                  onChange={update("message")}
                />

                {/* Resume upload */}
                <div className="mt-5">
                  {resume ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
                      <FileText className="h-4 w-4 shrink-0 text-cyan-hi" />
                      <span className="min-w-0 flex-1 truncate text-sm text-white/85">
                        {resume.name}
                      </span>
                      <button
                        type="button"
                        aria-label="Remove resume"
                        onClick={() => setResume(null)}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/60 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploadPct !== null}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 px-4 py-3.5 text-sm text-white/70 transition-colors hover:border-cyan-hi hover:text-white"
                    >
                      {uploadPct !== null ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Uploading {uploadPct}%…
                        </>
                      ) : (
                        <>
                          <Paperclip className="h-4 w-4" /> Attach resume — PDF or Word (optional)
                        </>
                      )}
                    </button>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => void pickResume(e.target.files?.[0])}
                  />
                </div>

                <input
                  {...honeypotProps}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
                {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting || uploadPct !== null}
                  className="mt-6 inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-full bg-cyan-hi px-6 py-3 text-sm font-semibold text-ink shadow-[0_10px_30px_-10px_var(--cyan-hi)] transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Submit application
                    </>
                  )}
                </button>
                <p className="mt-3 text-center text-[11px] text-white/40">
                  We reply within one business day. Your details stay with LK Chemicals.
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
