// Application questions grounded in pinned repo guides. See CREATOR_TRIVIA.md.
export const CREATOR_QUESTIONS = [
  [
    "Two arenas use the same Ootle template but need separate scores. What should you create?",
    [
      "Two component instances",
      "Two vaults for the same component",
      "Two indexers for one component",
      "Two wallet sessions"
    ],
    "A template supplies code; separate component instances hold independent state."
  ],
  [
    "Your Ootle shop accepts payment, then item creation panics in the same transaction. What should your test expect?",
    [
      "Neither change is committed",
      "Payment remains; the item is retried",
      "The client chooses which change remains",
      "A second transaction refunds automatically"
    ],
    "A panic fails the transaction. Test that both the payment and item state remain unchanged."
  ],
  [
    "A player buys an item using a resource bucket. Where should the shop keep the payment afterward?",
    [
      "In a vault for that resource",
      "In a saved bucket ID",
      "In the displayed wallet total",
      "In the template ABI"
    ],
    "Buckets carry resources during execution. Vaults hold resources persistently."
  ],
  [
    "A rare sword needs its own identity and upgrade history. Which model best fits?",
    [
      "A non-fungible resource",
      "One fungible unit with a shared symbol",
      "A template address per owner",
      "A wallet balance label"
    ],
    "An individually identified item fits a non-fungible resource; its update and transfer rules still need deliberate design."
  ],
  [
    "In the bundled Counter, value is public and other methods default to deny. An unrelated signer calls increment. What should happen?",
    [
      "Authorization rejects the call",
      "The public read grants write access",
      "Any signer may call a Rust pub method",
      "The indexer approves the write"
    ],
    "The example separates public reads from protected writes. Rust visibility does not replace component access rules."
  ],
  [
    "You publish a template for a persistent tournament. What is still needed before it can hold tournament state?",
    [
      "Create a component instance",
      "Add a second indexer",
      "Sign a read-only query",
      "Register a token symbol"
    ],
    "Publishing code and creating an instance are different steps. A persistent tournament needs its component state."
  ],
  [
    "Two community templates both expose buy. What must you check before composing them?",
    [
      "ABI, resource types and behavior",
      "Only that method names match",
      "Only that both compile to WASM",
      "Only that both use the same token symbol"
    ],
    "Matching names do not prove compatible arguments, authorization or resource semantics. Test the combined operation."
  ],
  [
    "A reward animation finishes while its transaction is pending. What should the wallet show?",
    [
      "Confirmed balance, with a pending reward",
      "The final balance as confirmed",
      "A new balance derived from the animation",
      "A retry button that submits immediately"
    ],
    "Input and presentation can respond immediately. Confirmed holdings must follow the authoritative result."
  ],
  [
    "A player retries a timed-out achievement claim. Which design prevents awarding it twice?",
    [
      "An authoritative claim ID checked once",
      "Disabling only the browser button",
      "Waiting for the confetti to finish",
      "Giving each retry a new claim ID"
    ],
    "Retries should resolve the same claim. Enforce duplicate protection in authoritative state, not just the UI."
  ],
  [
    "Your combat game feels slow because each hit waits for a reward transaction. What is the better boundary?",
    [
      "Local hit feedback; authoritative reward settlement",
      "Submit every animation frame",
      "Treat the sound cue as settlement",
      "Skip reward validation during busy fights"
    ],
    "Keep responsive input and effects separate from the state transition that decides whether a reward is valid."
  ],
  [
    "Your shop checks the payment amount but not its resource address. What can go wrong?",
    [
      "It may accept the wrong asset",
      "Equal symbols guarantee interchangeable assets",
      "The amount check also verifies resource identity",
      "The wallet signature proves the asset type"
    ],
    "A numeric amount is not asset identity. Verify the required resource as well as the amount."
  ],
  [
    "You want a hidden puzzle solution. Is storing it in public component state sufficient?",
    [
      "No; public state exposes the solution",
      "Yes; WASM hides all component fields",
      "Yes; a private frontend variable protects it",
      "Yes; only the owner can inspect public state"
    ],
    "Design secrecy explicitly. Running a game on Ootle does not make public application state private."
  ],
  [
    "A creator changes reward odds and the explanation text, but not settlement logic. What is the main problem?",
    [
      "The displayed rules disagree with actual outcomes",
      "The animation becomes authoritative",
      "The vault changes its resource type",
      "The template automatically republishes"
    ],
    "Presentation, configured probabilities and authoritative settlement must describe the same reward rules."
  ],
  [
    "A legendary drop feels ordinary. Which change improves its impact without changing its odds?",
    [
      "Contrast its reveal with quieter routine rewards",
      "Make every drop equally loud",
      "Show the jackpot before resolving the result",
      "Add more clicks before collecting"
    ],
    "Contrast makes rare outcomes feel special. Scale motion and audio after the result, without altering reward accounting."
  ],
  [
    "Players cannot tell whether they hit a shield or missed. What should you improve first?",
    [
      "Distinct feedback for each outcome",
      "A damage increase to offset unclear misses",
      "A slower attack animation for every outcome",
      "A larger shield health pool"
    ],
    "Different outcomes need readable feedback. Fix the information gap before changing combat balance."
  ],
  [
    "A Riff changes a movement rule. What is the most useful first test?",
    [
      "A short level built around that rule",
      "A balance spreadsheet without player input",
      "A large level that mixes many new mechanics",
      "A graphics pass before testing the new rule"
    ],
    "Build a focused playable test that exposes the changed decision and its edge cases before expanding scope."
  ],
  [
    "A deployer can increment Counter successfully. What does that prove about other players?",
    [
      "Nothing yet; test unrelated signers",
      "Every signed wallet has write access",
      "Public reads imply public writes",
      "All methods are permissionless"
    ],
    "An owner success does not establish public access. The bundled tests check an unrelated signer separately."
  ],
  [
    "You add an on-chain achievement to a fast platformer. Which part belongs in the authoritative claim path?",
    [
      "Eligibility and whether it was already claimed",
      "Every particle position",
      "The camera shake envelope",
      "Every sound sample played"
    ],
    "Keep enforceable ownership and claim rules authoritative; rendering, audio and input feedback remain presentation."
  ]
];
