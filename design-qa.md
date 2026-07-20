# Design QA — Daylight Clubhouse site-wide rollout

## Final result

`passed`

## Test setup

- Source: `docs/design-references/padel-brazzers-homepage-daylight-clubhouse.png`
- Implementation: `qa/daylight-home-final-desktop.png`
- Viewport: `1487 × 1058`
- States: unauthenticated homepage, leaders, community, predictions gate, tournament detail, and admin gate
- Mobile viewport: `390 × 844`

## Comparison evidence

- Full source + implementation: `qa/daylight-home-comparison.png`
- Header and hero comparison: `qa/daylight-home-hero-comparison.png`
- Dashboard comparison: `qa/daylight-home-dashboard-comparison.png`
- Scroll-title state: `qa/daylight-home-scroll-title-final.png`
- Mobile state: `qa/daylight-home-mobile.png`
- Site-wide desktop states: `qa/site-final-leaders.png`, `qa/site-final-predictions.png`, `qa/site-final-tournaments-americano-brazzers-pro.png`, `qa/site-final-community.png`
- Inner-page scroll state: `qa/site-final-leaders-scroll.png`
- Site-wide mobile states: `qa/site-mobile-leaders.png`, `qa/site-mobile-predictions.png`, `qa/site-mobile-tournaments-americano-brazzers-pro.png`, `qa/site-mobile-community.png`
- Empty upcoming state + three leaders: `qa/site-final-home-empty-leaders.png`
- Mobile empty upcoming state: `qa/site-mobile-home-empty-leaders.png`

## Iteration history

1. **P1 — hero motion contradicted the new brief.** The previous cinematic implementation used a long sticky scene and expanded the image. Replaced it with a fixed `42/58` hero, native page scrolling, title separation/fade, compact sticky-header title, and an invariant image crop.
2. **P1 — source hierarchy was not preserved after stylesheet import order.** The hero title wrapped incorrectly and the leader surface lost its pink treatment. Added a final reference-specific layer after the existing stylesheet and matched the source hierarchy, dimensions, panel color, and first-screen density.
3. **P2 — brand/icon fidelity.** Replaced emoji and improvised marks with raster crops from the supplied reference for the PB logo, hero, leader portrait, arrows, bell, logout, and forecast icon.
4. **Final comparison — no remaining P0–P2 issues.** The unauthenticated controls and live tournament/leader data intentionally differ from the reference's authenticated demo state. This is expected product state, not a visual defect.
5. **P1 — internal screens retained the old isolated shell.** Extended the reference palette, edge-to-edge sticky header, condensed title hierarchy, pink feature surfaces, buttons, forms, tables, modals, and focus states to all existing route types.
6. **P2 — inner headers did not participate in the scroll language.** Added route-aware compact titles and title-led scroll transitions to leaders, predictions, tournament results/details, community, cabinet, and admin surfaces without scaling their imagery.
7. **P1 — homepage mixed past tournaments into the upcoming block.** Removed archive/demo fallbacks, filtered upcoming rows by tournament start time, and added an explicit empty-state. Replaced the single leader/promo stack with honest PRO, LITE, and forecaster leaders and changed the hero CTAs to working predictions/leaders routes.

## Final validation

- Typography: narrow display face, bold UI hierarchy, uppercase tracked rubrics, and two-line hero title verified.
- Spacing/layout: desktop hero ends at `625px`, image measures `862.45 × 541.01px`, dashboard starts immediately below, and no horizontal overflow is present.
- Colors/surfaces: warm paper background, near-black ink, dusty pink, and restrained gold verified across homepage, data tables, access gates, forms, cabinets, modals, and placeholder routes.
- Image/crop: branded player crop and pink/gold geometry match the reference. Image width and height are identical before and after scroll; only its page position changes with native scrolling.
- Scroll behavior: all desktop headers compact `84px → 68px`; each large page title transitions `1 → 0`; its route-aware compact title appears in the sticky header. Hero imagery keeps fixed dimensions.
- Copy/data: functional UI uses current prototype tournament and leader data; source labels and CTA structure are preserved.
- Interactions: homepage CTAs, tournament description, leaders PRO/LITE filter, navigation, and login modal were exercised successfully.
- Homepage data state: `0` upcoming rows, `3` leader slots, and both revised CTAs verified against live prototype data; routes resolve to `/predictions` and `/leaders`.
- Responsive: all tested routes at `390 × 844` have `0px` horizontal overflow; headings, tables/cards, CTAs, access gate, and hero imagery remain inside the viewport.
- Accessibility: visible focus styles and `prefers-reduced-motion` fallback are present; controls retain at least `44px` interaction height.
- Console: `0` errors during desktop, interaction, and mobile checks.
- Production build: Vite build completed successfully.
