// Legal & policy pages — Privacy, Terms, Shipping, Returns/Refunds and
// Warranty. Content is generated against live site settings so contact
// details always match what the admin has published.
import type { SiteSettings } from "@/data/content";

export type PolicySection = {
  heading: string;
  paras?: string[];
  bullets?: string[];
};

export type Policy = {
  slug: string;
  path: string;
  title: string;
  navLabel: string;
  tagline: string;
  metaDescription: string;
  updated: string;
  sections: (s: SiteSettings) => PolicySection[];
};

const COMPANY = "LK Chemicals Pvt. Ltd.";

export const POLICIES: Policy[] = [
  {
    slug: "privacy-policy",
    path: "/privacy-policy",
    title: "Privacy Policy",
    navLabel: "Privacy Policy",
    tagline: "What we collect, why we collect it, and how we protect it.",
    metaDescription:
      "How LK Chemicals Pvt. Ltd. collects, uses and protects the information you share through this website.",
    updated: "July 2026",
    sections: (s) => [
      {
        heading: "Who we are",
        paras: [
          `${COMPANY} ("LK Chemicals", "we", "us") is a Hyderabad-based manufacturer of industrial water-treatment chemicals and provider of related plant services. This policy explains what information this website collects and how it is used. By using the site you agree to the practices described here.`,
        ],
      },
      {
        heading: "Information we collect",
        paras: ["We only collect information you choose to give us:"],
        bullets: [
          "Enquiry & call-back forms — your name, phone number, email address, company name and the requirement you describe.",
          "Job applications — your name, contact details, experience summary and the resume you attach.",
          "Technical data — standard analytics signals such as pages visited, approximate location, device and browser type (see Analytics below).",
        ],
      },
      {
        heading: "How we use it",
        bullets: [
          "To respond to your enquiry with a technical and commercial answer.",
          "To arrange call-backs, site visits, quotations and deliveries you request.",
          "To evaluate job applications.",
          "To improve the website's content and performance.",
        ],
        paras: [
          "We do not sell, rent or trade your personal information. Details are shared only with our own team, and with service providers strictly needed to run this site (hosting, database and file storage).",
        ],
      },
      {
        heading: "Cookies",
        paras: [
          "The site uses a small number of cookies and similar browser storage for essential preferences (such as your light/dark theme choice) and, when enabled, for analytics. We do not use advertising or cross-site tracking cookies. You can clear or block cookies in your browser at any time; the site keeps working.",
        ],
      },
      {
        heading: "Analytics",
        paras: [
          "When analytics is active the site uses Google Analytics to understand aggregate visitor behaviour — which pages are read, for how long, and from which region. This data is statistical and is not used to identify you personally.",
        ],
      },
      {
        heading: "Data protection & retention",
        bullets: [
          "Form submissions are stored in a secured cloud database with access restricted to authorised LK Chemicals staff.",
          "Transport between your browser and our servers is encrypted (HTTPS).",
          "Enquiry records are retained for as long as needed to serve you and meet legal obligations, and are deleted when no longer required.",
        ],
      },
      {
        heading: "Your rights",
        paras: [
          `You can ask us at any time to show, correct or delete the personal information we hold about you. Write to ${s.email} or call ${s.phone} and we will act on the request promptly.`,
        ],
      },
      {
        heading: "Contact",
        paras: [`${COMPANY}, ${s.address}. Email: ${s.email} · Phone: ${s.phone}.`],
      },
    ],
  },
  {
    slug: "terms-and-conditions",
    path: "/terms-and-conditions",
    title: "Terms & Conditions",
    navLabel: "Terms & Conditions",
    tagline: "The ground rules for using this website and our product information.",
    metaDescription:
      "Terms and conditions for using the LK Chemicals website, including intellectual property, liability and product information disclaimers.",
    updated: "July 2026",
    sections: (s) => [
      {
        heading: "Website usage",
        paras: [
          `This website is operated by ${COMPANY}. By accessing it you accept these terms. The site exists to present our products and services and to let you reach us — you agree not to misuse it, attempt unauthorised access, submit false enquiries, or use automated tools to scrape or overload it.`,
        ],
      },
      {
        heading: "Intellectual property",
        paras: [
          "All content on this site — text, product descriptions, photographs, graphics, logos and layout — belongs to LK Chemicals or its licensors. You may view and print pages for your own business evaluation. Reproducing, republishing or commercially exploiting any content without our written permission is not allowed.",
        ],
      },
      {
        heading: "Product information disclaimer",
        paras: [
          "Product descriptions, specifications, dosages and application notes are provided in good faith as general technical guidance. Industrial water chemistry varies plant to plant: correct product selection and dosing always depend on your feed water, system design and operating conditions.",
        ],
        bullets: [
          "Always consult our technical team before first use of any product.",
          "Refer to the product's Technical Data Sheet (TDS) and Safety Data Sheet (SDS) before handling.",
          "Specifications may change as formulations improve; the current TDS prevails over website copy.",
        ],
      },
      {
        heading: "Quotations & orders",
        paras: [
          "Prices shown or quoted are indicative unless confirmed in a written quotation. Orders are subject to our written acceptance and to the commercial terms agreed at the time of sale.",
        ],
      },
      {
        heading: "Limitation of liability",
        paras: [
          `To the maximum extent permitted by law, ${COMPANY} is not liable for indirect, incidental or consequential losses arising from use of this website or reliance on its content. Our liability in relation to any product supplied is limited to the replacement of the product or refund of its purchase price, per our warranty and return policies. Nothing here limits liability that cannot be excluded under Indian law.`,
        ],
      },
      {
        heading: "Governing law",
        paras: [
          "These terms are governed by the laws of India. Any dispute is subject to the exclusive jurisdiction of the courts at Hyderabad, Telangana.",
        ],
      },
      {
        heading: "Contact",
        paras: [`Questions about these terms: ${s.email} · ${s.phone}.`],
      },
    ],
  },
  {
    slug: "shipping-policy",
    path: "/shipping-policy",
    title: "Shipping & Delivery Policy",
    navLabel: "Shipping & Delivery",
    tagline: "How your drums, carboys and equipment reach your plant.",
    metaDescription:
      "LK Chemicals shipping and delivery policy — methods, timelines, charges and service areas for industrial chemical orders.",
    updated: "July 2026",
    sections: (s) => [
      {
        heading: "Shipping methods",
        bullets: [
          "Own delivery vehicles for Hyderabad and surrounding industrial belts — the fastest option for regular supply contracts.",
          "Reputed surface-transport carriers for other cities, with materials packed and labelled per applicable chemical transport norms.",
          "Customer pickup from our Cherlapally works by prior arrangement.",
        ],
      },
      {
        heading: "Delivery timelines",
        bullets: [
          "Hyderabad & nearby districts: typically 1–3 working days from order confirmation.",
          "Rest of Telangana and neighbouring states: typically 3–7 working days.",
          "Custom formulations or bulk orders: lead time confirmed with your quotation.",
        ],
        paras: [
          "Timelines count from written order confirmation and receipt of any agreed advance. We will inform you promptly of delays outside our control (weather, transport strikes, regulatory holds).",
        ],
      },
      {
        heading: "Shipping charges",
        paras: [
          "Freight is quoted with your order and depends on quantity, packaging and destination. For regular supply contracts within our service area, delivery is often included — confirmed on the quotation. Unloading at site is the buyer's responsibility unless agreed otherwise.",
        ],
      },
      {
        heading: "Service areas",
        paras: [
          "We primarily serve Telangana, Andhra Pradesh, Karnataka, Tamil Nadu and Maharashtra, and can arrange delivery across India for suitable order sizes. Ask us about your location — logistics for industrial chemicals are our daily work.",
        ],
      },
      {
        heading: "Receiving your order",
        bullets: [
          "Check drums/carboys for transit damage before signing the delivery challan.",
          "Note any shortage or damage on the challan and inform us within 48 hours with photos.",
          "Store products as per the label and TDS immediately on receipt.",
        ],
      },
      {
        heading: "Contact",
        paras: [`Delivery questions: ${s.phone} · ${s.email}.`],
      },
    ],
  },
  {
    slug: "refund-policy",
    path: "/refund-policy",
    title: "Return, Refund & Cancellation Policy",
    navLabel: "Returns & Refunds",
    tagline: "Fair, factory-direct terms when something isn't right.",
    metaDescription:
      "LK Chemicals return, refund and cancellation policy — eligibility, process and timelines for industrial chemical orders.",
    updated: "July 2026",
    sections: (s) => [
      {
        heading: "Eligibility for returns",
        paras: ["Because our products are industrial chemicals, returns are accepted when:"],
        bullets: [
          "The product delivered differs from what was ordered (wrong product or grade).",
          "The product fails to meet the specification on its Certificate of Analysis / TDS.",
          "Packaging arrived damaged or leaking (reported on the delivery challan or within 48 hours with photos).",
        ],
      },
      {
        heading: "Returns we cannot accept",
        bullets: [
          "Opened or partly used containers, unless the content itself is proven out of specification.",
          "Products stored contrary to the label/TDS after delivery.",
          "Custom-blended formulations made to your specification, unless defective.",
          "Return requests raised more than 15 days after delivery.",
        ],
      },
      {
        heading: "Refund process",
        bullets: [
          "Report the issue to us with your invoice number, batch number and photos.",
          "Our technical team verifies the claim — for specification disputes we test a sealed sample from the same batch.",
          "Approved claims are settled by replacement, credit note or refund — your choice.",
          "Refunds are issued to the original payment method within 7–10 working days of approval.",
        ],
      },
      {
        heading: "Cancellation terms",
        bullets: [
          "Standard products: cancel free of charge any time before dispatch.",
          "After dispatch: the order follows the return rules above.",
          "Custom formulations: cancellable free of charge before production starts; once blending begins, costs incurred may be deducted.",
        ],
      },
      {
        heading: "Contact",
        paras: [
          `To start a return or cancellation, call ${s.phone} or email ${s.email} with your invoice details — we respond within one business day.`,
        ],
      },
    ],
  },
  {
    slug: "warranty-policy",
    path: "/warranty-policy",
    title: "Warranty Policy",
    navLabel: "Warranty",
    tagline: "What our chemistry and our workmanship stand behind.",
    metaDescription:
      "LK Chemicals warranty policy — product quality guarantee, coverage, exclusions and how to raise a claim.",
    updated: "July 2026",
    sections: (s) => [
      {
        heading: "Product warranty",
        paras: [
          "Every batch we ship is manufactured under our ISO 9001:2015 quality system and leaves the plant with a batch record. We warrant that each product, in its unopened original packaging and stored per the label/TDS, conforms to its published specification until the shelf-life date printed on the pack.",
        ],
      },
      {
        heading: "Service & workmanship warranty",
        paras: [
          "For plant services (RO servicing, descaling, installation and similar jobs) we warrant the workmanship performed against the agreed scope. Defects in our workmanship reported within 30 days of job completion are corrected free of charge.",
        ],
      },
      {
        heading: "Coverage",
        bullets: [
          "Replacement of product that fails to meet its specification, or refund of its purchase price.",
          "Re-performance of services where our workmanship is at fault.",
          "Technical support to diagnose whether an issue is product-, dosing- or system-related.",
        ],
      },
      {
        heading: "Exclusions",
        bullets: [
          "Product stored or handled contrary to the label, TDS or SDS after delivery.",
          "Results affected by incorrect dosing, dilution or mixing with third-party chemicals without our written advice.",
          "Normal variation of treated-water outcomes caused by feed-water or plant-condition changes.",
          "Consequential losses such as production downtime — see our Terms & Conditions.",
        ],
      },
      {
        heading: "Claim process",
        bullets: [
          `Contact ${s.contactPerson} on ${s.phone} or ${s.email} with the invoice and batch number.`,
          "Keep the product, its packaging and a sample available for inspection.",
          "We verify the claim — usually within 5 working days, including batch retention-sample testing where relevant.",
          "Approved claims are settled by replacement, re-service, credit note or refund.",
        ],
      },
    ],
  },
];

export const policyBySlug = (slug: string) => POLICIES.find((p) => p.slug === slug);

/** Route head() metadata shared by every policy page. */
export function policyHead(policy: Policy) {
  return {
    meta: [
      { title: `${policy.title} — LK Chemicals, Hyderabad` },
      { name: "description", content: policy.metaDescription },
      { property: "og:title", content: `${policy.title} — LK Chemicals` },
      { property: "og:description", content: policy.metaDescription },
    ],
  };
}
