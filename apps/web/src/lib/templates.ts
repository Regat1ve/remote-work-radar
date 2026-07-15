export type CoverLetterTemplate = {
  slug: string;
  title: string;
  audience: string;
  when: string;
  body: string;
  swap_notes: string[];
};

export const TEMPLATES: CoverLetterTemplate[] = [
  {
    slug: "no-portfolio",
    title: "First cover letter, no portfolio yet",
    audience: "You have not shipped a public project yet. Do not fake one.",
    when: "Junior / entry-level roles, small agencies, contract-to-hire.",
    body: `Hi {first_name},

I'm early in my remote career and I want to be honest about that up front. I've been building with {stack} for {N months}, mostly through self-directed projects, and I'm looking for a first contract that lets me contribute real code while I get faster.

Here's what I bring:
- {concrete skill 1} — I use it daily for {personal project}
- {concrete skill 2} — I picked it up specifically to work on this kind of role
- I write things down. All my learning is in Git commits and a public README.

I noticed your posting mentions {specific line from the JD}. That's exactly the kind of problem I want to work on next, and here is one small thing I've built that touches it: {link — a repo, a live demo, or even a Loom of you explaining a concept}.

I do not expect senior rates. What I need is a real project, a code review culture, and a client who is okay with me shipping steadily rather than heroically. If that describes your team, I would love a 20-minute call.

Thanks for reading this far.
{Your name}
{portfolio URL if you have one, else GitHub URL}`,
    swap_notes: [
      "{stack} → the actual stack from the JD (Next.js, Python, etc.)",
      "{N months} → be honest. Two months is two months.",
      "The 'small thing I've built' link is non-optional. Even a 3-minute Loom counts.",
      "Do NOT pad your years of experience. Clients spot it and it kills the trust bridge.",
    ],
  },
  {
    slug: "career-switcher",
    title: "Career switcher (previous field ≠ dev)",
    audience: "You have work experience — just not as an engineer.",
    when: "Any junior/mid role where soft skills matter (client-facing, product, ops).",
    body: `Hi {first_name},

I'm switching into engineering from {previous field}. That means my code portfolio is smaller than a bootcamp grad's, but I bring some things they don't: {2-3 concrete transferable skills from previous role}.

I've spent the last {N months} shipping in {stack}:
- {project 1 — one line: what it does + the tricky part}
- {project 2 — same}

The reason your posting caught me: {specific detail — a domain, a stack choice, a company value}. My {previous field} background maps directly onto that because {short concrete reason}.

I'm not asking to be paid like a senior engineer. I'm asking for a shot on a contract where being a fast learner and a good communicator matters as much as raw years. If that fits, I'd love a call.

{Your name}
{portfolio URL / GitHub URL}`,
    swap_notes: [
      "Do not apologize for your background — lead with what it uniquely gives you.",
      "The 'specific detail' hook is what separates this letter from 500 others. Take 10 min to find it.",
    ],
  },
  {
    slug: "locked-out",
    title: "Locked-out dev (Upwork/Deel/Mercor said no)",
    audience: "You have real experience but your passport rules you out of platforms.",
    when: "Direct-to-founder outreach, YC company job posts, HN Who's hiring, Wellfound.",
    body: `Hi {first_name},

I'm a {N years} full-stack developer based in {city, country}. I want to work with you directly rather than through Upwork or Mercor — those platforms do not accept accounts from where I live anymore, but the code I ship does not care.

What I've built recently:
- {project 1 — with metric or scale hint. "Shipped X for Y, processes Z req/day"}
- {project 2 — same}
- {project 3 if it's stronger than the JD's ask}

Why your role: {specific 2-line reason grounded in the JD, not "you seem cool"}.

Payment: I can invoice through {Deel / Wise / USDC — check what works in your country}. My rate is {$X-$Y}/hr depending on scope. Available {N} hours a week, {time zone overlap window}.

I would love a 20-min call this week. Weekend also fine.
{Your name}
{portfolio URL}`,
    swap_notes: [
      "Lead with your capability, then handle the payment logistics matter-of-factly.",
      "Never apologize for your country — just present the mechanics. Clients respect competence.",
      "Rate range must be an actual range, not a minimum. Ranges get responses; single numbers get haggled.",
    ],
  },
  {
    slug: "senior-fast",
    title: "Senior, direct, 6-line version",
    audience: "You're experienced. The JD is short. Match it.",
    when: "Founder-written posts (HN, Vercel Hire Me, Twitter). Short letters win.",
    body: `Hi {first_name},

Ex-{previous company or stack}, {N years} shipping {stack}. Recent projects: {link 1}, {link 2}.

Read your posting. The part about {specific technical detail} is exactly what I did at {project} — {one-line what you actually did}.

Available {N} hrs/week, {rate range}, payment via {method}. 20 min this week?

{Your name}`,
    swap_notes: [
      "The whole letter is < 100 words. Founders on HN skim.",
      "Skip the pleasantries. Any word not doing work is dead weight.",
    ],
  },
];

export function getTemplate(slug: string): CoverLetterTemplate | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}
