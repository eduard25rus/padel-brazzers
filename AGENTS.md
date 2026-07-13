# Prototype Instructions

Run the local server yourself and open the preview in the in-app browser. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Tournament Video Recognition

For recurring requests like "распознай турнир" with a screen recording:

This workflow is mandatory before giving the user an Excel file. Do not skip the server import validation even if the workbook opens in Excel/Numbers/LibreOffice.

1. Start by extracting frames every 0.5 seconds (2 fps) with the local AVFoundation extractor. Compile once when needed:
   `clang -fobjc-arc -framework Foundation -framework AVFoundation -framework AppKit -framework CoreMedia scripts/extract_video_frames.m -o outputs/extract_video_frames`
2. Run it as:
   `outputs/extract_video_frames "/absolute/path/to/recording.mp4" outputs/frames-YYYY-MM-DD 2`
3. Review frames in order, then keep only visually distinct screens for recognition: tournament header, roster/ratings, every round score screen, final standings, and rating deltas. When a score card is partially hidden or ambiguous, inspect adjacent 0.5-second frames instead of guessing.
4. For OCR, compile the local Vision helper once when needed:
   `clang -fobjc-arc -framework Foundation -framework AppKit -framework Vision scripts/ocr_images.m -o outputs/ocr_images`
   Then run it on selected PNG frames and save NDJSON for audit.
5. On score cards, treat the visual rows as the teams. Apple Vision may return names column-by-column (`top-left`, `bottom-left`, then `top-right`, `bottom-right`), so do not infer teams from OCR order alone.
6. Cross-check reconstructed matches against the final statistics screen. Wins, losses, points for, points against, and delta must match the final stats screen. If they do not match, keep investigating frames instead of silently shipping; only use the final `standings` values as the source of truth after recording the unresolved match uncertainty in `validation` and telling the user.
7. For a full individual Americano partner rotation, validate the partner matrix before delivery: with 16 players and 15 rounds, each player must have 15 unique partners and no repeated partner. A duplicate partner means the score-card pairing was parsed incorrectly and must be fixed before import. Do not apply this no-repeat rule to extended schedules with more rounds than possible unique partners; reconcile those matches against the final statistics instead.
8. Build the final Excel strictly against `docs/results-import-format.md` (`PB_RESULTS_IMPORT_V1`) with required sheets: `readme`, `meta`, `participants`, `matches`, `standings`, `insights`, `validation`.
9. Use the project importer's sheet names and column names exactly. Before delivering, verify the workbook with the same parser the website uses:
   `/Users/eduard25rus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node server.mjs --validate-results-import "/absolute/path/to/file.xlsx"`
10. Do not deliver any `.xlsx` if validation says required sheets are missing, `format_version` is wrong, there are zero matches/standings, duplicate partners in individual Americano, or the preview summary does not match the tournament (player count, match count, rounds, winner).
11. Always include exactly four primary insights unless the user explicitly asks otherwise.
12. On the `insights` sheet, use the documented columns exactly: `insight_order`, `insight_type`, `title`, `player_name`, `related_player_2`, `metric_label`, `metric_value`, `summary`, `evidence`, `source_ref`. The visible site subtitle under each insight title comes from `summary`; never put the only description in a non-format column like `body`.
13. Keep rating fields and club points separate: `rating_before`, `rating_after`, and `rating_change` must come from the Lunda ratings/rating deltas; `club_points` must come only from the configured leaderboard scale.
14. Record uncertain OCR/video gaps in `meta.parser_note`, row `notes`, or `validation`; do not silently guess missing players or scores.
