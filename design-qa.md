final result: passed

Checked against the selected green Tennis Club Light direction.

- Desktop viewport: passed. Main composition matches the chosen direction: hero photo, PRO metadata, standings, league leader cards, round 7, tournament stories, and full description panel are present.
- Mobile viewport: passed. No document-level horizontal overflow; standings table uses compact mobile columns.
- Interactions: passed. Full description opens/closes. Round selector changes both the four court results and the intermediate standings after that round. Images load successfully.
- Home screen: passed. Welcome hero, PRO/LITE registry, leaders, and format notes render in the selected green club style.
- Navigation: passed. Clicking a tournament opens the correct detail card; "Все турниры" returns to the registry.
- Americano PRO: passed. The 4th PRO tournament is present in the registry, opens a dedicated individual-score card, shows 12-player final standings, and switches 11 rounds with 3 courts per round.
- Mexicano LITE: passed via build. The LITE registry now contains the new real tournament, opens a dedicated Mexicano card, shows final individual standings, 11 rounds, and the requested important notes about Eduard Shevchenko and Nikita Kamenny.
- Public standings: passed. No team row is specially highlighted in the final public table.
- Build: passed via Vite production build.

Known P3 polish for a future pass:
- Replace generated generic tournament photos with real event photography when available.
- Add real player portraits once the player media library exists.
