# PriorProof business plan

A prove-or-refuse prior-authorization agent for US specialty practices. PriorProof
reads a public payer medical-necessity policy and a patient chart, then returns a
submission-ready prior-auth packet and a criterion-by-criterion coverage matrix.
Every criterion is either proven against a cited span in the chart or left red and
returned as a named gap. The agent never greens a criterion it cannot cite.

This document is the cfo.ai artifact for the neatHack submission. External figures
carry an inline citation and a URL in Sources. Every number we modeled is tagged
`(assumption)`. The two are kept separate on purpose: the facts are checkable, the
model is ours.

## 1. The problem, in cited numbers

Prior authorization is a large, repetitive, high-stakes paperwork task that sits
between a clinician and the care a patient needs.

- A physician completes about 40 prior authorization requests per week. The work
  consumes about 13 hours of physician and staff time per week. 40 percent of
  practices employ staff whose only job is prior authorization. [AMA 2025 prior
  authorization physician survey]
- A single manual prior authorization costs a provider about $10.91 per
  transaction. A fully electronic transaction costs about $2.17. [CAQH Index, via
  Unlimited Systems]
- In Medicare Advantage, plans denied 7.4 percent of prior authorization requests
  in 2022, up from 5.6 to 5.8 percent in 2019 through 2021. Only 9.9 percent of
  denied requests were appealed. 83.2 percent of those appeals were overturned in
  the enrollee's favor. [KFF, 2022 data]
- A federal review found that 13 percent of Medicare Advantage prior-authorization
  denials met Medicare coverage rules and should have been approved. [HHS OIG,
  OEI-09-18-00260]

Read together these say the task is expensive and the denials are often wrong. The
appeals that would reverse them are almost never filed. That gap is the opening.

## 2. What PriorProof does

Input: a real public payer medical-necessity policy and a chart. Output: a packet a
practice can submit, plus a coverage matrix that marks each criterion proven or gap.

The one invariant: a criterion goes green only when a real span in the chart
supports it and two independent passes agree on that same span. Anything the chart
cannot support stays a gap, with the one line that would close it. This is what a
reviewer trusts. It is also what keeps the tool from manufacturing support for a
claim that would later be denied.

No PHI. The product runs on public payer policy and a synthetic chart. Both are
labeled synthetic in the app. The HIPAA path for real charts is in section 9.

## 3. Who buys it

The buyer is whoever eats the 13 hours a week today.

- Specialty practices (orthopedics, cardiology, radiology, oncology, gastro) where
  prior auth is dense and denials are costly.
- Revenue-cycle-management firms that run prior auth for many practices at once.
- Medical billing companies that already hold the payer relationship and want a
  faster, auditable packet.

The RCM firms and billing companies matter most. They buy per seat and per volume.
They already carry a BAA posture. One sale puts the tool in front of many
practices.

## 4. Pricing (assumption)

Three tiers, so a single clinic and a 40-practice RCM firm both have a door.

| Tier | Price | Who it is for |
| --- | --- | --- |
| Pay as you go | about $12 per completed packet, no commitment | a practice trying it on real cases |
| Pro | about $349 per month including 50 packets, then $7 each over | a busy single practice |
| Scale | $5 to $7 per packet with a signed BAA | RCM and billing firms at volume |

A completed packet is the billable unit, not a seat or a login. A packet is only
billable when the agent returns a finished matrix, so a run that fails costs the
customer nothing.

Blended realized price lands near $9 per packet (assumption), because the volume
tiers pull the average down from the $12 list price as Scale customers grow into the
mix.

## 5. Unit economics (assumption)

| Line | Per packet |
| --- | --- |
| Blended realized price | about $9.00 |
| COGS | about $0.60 |
| Gross profit | about $8.40 |
| Gross margin | about 93 percent |

COGS is dominated by LLM calls. One packet runs roughly 20 model calls: one policy
parse, two independent evidence passes across the criteria, then one cover letter.
At cost-efficient model pricing that is about $0.60. Hosting is Vercel. The
per-packet compute amortizes to pennies, so it rounds into the same $0.60. The
two-pass design is the main cost driver and it is also the product, so the margin
already prices in the thing that makes the output trustworthy.

## 6. Break-even (assumption)

Fixed cost below the gross line is small for a solo founder: infra and tooling run
about $200 per month early, rising toward $400 at volume.

- Infra-only break-even: about 25 packets per month. ($200 / $8.40 is about 24.)
- Break-even including a modest founder draw of about $3,000 per month: about 380
  packets per month. (($200 + $3,000) / $8.40 is about 381.)

So the business covers its machines almost immediately. It covers a ramen founder
draw at a few hundred packets a month.

## 7. 12-month revenue and runway sketch (assumption)

A solo founder on a steady ramp. Monthly net cash is gross profit minus a $3,000
founder draw and the fixed infra line. All of this is modeled, not booked.

| Month | Packets | Revenue | Gross profit | Net cash | Cumulative cash |
| --- | --- | --- | --- | --- | --- |
| 1 | 200 | $1,800 | $1,680 | -$1,520 | -$1,520 |
| 2 | 450 | $4,050 | $3,780 | +$580 | -$940 |
| 3 | 750 | $6,750 | $6,300 | +$3,100 | +$2,160 |
| 4 | 1,050 | $9,450 | $8,820 | +$5,620 | +$7,780 |
| 5 | 1,350 | $12,150 | $11,340 | +$8,140 | +$15,920 |
| 6 | 1,650 | $14,850 | $13,860 | +$10,660 | +$26,580 |
| 7 | 1,950 | $17,550 | $16,380 | +$12,980 | +$39,560 |
| 8 | 2,250 | $20,250 | $18,900 | +$15,500 | +$55,060 |
| 9 | 2,550 | $22,950 | $21,420 | +$18,020 | +$73,080 |
| 10 | 2,850 | $25,650 | $23,940 | +$20,540 | +$93,620 |
| 11 | 3,150 | $28,350 | $26,460 | +$23,060 | +$116,680 |
| 12 | 3,450 | $31,050 | $28,980 | +$25,580 | +$142,260 |

Year-one revenue is about $195,000 on this ramp (21,650 packets at the $9 blend),
inside the $190,000 to $200,000 range. Monthly cash flow turns positive in month 2
as volume clears the 380-packet founder-draw mark. Cumulative cash recovers the
month-1 dip by month 3. The business is solidly cash-flow positive from month 4 as
the ramp pulls well clear of break-even. The worst cumulative dip is about $1,500 in
month 1, so the starting buffer a solo founder needs is small.

## 8. The value anchor

A PriorProof packet costs the buyer about $9. It carries its own citations, so a
reviewer can check every green row. It stands against a manual task that costs $11
at the CAQH floor and climbs toward $90 on a complex specialty case that pulls in
clinician time and a peer-to-peer call (the $11 is cited, the $90 ceiling is a
modeling estimate of loaded labor on the hard cases).

The sharper anchor is the appeals gap. Over 80 percent of appealed Medicare
Advantage denials are overturned, yet only about 10 percent of denials are ever
appealed. [KFF] A tool that produces a cited, submission-ready packet in minutes
turns the appeal that wins four times out of five from a cost nobody has time for
into a routine step. That is revenue a practice is leaving on the table today.

## 9. HIPAA and the BAA path

The demo uses a synthetic chart and no PHI, so it ships with no HIPAA exposure. A
real chart is PHI. The moment PHI enters the pipeline, every subprocessor that
touches it needs a signed Business Associate Agreement: the hosting provider and the
LLM provider at least. That BAA is the main onboarding friction, not the software.
The Scale tier is built around it, which is why it is the tier the RCM and billing
buyers land on. Until a BAA is in place a customer runs on synthetic or de-identified
inputs only.

## 10. Facts versus assumptions

Cited external facts, checkable at the sources below:

- about 40 prior auths per physician per week, about 13 hours of staff time per
  week, 40 percent of practices with dedicated prior-auth staff [AMA]
- $10.91 manual cost per transaction, $2.17 electronic [CAQH Index]
- 7.4 percent Medicare Advantage denial rate in 2022, 9.9 percent of denials
  appealed, 83.2 percent of appeals overturned [KFF]
- 13 percent of denials met coverage rules and should have been approved [HHS OIG]

Our modeling assumptions, which a reader should pressure test:

- pricing at $12 pay-as-you-go, $349 Pro, $5 to $7 Scale, plus the $9 blended price
- $0.60 COGS and about 93 percent gross margin
- the 25 and 380 packet break-even points and the $3,000 founder draw
- the 12-month packet ramp and the $195,000 year-one revenue

## 11. Honest limits

The ramp is a model, not a forecast backed by signed customers. The $9 blend
assumes Scale volume arrives on schedule. A slower sales cycle pushes every cash
milestone right. The $0.60 COGS tracks current model pricing and moves with
it. The BAA cycle can take weeks per enterprise buyer, which is the real gate on
the Scale tier and the main thing that would slow the ramp above.

## Sources

- AMA 2025 prior authorization physician survey. American Medical Association.
  https://www.ama-assn.org/about/leadership/latest-prior-auth-survey-shows-promised-reform-remains-elusive
- CAQH Index, manual versus electronic prior authorization cost, reported by
  Unlimited Systems. https://www.unlimitedsystems.com/blog/prior-auth-cost/ and
  CAQH CORE https://www.caqh.org
- Medicare Advantage prior authorization denials in 2022. KFF.
  https://www.kff.org/medicare/medicare-advantage-plans-denied-a-larger-share-of-prior-authorization-requests-in-2022-than-in-prior-years/
- Some Medicare Advantage Organization Denials of Prior Authorization Requests
  Raise Concerns About Beneficiary Access to Medically Necessary Care. HHS Office
  of Inspector General, OEI-09-18-00260.
  https://oig.hhs.gov/reports/all/2022/some-medicare-advantage-organization-denials-of-prior-authorization-requests-raise-concerns-about-beneficiary-access-to-medically-necessary-care/
