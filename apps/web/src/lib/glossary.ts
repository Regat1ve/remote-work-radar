export type GlossaryTerm = {
  slug: string;
  term: string;
  short: string;
  long: string;
  category: "compensation" | "contract" | "workflow" | "money" | "red-flags";
};

export const GLOSSARY: GlossaryTerm[] = [
  {
    slug: "hourly",
    term: "Hourly rate",
    short: "You get paid for every hour you actually work.",
    long:
      "Hourly means you invoice for the hours you spent. A $40/hr rate at 30 hrs/week comes out to roughly $5,200/month before taxes. Most contracts use a time-tracker (Toggl, Hubstaff, Timeular) so both sides trust the number. Hourly is the safest deal when the scope is unclear — you get paid for exploration.",
    category: "compensation",
  },
  {
    slug: "retainer",
    term: "Retainer",
    short: "Fixed monthly fee. You commit hours, they commit budget.",
    long:
      "A retainer is a fixed monthly payment for a fixed block of hours (e.g. $3,000/mo for up to 40 hrs). Predictable income, predictable spend. Good when the client has ongoing work but does not want to negotiate a new SoW every week. Bad if scope creeps beyond your hours — negotiate an overage rate up front.",
    category: "compensation",
  },
  {
    slug: "fixed-price",
    term: "Fixed price / SoW",
    short: "You quote a total for a deliverable. Scope is everything.",
    long:
      "Fixed price means you agree on a total ($8,000 for the migration, $2,500 for the redesign) regardless of hours. Only take fixed if the scope is written down in one document, both sides signed it, and any changes trigger a change order. Otherwise you end up eating 3× the hours you estimated.",
    category: "compensation",
  },
  {
    slug: "contract",
    term: "Contract role",
    short: "You are not an employee. No benefits, but higher rate.",
    long:
      "A contractor is a separate business the client pays. No paid leave, no health insurance, no employment protection. In exchange, contract rates are 1.5-2× employee salary equivalent. If someone offers you a &apos;contract&apos; role at employee salary, walk away — that is the worst of both worlds.",
    category: "contract",
  },
  {
    slug: "full-time",
    term: "Full-time (FTE)",
    short: "40 hrs/week commitment. Usually salaried, sometimes contract-to-hire.",
    long:
      "Full-time in remote-work-radar usually means &apos;this person is your only project.&apos; It can still be a contract (contract-to-hire, C2H) or a direct-hire salaried role. Direct-hire means an employer of record (Deel, Remote.com) will handle payroll — check whether your country is on their list.",
    category: "contract",
  },
  {
    slug: "async",
    term: "Async",
    short: "You do not sit in meetings. You write things down.",
    long:
      "Async-first companies (GitLab, Doist, Buffer) do most communication in writing — Slack threads, Linear tickets, Loom videos. Meetings are rare. This is a good match for anyone who cannot overlap with US hours. Watch for &apos;async&apos; in the job title even when the reality is 4 hours of daily standups — check reviews on Glassdoor.",
    category: "workflow",
  },
  {
    slug: "timezone-overlap",
    term: "Timezone overlap",
    short: "How many hours per day you can be online at the same time.",
    long:
      "A US-East (UTC-5) company saying &apos;4 hours overlap&apos; means you need to be at your desk from 9am-1pm their time. From Moscow (UTC+3) that is 5pm-9pm. From Istanbul (UTC+3) same. Beijing (UTC+8) is midnight — a hard sell. Check the numbers before you apply.",
    category: "workflow",
  },
  {
    slug: "usdc",
    term: "USDC / stablecoin",
    short: "Digital dollars that move across borders in minutes for pennies.",
    long:
      "USDC is a stablecoin — 1 USDC = 1 USD, backed by a US company (Circle). Sending USDC to a Bybit or Bitget wallet takes minutes and costs cents. Many clients (especially crypto-native ones) will pay this way. Then you sell USDC for local currency on the exchange. Legal in most countries — check yours.",
    category: "money",
  },
  {
    slug: "deel",
    term: "Deel / Remote.com",
    short: "Employer of record. They handle payroll where your client cannot.",
    long:
      "Deel and Remote.com act as your legal employer. The client pays them, they pay you (bank transfer, PayPal, USDC — pick one). Check the supported-country list before you apply — Deel does not work in every jurisdiction. Fees are 5-15% of your rate, usually eaten by the client.",
    category: "money",
  },
  {
    slug: "wise",
    term: "Wise",
    short: "Cheap international bank transfer. Works from most countries.",
    long:
      "Wise (former TransferWise) lets a client wire dollars to their US account, then hands you your local currency at real exchange rate minus ~0.5%. Works for most passport countries. If your country was recently sanctioned, Wise may freeze the account — verify before relying on it.",
    category: "money",
  },
  {
    slug: "upfront-payment",
    term: "&apos;Pay a training fee&apos;",
    short: "Never. A real employer never asks you to pay to work.",
    long:
      "Any posting that asks you to send money — training fee, background check fee, equipment fee — is a scam. Full stop. remote-work-radar auto-flags these with a red badge in the scam-detector, but if one gets through, walk away without a second thought.",
    category: "red-flags",
  },
  {
    slug: "wire-transfer-request",
    term: "&apos;Send us your wire details&apos; before hiring",
    short: "Bank details come after the contract, never before.",
    long:
      "Legitimate hiring flow: interview → offer → signed contract → onboarding → then and only then do you share bank details. If someone asks for your wire information during the interview, they are phishing you.",
    category: "red-flags",
  },
  {
    slug: "whatsapp-only",
    term: "&apos;Contact us on WhatsApp&apos;",
    short: "Real companies use email and their own domain.",
    long:
      "A real business has an email at their own domain (name@company.com), a legal entity you can look up, and a website that has been alive for more than a month. If the only contact channel is a personal WhatsApp number or Telegram username, it is either a scam or a shell for one.",
    category: "red-flags",
  },
];

export function byCategory(): Record<GlossaryTerm["category"], GlossaryTerm[]> {
  const out: Record<GlossaryTerm["category"], GlossaryTerm[]> = {
    compensation: [],
    contract: [],
    workflow: [],
    money: [],
    "red-flags": [],
  };
  for (const t of GLOSSARY) out[t.category].push(t);
  return out;
}
