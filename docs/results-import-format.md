# Padel Brazzers Results Import v1

This document is the import contract for completed tournament results.
Every Excel file prepared from Lunda screenshots or screen recordings must follow this structure exactly.

## File

- Format: `.xlsx`
- Version marker: `PB_RESULTS_IMPORT_V1`
- Required sheets:
  - `readme`
  - `meta`
  - `participants`
  - `matches`
  - `standings`
  - `insights`
  - `validation`

The site importer should reject files with a missing required sheet, missing required column, or unsupported `format_version`.

## Sheet `meta`

One row per metadata field.

Columns:

| column | required | description |
| --- | --- | --- |
| field | yes | Stable field key. |
| value | yes for required fields | Field value. |
| notes | no | Human note. |

Required fields:

| field | allowed / format |
| --- | --- |
| format_version | `PB_RESULTS_IMPORT_V1` |
| tournament_id | Existing site tournament id if known, otherwise blank. |
| tournament_title | Tournament name. |
| tournament_date | `yyyy-mm-dd` |
| start_time | `HH:MM` Vladivostok time, can be blank if unknown. |
| club | `Padel Pro Club` or `Падел-клуб "Небо"` |
| league | `pro` or `lite` |
| format | `americano`, `mexicano`, `round_robin`, `king_of_the_court`, or `other` |
| draw_type | `individual` or `team` |
| scoring_scale | `individual_12`, `individual_16`, `team_6`, or `team_8` |
| timezone | `Asia/Vladivostok` |
| source_type | `video`, `screenshots`, `manual`, or `mixed` |
| source_note | Short note about source files. |
| parser_note | Short note about ambiguities, corrections, missing screens. |

## Sheet `participants`

One row per player in the tournament.

Columns:

| column | required | type / rule |
| --- | --- | --- |
| participant_id | yes | Stable id inside the file, for example `p01`. |
| seed | no | Starting order/rating order if known. |
| player_name | yes | Display name used on the site. |
| lunda_nick | no | Nick in Lunda if visible. |
| rating_before | no | Numeric rating before tournament. |
| rating_after | no | Numeric rating after tournament if visible. |
| rating_change | no | Numeric change, can be formula/value. |
| club_member_email | no | Optional account matching field. |
| notes | no | Any ambiguity or correction. |

Names in other sheets must match `player_name` exactly unless `participant_id` is used.

## Sheet `matches`

One row per played match.

Columns:

| column | required | type / rule |
| --- | --- | --- |
| match_id | yes | Stable id, for example `r01c01`. |
| round | yes | Integer, starts from `1`. |
| court | no | Court number/name. |
| team_a_player_1 | yes | Player name. |
| team_a_player_2 | yes for doubles | Player name, blank for singles. |
| score_a | yes | Integer. |
| team_b_player_1 | yes | Player name. |
| team_b_player_2 | yes for doubles | Player name, blank for singles. |
| score_b | yes | Integer. |
| winner | no | `A` or `B`; importer can calculate from scores. |
| source_ref | no | Screenshot/video timestamp reference. |
| notes | no | Ambiguity/correction note. |

For Americano and Mexicano, matches are usually doubles, so both player fields in each team should be filled.

## Sheet `standings`

Final standings. This is the source of truth for tournament points and forecast result comparison.

Columns:

| column | required | type / rule |
| --- | --- | --- |
| place | yes | Integer, starts from `1`, no duplicates. |
| player_name | yes for individual | Player name. |
| team_name | yes for team tournaments | Team label. |
| team_player_1 | yes for team tournaments | Player name. |
| team_player_2 | yes for team tournaments | Player name. |
| wins | no | Integer. |
| losses | no | Integer. |
| points_for | no | Integer. |
| points_against | no | Integer. |
| delta | no | Integer, usually `points_for - points_against`. |
| rating_before | no | Numeric. |
| rating_after | no | Numeric. |
| rating_change | no | Numeric. |
| club_points | no | Integer; importer can recalculate from `scoring_scale`. |
| tiebreak_note | no | Explanation if two places were decided by tiebreak. |
| source_ref | no | Screenshot/video timestamp reference. |

For forecast scoring, the final order is read from `place` + `player_name` for individual tournaments.
For team tournaments, both players receive the same `club_points`.

## Sheet `insights`

Exactly four rows are recommended for the site. Extra rows can be ignored or stored as alternates.

Columns:

| column | required | type / rule |
| --- | --- | --- |
| insight_order | yes | Integer `1` to `4` for primary site cards. |
| insight_type | yes | One of the insight types below. |
| title | yes | Short card title. |
| player_name | no | Main related player. |
| related_player_2 | no | Optional second player. |
| metric_label | no | Short label, for example `+/-`, `Рост`, `Старт`. |
| metric_value | no | Short displayed value. |
| summary | yes | 1 short sentence for the site card. |
| evidence | no | Why this insight was selected. |
| source_ref | no | Screenshot/video timestamp reference. |

Allowed `insight_type` values:

- `mvp`
- `anomaly`
- `overperformer`
- `underperformer`
- `best_start`
- `bad_finish`
- `rating_jump`
- `rating_drop`
- `clutch`
- `upset`
- `weird_stat`
- `comeback`
- `custom`

Examples:

| insight_type | title |
| --- | --- |
| `mvp` | MVP турнира |
| `anomaly` | Странная статистика |
| `overperformer` | Оверперформер |
| `underperformer` | Переоценка рейтинга |

## Site Import Rules

1. Importer reads `meta.format_version`; only `PB_RESULTS_IMPORT_V1` is accepted.
2. Importer validates required sheets and columns.
3. Importer shows a preview before saving.
4. `standings` drives:
   - final tournament table;
   - club points;
   - PRO/LITE leaderboard;
   - forecast result comparison.
5. `matches` drives:
   - round-by-round tournament page;
   - match statistics and stories.
6. `insights` drives four site cards below tournament results.
7. The importer should never silently guess missing players. Ambiguous rows must appear in preview warnings.

## Recognition Workflow

When preparing a file from screenshots or video:

1. Extract all visible players, ratings, rounds, scores, and final standings.
2. Fill `participants`.
3. Fill every visible match in `matches`.
4. Fill final order in `standings`.
5. Select four strongest insights and fill `insights`.
6. Use `source_ref` to point to screenshot name or video timestamp when useful.
7. Put uncertainty into `notes` or `parser_note`; do not hide it.
