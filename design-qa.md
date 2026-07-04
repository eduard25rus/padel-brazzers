final result: passed

source visual truth path:
- /Users/eduard25rus/Downloads/Сгенерированное изображение 2 (2).png
- /Users/eduard25rus/Downloads/Сгенерированное изображение 1 (3).png
- /Users/eduard25rus/Downloads/IMG_2717.PNG
- /Users/eduard25rus/Downloads/IMG_2716.PNG
- /Users/eduard25rus/Desktop/Снимок экрана — 2026-07-03 в 14.54.04.png

implementation screenshot path:
- Computer Use capture, Chrome, 127.0.0.1:4173/predictions/forecast-qa, desktop-like window.
- Computer Use capture, Chrome, 127.0.0.1:4173/predictions/forecast-qa, mobile-like narrow window.
- Computer Use capture, Chrome, 127.0.0.1:4173/predictions/forecast-mobile-qa, narrow window after compact mobile overrides.
- Computer Use capture, Chrome, 127.0.0.1:4173/predictions/forecast-open-qa, desktop window with open forecast composition state.
- Computer Use capture, Chrome, 127.0.0.1:4173/predictions, narrow window with split upcoming/completed forecast registry.

viewport:
- Desktop-like Chrome window: page shows header, forecaster carousel, unified forecast/fact table, right summary panel.
- Mobile-like Chrome window: narrow layout shows title, horizontal forecaster cards, selected forecaster summary, unified forecast/fact split table.

state:
- Authenticated QA user.
- Completed forecast tournament with five forecasters and eight final-standing rows.
- Selected forecaster: Eduard.

full-view comparison evidence:
- Desktop reference expects results header, forecasters above tables, one main comparison table, and a right-side summary/filter rail. Implementation matches this structure and preserves the existing green club visual system.
- Mobile reference expects large horizontal forecaster cards above the table, selected-person summary, and a single split forecast/fact table. Implementation matches the structure and keeps the right fact column inside the same row group.

focused region comparison evidence:
- Forecaster carousel: desktop uses compact ranked chips; mobile uses large cards with rank, name, points, and exact-hit count.
- Main table: desktop rows show predicted place, predicted player, pale fact metadata, earned points, and accuracy badge. Mobile rows show forecast on the left and actual rank/player on the right.
- Summary/filter rail: desktop includes selected forecaster identity, stats, bonuses, filters, and reset action. Filter buttons are interactive.

findings:
- No P0/P1/P2 issues found in the checked desktop and mobile states.
- Latest pass: mobile forecast results no longer use oversized carousel/table typography; fact names truncate instead of stacking vertically.
- Latest pass: desktop forecast composition seed-board player names render as readable row text instead of single-letter columns.
- Latest pass: forecast registry separates upcoming and completed tournaments; upcoming CTA uses a red "Прием прогнозов" treatment.
- Latest pass: completed forecast results open on the logged-in user's card and center it in the forecaster carousel.
- Latest pass: page-level horizontal overflow is locked, and the mobile account/admin controls wrap into a compact header block.
- Latest pass: future tournament pages opened from "Турниры" now show an overview with roster, forecast CTA, and participant predictions instead of forecast scoring conditions.
- Latest pass: saved forecasts render as a muted locked list until the user presses "Редактировать".
- Latest pass: tournament overview removes the duplicate hero forecast CTA, uses only tournament-facing hero metrics, and places the participant roster directly below the red forecast button.
- Latest pass: mobile tournament overview keeps the roster workspace visible instead of hiding it with the forecast-editor mobile rule.
- Latest pass: mobile leaders page uses a single-column layout with compact hero, period buttons, stacked summary cards, and card-style leader rows.
- Latest pass: forecast editing after roster changes now shows replacement players and lets users swap a departed player in-place before saving.

patches made since previous QA pass:
- Replaced the old separated final-table/breakdown/leaderboard results layout with a unified results matrix.
- Moved forecaster selection above all tables as a horizontal carousel.
- Added desktop right-side summary, bonuses, filters, and reset.
- Added mobile selected-forecaster summary and split forecast/fact rows.
- Hid the old tournament hero on completed forecast result pages so the results page starts immediately after navigation.
- Tuned mobile text wrapping in the fact column and summary card.
- Tightened seed-board desktop columns, rank/avatar/rating sizing, and name wrapping for the forecast composition page.
- Added final mobile overrides at the end of the stylesheet so legacy duplicate media blocks cannot re-enlarge the results page.
- Reworked the mobile results row to mirror the desktop structure: forecast player plus muted fact line, with only earned points on the right.
- Split the forecast registry into upcoming and completed sections with a clearer red call-to-action for open forecast intake.
- Centered the current user's result card in the completed-results carousel.
- Added tournament-overview forecast CTA blocks and muted saved-forecast styling.
- Added mobile wrapping rules for the authenticated user controls and page-level horizontal overflow protection.
- Simplified the future tournament hero for the "Турниры" entry path and made the overview roster a vertical list.
- Removed the duplicate overview CTA block so the participant roster follows the red forecast card directly on mobile.
- Added a late mobile override for the leaders page so desktop table widths no longer override the phone layout.
- Added in-place replacement controls for invalid forecast slots, with a highlighted new participant and a short replacement animation.

follow-up polish:
- Replace the temporary PB mark with the final club logo asset if a real logo file becomes available.
- If exact mobile viewport QA is needed later, capture with a browser automation runtime that can save file-backed screenshots.
