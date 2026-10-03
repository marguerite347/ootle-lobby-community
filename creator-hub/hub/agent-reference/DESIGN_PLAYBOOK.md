# Game design playbook

Reference for agents building games on Ootle Lobby. Start with
[Agent Start](/agent-start.md); read this when you're designing the core loop,
choosing a genre or mashup, or adding any resource economy.

## Design one strong game loop

Write the loop as player action → game response → consequence → next decision.
State the objective, available actions, challenge, feedback, success/failure and
restart. Explain what makes the next attempt interesting. Choose one meaningful
change for the first playable, then expand only after that change works.

For a puzzle, specify the rule, a teachable first situation and a solvable test
case. For an action game, specify movement, collision, readable threats, damage
and recovery. For a score or reward game, define the arithmetic, authoritative
state and the moment the result becomes final before adding spectacle.

Write observable acceptance criteria. For example: “Rotating this mirror sends
the pink beam to the final flower, the completion state appears once, and Restart
restores the original puzzle.” “Make it fun” is a direction, not a test.

Plan a first-session arc: understand → try → learn → achieve → choose what comes
next. Avoid explaining every rule before the first interaction. Teach through
clear affordances, readable feedback and a manageable opening challenge.

Output: a concise game brief, the first playable scope, an explicit out-of-scope
list and a small set of repeatable acceptance scenarios.

### Choose a genre through the player's decisions

A genre is a starting set of design constraints, not a feature checklist or a
quality guarantee. Choose the **primary activity** the player should enjoy,
the timescale of their decisions, and the smallest situation that proves it.
Use the [genre reference library](/agent-docs/creator-hub/GENRE_REFERENCE_LIBRARY.md)
for concrete examples and accessible source/license evidence. Discover any
catalog IDs through the live API; do not invent IDs or assume a reference's art,
code, music and trademarks all have the same reuse rights.

The following 25 families overlap. Use as many influences as serve the creator's
idea, and identify how they connect. Read the matching genre/engine skills and explain the
applied decision rather than claiming expertise from this table alone.

| Family | Core decisions and scarce resources | Starting experiment and questions to explore | Reference studies |
| --- | --- | --- | --- |
| Puzzle / logic | Deduce rules; spend moves, space or limited transformations. | One teachable rule, one solvable challenge and reset/undo where appropriate. Distinguish insight from guessing; verify solvability and avoid hidden rules. | [Portal 2](/resource/genre-reference%3Aportal-2) |
| Action / arcade | React, position and commit under pressure; manage health, cooldowns or exposure. | One readable threat and a satisfying evade/counter loop. Test telegraphs, recovery and input latency before adding enemies. | [Hades](/resource/genre-reference%3Ahades), [Vampire Survivors](/resource/genre-reference%3Avampire-survivors) |
| Platformer | Choose route, jump timing and momentum; spend safety or limited movement abilities. | One complete traversal with reliable landing and recovery. Tune collision, camera and forgiving input windows; precision must survive target devices. | [Celeste](/resource/genre-reference%3Aceleste), [Spelunky 2](/resource/genre-reference%3Aspelunky-2) |
| Shooter | Aim, reposition, prioritize and reload; spend ammunition, cover and time. | One weapon, one distinct enemy and a complete encounter. Verify hit feedback and threat readability; touch aiming needs its own proof. | [DOOM Eternal](/resource/genre-reference%3Adoom-eternal) |
| Roguelike / run-based | Adapt a build and route to uncertain encounters; manage run health, consumables and risk. | One short run with consequential choices and a fair reset. Generation needs validated constraints; permadeath and permanent upgrades are optional, separate decisions. | [Hades](/resource/genre-reference%3Ahades), [Spelunky 2](/resource/genre-reference%3Aspelunky-2) |
| Deckbuilder / card game | Select synergies, manage draws and sequence effects; spend hand, deck slots and turn resources. | Small card pool with competing strategies and a deterministic rules test. Check effect order, dead hands, infinite loops and dominant combinations. | [Slay the Spire](/resource/genre-reference%3Aslay-the-spire), [Balatro](/resource/genre-reference%3Abalatro) |
| RPG | Develop capabilities, choose tactics or relationships, and pursue goals; spend equipment, skills and consumables. | One quest and encounter with an observable build or narrative consequence. Avoid empty stat growth, grind and content scope that exceeds the core loop. | [Baldur's Gate 3](/resource/genre-reference%3Abaldurs-gate-3) |
| Strategy | Allocate production, territory and information over a wider horizon. | One map and competing expansion/defense choices. Check runaway leaders, readable causality and a plausible recovery path. | [Age of Empires II: Definitive Edition](/resource/genre-reference%3Aage-of-empires-2), [Sid Meier’s Civilization® VI](/resource/genre-reference%3Acivilization-6) |
| Tactics | Position and sequence a few units or actions; spend action points, range and cover. | One encounter with visible consequences before commitment. Test initiative, line of sight and stalemates; hidden arithmetic should not decide an apparently safe move. | [Into the Breach](/resource/genre-reference%3Ainto-the-breach) |
| Tower defense | Place, upgrade and time defenses; allocate space, build currency and lives. | One path, contrasting defenses and a few authored waves. Check coverage, affordable responses and whether one placement solves everything. | [Bloons TD 6](/resource/genre-reference%3Abloons-td-6) |
| Simulation | Learn a model and intervene in its systems; manage energy, capacity or state. | One cause-and-effect system with controllable inputs and understandable outcomes. Decide what is abstracted; realism without readable feedback can feel arbitrary. | [Stardew Valley](/resource/genre-reference%3Astardew-valley) |
| Management / tycoon | Balance throughput, staffing, investment and demand; manage budgets and bottlenecks. | One production/service chain with a tradeoff and recoverable shortage. Check feedback delays, debt traps and whether waiting substitutes for decisions. | [Factorio](/resource/genre-reference%3Afactorio), [DAVE THE DIVER](/resource/genre-reference%3Adave-the-diver) |
| Survival / crafting | Prepare, explore and convert resources; spend health, warmth, durability and supplies. | One gathering → crafting → survival challenge → replenishment loop. Avoid irreversible softlocks and compulsory repetitive chores. | [Terraria](/resource/genre-reference%3Aterraria) |
| Sandbox / building | Express intent through construction and experimentation; manage space, materials or complexity. | One expressive tool, a useful undo and a saved creation. Provide goals or affordances without removing freedom; verify save/export integrity. | [Terraria](/resource/genre-reference%3Aterraria), [Factorio](/resource/genre-reference%3Afactorio) |
| Rhythm / music | Anticipate and execute a pattern; manage timing accuracy and recovery. | One short chart with calibrated input/audio timing and retry. Test device latency and alternatives to sound-only cues; visual polish cannot fix bad synchronization. | [Beat Saber](/resource/genre-reference%3Abeat-saber), [Crypt of the NecroDancer](/resource/genre-reference%3Acrypt-of-the-necrodancer) |
| Racing / driving | Trade speed for line, grip and risk; manage momentum, boost and track position. | One short course and repeatable lap with reset. Verify handling and readable braking cues before AI opponents or vehicle collections. | [Forza Horizon 5](/resource/genre-reference%3Aforza-horizon-5) |
| Sports | Position, time and combine a small rule set toward a competitive objective. | One playable drill or compact match with a clear result. Fairness, opponent behavior and responsive possession/contact matter more than roster size. | [Rocket League®](/resource/genre-reference%3Arocket-league) |
| Narrative / adventure | Explore, interpret and choose consequences; manage clues, trust and opportunities. | One scene or mystery with meaningful state change and a reachable conclusion. Prevent false choices, lost clues and branch growth that cannot be authored/tested. | [Disco Elysium - The Final Cut](/resource/genre-reference%3Adisco-elysium) |
| Party / social / co-op | Coordinate, bluff or compete around shared understanding and attention. | One round with joining, role clarity, result and replay. Test actual participant count, downtime and information visibility; remote networking is a separate capability. | [Overcooked! 2](/resource/genre-reference%3Aovercooked-2) |
| Idle / incremental | Choose investments and reset timing; manage production rates, automation and growth thresholds. | A short active-to-automated loop with a meaningful upgrade choice. Check offline accrual, caps, number growth and whether return visits offer choices rather than only larger numbers. | [Cookie Clicker](/resource/genre-reference%3Acookie-clicker) |
| Fighting / brawler | Read an opponent, control spacing and commit to attacks; spend stamina, advantage and openings. | A small move set with a clear counter relationship and recovery. Test input buffering, readability and repeatable exploits before expanding moves or characters. | [Street Fighter™ 6](/resource/genre-reference%3Astreet-fighter-6) |
| Stealth / horror | Gather information and choose exposure, escape or confrontation; manage noise, safety and limited tools. | One patrol or threat with a learnable detection rule and recovery. Distinguish intentional uncertainty from unreadable punishment; preserve the intended horror intensity; make any comfort controls optional player choices and test the full experience first. | [Mark of the Ninja: Remastered](/resource/genre-reference%3Amark-of-the-ninja), [Inscryption](/resource/genre-reference%3Ainscryption) |
| MOBA | Coordinate roles, lanes, objectives and timing; allocate map control, experience, cooldowns and team resources. | One local lane/objective scenario with readable roles and counterplay. Full competitive play adds authoritative networking, matchmaking, disconnect handling, anti-cheat and continuous balance; bots do not prove human team play. | [Dota 2](/resource/genre-reference%3Adota-2) |
| Battle royale | Choose landing, loot, engagement and rotation under shrinking safe space; spend information, supplies and positional safety. | A small local encounter testing rotation versus combat risk. Population scale, fair spawning/loot, spectators, latency and cheating are major additional systems; a tiny bot arena is not a verified large-player match. | [PUBG: BATTLEGROUNDS](/resource/genre-reference%3Apubg) |
| MMO / persistent world | Pursue social, exploration and progression goals across sessions; allocate shared resources, persistent inventory and group opportunities. | A bounded local world/quest and persistence proof before any multi-user claim. Shared authority, transactions, migration, moderation, abuse prevention, availability and operating cost require an explicit service plan; a saved single-player world is not an MMO. | [Guild Wars 2](/resource/genre-reference%3Aguild-wars-2) |

MOBA, battle royale and persistent-world references can inform a small solo-built
prototype without committing to their production scale. Networking and live
operations are not the solo default or an implied part of genre selection. A
real multiplayer scope needs an authorized hosting/operations owner, budget,
target concurrency, latency model, authoritative state, reconnect/persistence
contract and appropriate safety/abuse handling. Test the promised participant
count and conditions; label local, simulated or bot-based trials accurately.
Do not promise commercial-scale service quality from a single-machine demo.

For each candidate, answer: what can the player predict, what remains uncertain,
what scarce resource makes the choice matter, and what will they learn from
failure? Develop the chosen genre; compare alternatives when the creator wants
help choosing, rather than making that a prerequisite. Match session length, target input and available
content budget. A twenty-second loop and a twenty-hour campaign need different
progression and save contracts even within the same genre.

### Explore genre combinations through play

Use the proposed mashup as a starting point. Explore how its systems can change
each other and make that connection playable:

1. **Anchor:** name the primary verb and player fantasy. Identify the interaction that best expresses the combined idea.
2. **Contribution:** specify exactly what the secondary genre adds, such as
   card drafting changing next encounter tactics. Decide whether the systems overlap, alternate or form distinct connected phases.
3. **Shared constraint:** identify a resource, state or consequence crossing the
   boundary. Show an example: “Spend the last action point to move to cover, or
   play the drawn attack and accept exposure.” Connections may be mechanical, expressive or narrative; test the intended payoff.
4. **Compatibility:** compare decision speed, inputs, information load, failure
   cost, session length, camera/UI space, fairness and content demands. Decide
   whether strategic choices pause action or happen between encounters. Test
   the awkward transition, not just each system separately.
5. **Economy and reset:** define which rewards cross systems and which reset.
   Check that success in one cannot trivialize the other through compounding
   power, free conversion loops or unlimited grinding.
6. **Trial and evolve:** build a representative interaction between systems.
   Use confusing inputs, waiting, surprising strategies and player feedback as
   evidence for the next iteration, not reasons to reject the concept in advance.
   After approval where required, play a base version and the combined version
   on the same scenario; report observed differences without claiming causality
   or broad player preference from a tiny sample.

Examples are starting points to adapt, extend or combine:

| Combination | Useful connection to test | Compatibility risk / smallest trial |
| --- | --- | --- |
| Tactics + deckbuilding | Drawn actions change positioning and turn plans. | Random draws may erase tactical agency. Use a small deck and a basic fallback action in one encounter. |
| Racing + roguelike choices | A between-race upgrade changes the next risk/reward line. | Upgrades may overwhelm driving skill. Test one short course with two distinct handling tradeoffs. |
| Puzzle + survival | Solving a spatial problem conserves a scarce survival resource. | Time pressure may undermine deliberate reasoning. Test one puzzle with clearly signaled pressure and a recoverable failure. |
| Rhythm + action | Beat timing changes attack/recovery opportunities. | Device latency and two timing demands can make failure opaque. Test one enemy/pattern with readable timing feedback. |
| Management + narrative | A staffing/resource decision changes a character's next situation. | Branching content can multiply faster than systems. Test one decision with two visible consequences and reconvergence. |
| Idle + strategy | Automation frees attention for a new allocation decision. | Waiting or permanent accumulation may replace strategy. Test a short growth/reset cycle with competing investments. |

Novel combinations are welcome; turn that curiosity into a playable experiment. Preserve a single
first-session explanation and obvious next action. Multiplayer, procedural
content, crafting, monetization and permanent progression are each additional
systems with costs; none is required to make a mashup interesting.

### Design the economy of choices, even without money

An economy is how scarce resources enter, move through and leave the game.
Currency can be ammunition, stamina, time, action points, health, heat capacity,
board space, inventory slots, cards, information, trust or an opportunity to act.
Some resources are discrete counters; others are constraints or state changes.
Model only what creates a meaningful choice. Score measures an outcome unless
it is actually spendable; do not quietly treat it as currency. Separate local
fictional resources, AI Sparks and native TARI or external value.

Create a compact resource ledger before tuning:

| Field | Question to answer |
| --- | --- |
| Purpose / unit | What decision does this resource constrain, and how is it measured? |
| Source | What action, event or elapsed time creates it? Specify amount, frequency, caps and randomness. |
| Sink / commitment | What consumes, locks or sacrifices it? Is the cost paid on attempt, success or completion? |
| Storage / conversion | What are its minimum, maximum, overflow and rounding rules? Can it convert into another resource, at what rate and in which direction? |
| Ownership / settlement | Who owns the authoritative state, when is a result final, and how are repeated inputs or retries deduplicated? |
| Visibility / feedback | Can the player predict affordability and understand the change? Show both the action acknowledgment and settled balance. |
| Reset / persistence | Does it last for an action, encounter, run or account? What survives defeat, victory, restart, reload and offline time? |
| Recovery / abuse | Can depletion make the game unwinnable? Can waiting, farming, repeated reloads or conversion cycles produce unintended advantage? |

For countable resources, start with a balance identity:
`next = current + granted - consumed`, followed by the specified cap/overflow
rule. Transfers should conserve total value unless an explicit source, sink,
fee or conversion changes it. A regeneration mechanic may be the source for
stamina while using an action is its sink; a health pickup is a source while
damage consumes health. Inventory capacity creates an opportunity cost even
when no number is spent. State which resources are intentionally nonrenewable.

Keep **power progression**, **new options/content**, **cosmetic/status rewards**
and **player mastery** distinct. An upgrade that only increases numbers can
invalidate challenge rather than expand choices. Define the progression curve
and its reset boundary: per-encounter refill, whole-run reset, optional prestige
exchange, or persistent unlock. Explain what is lost and kept before a player
commits to a reset; never erase unrelated creator progress. A short arcade game
can use a score and replay goal without permanent upgrades or a shop.

Balance against decision quality and the intended pacing, not a universal target
ratio. Estimate affordable actions before replenishment, time to the first
useful upgrade, survival margin, and the range of rewards under plausible play.
For random outcomes, expected value alone is insufficient: inspect variance,
worst useful outcomes and streaks, and verify recovery. Mark proposed values as
tuning hypotheses until played. Simulations can expose arithmetic or extreme
strategies; they do not establish fun or demand.

Minimum checks, chosen proportionally to the actual rules:

- **Conservation and boundaries:** no unintended negative balance, overflow,
  rounding drift, double settlement or reward after a result is final.
- **Affordability and recovery:** first useful action is reachable; spending to
  zero or losing a resource does not create an unintended softlock. Check the
  poorest plausible state, not only a generously funded fixture.
- **Dominance and exploits:** compare cautious, aggressive, hoarding and
  repetitive strategies. Look for a choice that is always best, no-cost farming,
  positive conversion cycles, and power feedback that makes the leader untouchable.
- **Progression and reset:** victory, defeat, retry, reload and any offline grant
  preserve exactly the intended state. Test reset confirmation and cancellation
  when persistent resources are affected; test duplicated claims separately.
- **Pacing and comprehension:** observe whether the player understands why they
  can/cannot act, what they spent, what they earned and the next meaningful choice.
  Check early, middle and late states, plus the extremes of supported tuning.
- **Coupled systems:** test whether an imported mashup resource bypasses a core
  challenge or makes another currency worthless; include both conversion directions
  and each system's reset boundary.

For a tiny game, this can be a few ledger rows and a handful of rules tests.
Exclude monetization, trading or network settlement unless requested. If they
are requested, they require their own current requirements, authority and
security review; a local score animation does not implement them.

Add to the design brief: primary genre; supporting influence or none; referenced
mechanic and observed evidence; player decisions; resource ledger; progression
and reset policy; one mashup trial if relevant; out-of-scope systems; acceptance
and removal criteria. If the creator requested design approval, present this
brief now and keep implementation, installation and asset generation paused.
