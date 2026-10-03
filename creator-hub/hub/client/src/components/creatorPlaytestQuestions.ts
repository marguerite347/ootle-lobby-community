// Preview-only scenarios; the production answer bank stays server-side.
export const creatorPlaytestQuestions: [string, string[], string][] = [
  [
    "Your Ootle racing game has ten leagues using one rules template. How do you isolate each leaderboard?",
    [
      "Create one component per league",
      "Create one bucket per league",
      "Point ten UIs at one score field",
      "Rename the template file ten times"
    ],
    "Each component has its own persistent state, even when several share the same template."
  ],
  [
    "A shop receives the right quantity of the wrong token. Which validation was missing?",
    [
      "Payment resource identity",
      "The sender’s signature only",
      "The amount after decimal rounding",
      "The token symbol only"
    ],
    "Check the resource address and quantity. Matching token symbols or amounts do not establish the correct asset."
  ],
  [
    "A win effect fires twice after a reconnect. How should reward settlement behave?",
    [
      "Resolve the same claim once",
      "Award again for each effect",
      "Trust the latest client balance",
      "Allow retries only from the same wallet"
    ],
    "Effects can replay. A stable claim identity and authoritative duplicate checks prevent double awards."
  ],
  [
    "A player can read the bundled Counter but cannot increment it. What is the likely reason?",
    [
      "Read and write access rules differ",
      "The read call granted temporary ownership",
      "Read and write calls require separate templates",
      "Rust pub automatically grants write access"
    ],
    "The bundled example explicitly allows public value reads while keeping other methods protected."
  ],
  [
    "Your loot purchase combines payment and item creation. Which failure test matters most?",
    [
      "Item creation fails after payment is attempted",
      "The buyer disconnects after confirmation",
      "The client requests the balance twice",
      "The buyer reconnects with the same wallet"
    ],
    "Verify the combined transaction does not leave a payment committed without the item when the operation fails."
  ],
  [
    "Your Ootle reward is pending, but the player’s jump should feel instant. What should happen?",
    [
      "Play local jump feedback; keep reward pending",
      "Block movement until settlement",
      "Confirm the reward when the jump lands",
      "Credit optimistically without reconciliation"
    ],
    "Game feel and authoritative rewards have different responsibilities. Immediate feedback need not imply a confirmed transfer."
  ],
  [
    "Every reward uses the same huge fanfare. Why does the jackpot feel small?",
    [
      "Routine rewards leave no contrast",
      "The reveal should last equally long for all drops",
      "Every payout should use the highest pitch",
      "All wins should use the same final chord"
    ],
    "Reserve the strongest presentation for the biggest outcomes so the progression has room to grow."
  ],
  [
    "Your quest secret sits in a public component field. What should you change?",
    [
      "The secrecy design, not just the UI",
      "The getter’s access rule alone",
      "The frontend’s access checks alone",
      "The component name and address display"
    ],
    "A hidden frontend label cannot conceal public application state. The game needs a deliberate secrecy mechanism."
  ],
  [
    "Your Riff adds a dash with a long cooldown. Which test best checks whether it creates interesting choices?",
    [
      "A small encounter with competing dash opportunities",
      "A long empty track that measures top speed",
      "A tutorial that explains the dash timing",
      "A simulation that measures only average cooldown"
    ],
    "A focused encounter reveals whether the player must choose when to dash instead of merely waiting for a timer."
  ]
];
