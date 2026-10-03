# SkillTile

Skill Market card for an agent skill or workflow bundle; expands in place into setup and download details.

Static rendition of the tiles in `pages/SkillMarket.tsx`. The consumer supplies the listing (`kind`, `price`, `title`, `description`, `creatorId`, `lifecycle`, `version`, `downloads`, `weeklyDownloads`).

- Flat tile on `#14121b` with a `#36313f` border, radius 12px, 24px padding; 2-up grid.
- Meta row names the kind and price in caps; description clamps to 4 lines until expanded. Lifecycle and version always show, and download counts come only from real data.
- The expand button takes the `accent` colour when open.
