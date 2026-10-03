// Onboarding paths: "what do you want to build?" -> a recommended setup grounded
// in real, ingested resources. Native Ootle paths come first. Each path resolves
// to concrete catalog resources at request time (so new ingested records surface).
//
// A path never fabricates Tari compatibility for external engines; it labels them
// as general game/creative resources that can be composed alongside Ootle logic.

export const paths = [
  {
    id: 'ootle-onchain-game',
    goal: 'An on-chain game or interactive app on Tari Ootle',
    audience: 'Developers who want on-chain logic, tokens or state on Ootle testnet',
    ecosystem: 'tari-ootle',
    blurb: 'Start from an official Ootle WASM template, write your logic in Rust, test locally, and publish to the Esmeralda testnet.',
    preferredStarterId: 'tari-ootle:starter:examples-guessing-game-template',
    recommend: { ecosystem: 'tari-ootle', type: 'starter' },
    alsoExplore: { ecosystem: 'tari-ootle', type: 'app' },
    steps: [
      'Install Rust, the wasm32-unknown-unknown target, cargo-generate and the Tari Ootle CLI (`tari`).',
      'Create a workspace: `tari create my_game` then `tari add my_template` (choose a starter).',
      'Implement your template logic in Rust; write tests with `tari_template_test_tooling`.',
      'Run `cargo test` to compile to WASM and execute against the local engine.',
      'Publish via the Wallet Web UI ("Publish Template") using TTARI testnet funds.',
      'Publish the project in Ootle Lobby so others can discover and fork it.',
    ],
    learnTags: ['rust', 'wasm', 'template'],
  },
  {
    id: 'ootle-token-defi',
    goal: 'A token, stablecoin or DeFi primitive on Ootle',
    audience: 'Creators building fungible/NFT tokens, faucets or DeFi mechanics',
    ecosystem: 'tari-ootle',
    blurb: 'Use fungible/NFT/ICO/airdrop starters as a base for tokens and on-chain economies.',
    recommend: { ecosystem: 'tari-ootle', type: 'starter', tag: 'template' },
    alsoExplore: { ecosystem: 'tari-ootle', type: 'app' },
    steps: [
      'Pick a token starter (fungible, NFT, meme-coin, ICO or airdrop) from the catalog.',
      'Generate it with `tari create` / `cargo generate` and adapt the resource logic.',
      'Model issuance, sinks and transfers explicitly (see Economy Design in the hub).',
      'Test locally, then publish to testnet and list the app in the directory.',
    ],
    learnTags: ['token', 'defi', 'fungible'],
  },
  {
    id: 'nocode-2d-game',
    goal: 'A 2D game with no/low code',
    audience: 'Creators who prefer a visual editor over writing engine code',
    ecosystem: 'gdevelop',
    blurb: 'Start from a GDevelop example in the visual editor. General game resource — Ootle integration is a separate, evidence-based step.',
    recommend: { ecosystem: 'gdevelop', type: 'starter' },
    // Alphabetical ingest leads with folders named "3d …". Keep this goal on 2D examples.
    starterDimension: '2d',
    steps: [
      'Open the GDevelop editor (editor.gdevelop.io) or install the desktop app.',
      'Open a matching example project as your starting point.',
      'Iterate on scenes, objects and events; preview in the browser.',
      'To add Ootle on-chain features later, pair with an Ootle template (separate integration work).',
    ],
    learnTags: ['gdevelop', 'no-code', '2d'],
    external: true,
  },
  {
    id: 'voxel-mod',
    goal: 'A voxel game or a mod for one',
    audience: 'Creators interested in sandbox/voxel worlds and modding',
    ecosystem: 'luanti',
    blurb: 'Start from a Luanti game or mod from ContentDB. General ecosystem resource, not a verified Ootle integration.',
    recommend: { ecosystem: 'luanti', type: 'starter' },
    alsoExplore: { ecosystem: 'luanti', type: 'component' },
    steps: [
      'Install the Luanti engine and a base game.',
      'Browse ContentDB for a game or mod to build on.',
      'Use the Lua API and Modding Book to extend it.',
      'Share your work back to ContentDB; document dependencies and license.',
    ],
    learnTags: ['luanti', 'voxel', 'mod'],
    external: true,
  },
  {
    id: 'learn-first',
    goal: 'I want to learn Ootle before building',
    audience: 'Newcomers who want orientation, privacy and composability concepts first',
    ecosystem: 'tari-ootle',
    blurb: 'Begin with the Ootle Playground guides and a tested first-build walkthrough, then pick a starter.',
    recommend: { ecosystem: 'tari-ootle', type: 'starter' },
    steps: [
      'Read the Ootle Playground CLI guide and the "Build a Guessing Game" walkthrough.',
      'Follow one end-to-end tested path: create, test, publish.',
      'Then choose a starter that matches what you want to make.',
    ],
    learnTags: ['wasm', 'template'],
    resources: [
      { title: 'Ootle Playground — CLI guide', url: 'https://ootle.tari.com/guides/cli/' },
      { title: 'Ootle Playground — Build a Guessing Game', url: 'https://ootle.tari.com/guides/build-a-guessing-game/' },
      { title: 'Ootle Playground — Publishing Templates', url: 'https://ootle.tari.com/guides/publishing-templates/' },
    ],
  },
];

export function pathById(id) {
  return paths.find((p) => p.id === id) || null;
}
