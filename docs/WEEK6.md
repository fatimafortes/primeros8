# WEEK 6 — When experience can be manufactured
*Chapter 5, My Haunting Idol · course context for the build. This file is the assignment text, not instructions written by me.*

---

## The need

To have lived it before it happens: rehearsal for a country that keeps being surprised by the same disasters.

**Timing verdict:** hardware just crossed the line. The Quest 3S launched officially in Mexico at MX$6,600. The content and the mandate are the vacuums.

**This week's lesson — POSSIBILITY INFLATION.** AI prints infinite scenarios; human bearing capacity didn't grow. The cure is collapse: three rehearsals, not three thousand simulations. This is also the product law forever: when your tool can generate everything, its value is choosing almost nothing. Three options. Never thirty.

**DRAGON MODE starts this week:** the stack must multiply, not add.

---

## The Crystal Ball Brief (condensed)

**The arrival state.** Synthetic experience becomes indistinguishable from memory. Lee's story uses it darkly: XR plus a dead idol, exploiting grief. Same technology, opposite sign: let people LIVE the earthquake before the earthquake.

**The country that drills more than anyone — and imagines nothing.**
- Mexico runs the largest drills on Earth; the 2025 Simulacro Nacional reported 8.1 million participants, 4,500 schools and 14,491 loudspeakers. The drills are announced in advance, same scenario, same hallway walk. Training does not become instinct.
- 1985: ~10,000+ dead. 2017: 369. Otis 2023: US$15.3B in losses, 88% of Acapulco businesses uninsured. The 2025 floods: 84 dead, 100,000 homes. The pattern is not lack of information; it is lack of lived experience before reality arrives.
- Insurance: only 4.5% of homes insured against earthquake/flood. Recovery runs on savings and remittances.
- The law is the distribution channel: every business, school and hospital must maintain a civil-protection program with documented drills and trained brigades, with fines up to ~MX$565,000. Compliance is bought at minimum cost; nobody measures whether training works.

*(Figures as printed in the course brief. Several were checked during Brain Bending and moved: the 8.1M and 4,500 schools are Mexico City's figures, the 4.5% dates from 2019, and the Quest went on sale in Mexico in May 2025. See BRIEF.md.)*

**The binding constraint.** It was hardware price; that broke. The constraint now is content + certification: no Mexican-scenario library, and no standard that recognizes VR training as legal compliance. Then it migrates to measurement: proving behavior change, which nobody has measured for ANY drill format.

**The vacuums.**
1. COMPLIANCE-UPGRADE — companies pay for mandatory training everyone knows is theater. Sell the version that isn't.
2. MEASUREMENT — zero data on whether drills change behavior. The first measurable rehearsal product defines the category.
3. FAMILY — schools drill children; nobody rehearses the family: where do we meet, who takes grandma, what if it's 3am.
4. INSURANCE-BRIDGE — insurers need risk reduction; 95% of homes uninsured; nobody connects rehearsal to premiums.

**Who pays.** The family in self-built housing on soft soil: least insured, least drilled, least able to move.

**FORBIDDEN ZONE.** You may NOT build "an earthquake information app." Information is not the failure; imagination is. Build rehearsal: lived experience, measured.

---

## Business Bending — what I'm building (55% of the week)

One working slice attacking my declared vacuum, honoring the Blueprint's conditions.

**Stack floor (DRAGON STACK REQUIRED):** simulation/3D/VR (WebXR or video-sim acceptable, labeled) + ML/adaptive logic + one more (vision, voice, geodata). Multiplicative, not additive.

### Steps

1. **Packet before code.** Built in a new conversation inside the same weekly LLM project, saved as `docs/PACKET.md`: problem in my words · exact user · success definition ("before the module closes, X works") · an image-generated mockup · the flow as a Mermaid diagram (a flowchart, plus a swimlane when more than one actor touches the process) · the benchmark line ("the best existing solution on Earth for this is ___; mine differs or localizes by ___") · the long-view paragraph (3 sentences: what the full product becomes in 3 years) · scope cut · architecture + stack table · test plan. No packet, no code.
2. **Implementation prompt.** Turn the packet into a precise build prompt for the coding agent: small testable features, acceptance criteria, commit plan.
3. **Build.** Minimum 5 commits, 2 deploys. Free stack only. Read the security floor BEFORE building. Simulated AI outputs labeled on screen. Every session ends with a Session Close: DECISIONS.md updated, tomorrow's first move noted, commit, push.
4. **Test, two documented passes.**
   - *Mechanical:* run the test plan, find at least one bug, fix it, redeploy.
   - *Persona test:* in a FRESH chat, spawn a synthetic user built from the User research, walk the persona through the product screen by screen, log every confusion, fix the worst one before the deadline.
5. **Demo video (3 min + 30 sec).** Walk the live URL as the user would; end with 30 seconds on what changed my mind this week.

### Security floor (every ship, no exceptions)

- No secrets in code or repo. API keys live in Vercel environment variables only.
- If the app stores anything personal, it has auth (Supabase Auth with Sign in with Google).
- Row Level Security ON for any Supabase table holding user data: a user sees only their own rows.
- Every form validates its input: length limits, type checks; nothing goes raw from a text box into the database or a prompt.
- No real personal data of real people in demos or seeds; invented data only, labeled.

Any floor item failed caps the ship at 7/10. A secret exposed in the repo or real personal data leaked caps it at 5/10 and must be fixed before grading.

### Turn in

Live URL + GitHub link + `DEMO_fatima.mp4` + `PACKET_fatima.pdf` + `PERSONA_fatima.pdf` (persona-test log: who the synthetic user was, where they got lost, what I fixed) + `BUILDCHAT_fatima.pdf` (full development back-and-forth).

### Grading (10 pts)

| Item | Points |
|---|---|
| It works at the URL | 4 |
| Packet-before-code evidence | 2 |
| Blueprint conditions honored (incl. shadow clause) | 2 |
| Test–fix–redeploy cycle | 1 |
| Build transcript depth | 1 |

No live URL → this item caps at 3.
