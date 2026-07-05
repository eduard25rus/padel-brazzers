import { createHash, pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const distDir = join(rootDir, "dist");
const dataDir = process.env.DATA_DIR ?? process.env.RAILWAY_VOLUME_MOUNT_PATH ?? join(rootDir, "data");
const storePath = join(dataDir, "auth-store.json");
const port = Number(process.env.PORT ?? 4173);
const resendApiKey = process.env.RESEND_API_KEY ?? "";
const mailFrom = process.env.MAIL_FROM ?? "";
const publicSiteUrl = String(process.env.PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const allowedClubs = new Set(["Padel Pro Club", 'Падел-клуб "Небо"']);
const allowedTournamentLeagues = new Set(["pro", "lite"]);

const defaultScoringMethod = {
  createdAt: new Date(0).toISOString(),
  description: "Базовый подсчет для индивидуальных турниров: Americano, Mexicano, Escalera.",
  formats: "Americano, Mexicano, Escalera",
  id: "individual-basic",
  lastPlaceBonus: 5,
  name: "Базовая индивидуальная методика",
  onePositionError: 3,
  exactPlace: 5,
  top3AnyOrderBonus: 8,
  top3ExactBonus: 15,
  twoPositionError: 1,
};

const defaultSettings = {
  predictionRegistryVisibility: "admin",
};

const defaultLeaderboardPointMethod = {
  createdAt: new Date(0).toISOString(),
  description: "Клубные очки за итоговые места: личные турниры на 12/16 игроков и парные турниры на 6/8 команд.",
  id: "club-points-basic",
  name: "Базовая клубная методика очков",
  points: {
    individual_12: { 1: 100, 2: 85, 3: 70, 4: 60, 5: 55, 6: 45, 7: 40, 8: 30, 9: 25, 10: 20, 11: 10, 12: 5 },
    individual_16: { 1: 110, 2: 95, 3: 80, 4: 70, 5: 65, 6: 60, 7: 55, 8: 50, 9: 45, 10: 40, 11: 35, 12: 30, 13: 20, 14: 15, 15: 10, 16: 5 },
    team_6: { 1: 90, 2: 65, 3: 50, 4: 35, 5: 25, 6: 5 },
    team_8: { 1: 100, 2: 75, 3: 65, 4: 50, 5: 45, 6: 30, 7: 20, 8: 5 },
  },
  updatedAt: null,
};

function sanitizeSettings(settings = {}) {
  return {
    predictionRegistryVisibility: settings.predictionRegistryVisibility === "all" ? "all" : "admin",
  };
}

function sanitizeLeaderboardPointMethod(method = defaultLeaderboardPointMethod) {
  return {
    createdAt: method.createdAt ?? new Date(0).toISOString(),
    description: method.description ?? "",
    id: method.id ?? defaultLeaderboardPointMethod.id,
    name: method.name ?? defaultLeaderboardPointMethod.name,
    points: method.points ?? defaultLeaderboardPointMethod.points,
    updatedAt: method.updatedAt ?? null,
  };
}

function normalizeTournamentLeague(value, title = "") {
  const rawValue = String(value ?? "").trim().toLowerCase();
  if (allowedTournamentLeagues.has(rawValue)) {
    return rawValue;
  }

  return String(title).toLowerCase().includes("lite") ? "lite" : "pro";
}

function cleanTournamentTitle(value) {
  const title = String(value ?? "")
    .replace(/^турнир\s*[«"]?/i, "")
    .replace(/[»"]$/g, "")
    .replace(/[🎾🏆]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  return title || "";
}

function ensureStore() {
  mkdirSync(dataDir, { recursive: true });
  if (!existsSync(storePath)) {
    writeFileSync(storePath, JSON.stringify({ completedTournamentResults: [], forecastPredictions: [], forecastTournaments: [], leaderboardPointMethods: [defaultLeaderboardPointMethod], notifications: [], scoringMethods: [defaultScoringMethod], sessions: [], settings: defaultSettings, users: [] }, null, 2));
  }
}

function readStore() {
  ensureStore();

  try {
    const parsed = JSON.parse(readFileSync(storePath, "utf8"));
    const scoringMethods = Array.isArray(parsed.scoringMethods) && parsed.scoringMethods.length > 0
      ? parsed.scoringMethods
      : [defaultScoringMethod];
    const leaderboardPointMethods = Array.isArray(parsed.leaderboardPointMethods) && parsed.leaderboardPointMethods.length > 0
      ? parsed.leaderboardPointMethods
      : [defaultLeaderboardPointMethod];

    return {
      completedTournamentResults: Array.isArray(parsed.completedTournamentResults) ? parsed.completedTournamentResults : [],
      forecastPredictions: Array.isArray(parsed.forecastPredictions) ? parsed.forecastPredictions : [],
      forecastTournaments: Array.isArray(parsed.forecastTournaments) ? parsed.forecastTournaments : [],
      leaderboardPointMethods,
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      scoringMethods,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      settings: sanitizeSettings(parsed.settings),
      users: Array.isArray(parsed.users) ? parsed.users : [],
    };
  } catch {
    return { completedTournamentResults: [], forecastPredictions: [], forecastTournaments: [], leaderboardPointMethods: [defaultLeaderboardPointMethod], notifications: [], scoringMethods: [defaultScoringMethod], sessions: [], settings: defaultSettings, users: [] };
  }
}

function writeStore(store) {
  ensureStore();
  writeFileSync(storePath, JSON.stringify(store, null, 2));
}

function jsonResponse(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const { passwordHash, passwordSalt, ...safeUser } = user;
  return safeUser;
}

function getTournamentPredictionCount(tournamentId, forecastPredictions = []) {
  return new Set(
    forecastPredictions
      .filter((prediction) => prediction.tournamentId === tournamentId)
      .map((prediction) => prediction.userId),
  ).size;
}

function getVladivostokMonthKey(value) {
  if (!value) {
    return "unknown";
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    timeZone: "Asia/Vladivostok",
    year: "numeric",
  }).formatToParts(new Date(value));
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return year && month ? `${year}-${month}` : "unknown";
}

function getForecastLeaderboard(store) {
  const tournamentById = new Map(store.forecastTournaments.map((tournament) => [tournament.id, tournament]));

  return store.users
    .filter((user) => user.status === "active")
    .map((user) => {
      const predictions = store.forecastPredictions.filter((prediction) => prediction.userId === user.id);
      const months = {};
      let needsReviewCount = 0;
      let forecastPoints = 0;

      for (const prediction of predictions) {
        const tournament = tournamentById.get(prediction.tournamentId);
        const details = tournament ? getPredictionDetails(prediction, tournament) : { needsReview: Boolean(prediction.needsReview) };
        const result = tournament ? getCompletedResultForTournament(store, tournament) : null;
        const scoringMethod = tournament ? getForecastScoringMethod(store, tournament) : defaultScoringMethod;
        const score = result ? scoreForecastPrediction({ prediction, result, scoringMethod, tournament }) : null;
        const points = score?.points ?? 0;
        const monthKey = getVladivostokMonthKey(result?.date ?? result?.importedAt ?? prediction.updatedAt ?? prediction.createdAt);
        months[monthKey] = months[monthKey] ?? { needsReview: 0, points: 0, predictions: 0 };
        months[monthKey].predictions += 1;
        months[monthKey].points += points;
        forecastPoints += points;

        if (details.needsReview) {
          needsReviewCount += 1;
          months[monthKey].needsReview += 1;
        }
      }

      return {
        forecastPoints,
        lastPredictionAt: predictions
          .map((prediction) => prediction.updatedAt ?? prediction.createdAt)
          .filter(Boolean)
          .sort()
          .at(-1) ?? null,
        lundaNick: user.lundaNick,
        months,
        name: `${user.firstName} ${user.lastName}`.trim() || user.lundaNick,
        needsReviewCount,
        predictionCount: predictions.length,
        readyCount: Math.max(0, predictions.length - needsReviewCount),
        userId: user.id,
      };
    })
    .filter((row) => row.predictionCount > 0)
    .sort((a, b) => b.forecastPoints - a.forecastPoints || b.predictionCount - a.predictionCount || b.readyCount - a.readyCount || String(b.lastPredictionAt).localeCompare(String(a.lastPredictionAt)));
}

function getUserCabinet(store, user) {
  const predictions = store.forecastPredictions
    .filter((prediction) => prediction.userId === user.id)
    .map((prediction) => {
      const tournament = store.forecastTournaments.find((item) => item.id === prediction.tournamentId);
      const result = tournament ? getCompletedResultForTournament(store, tournament) : null;
      const scoringMethod = tournament ? getForecastScoringMethod(store, tournament) : defaultScoringMethod;
      const score = result ? scoreForecastPrediction({ prediction, result, scoringMethod, tournament }) : null;
      return {
        forecastPoints: score?.points ?? 0,
        prediction: sanitizeForecastPrediction(prediction, tournament),
        tournament: tournament ? sanitizeTournament(tournament, store.forecastPredictions) : null,
      };
    })
    .sort((a, b) => String(b.prediction?.updatedAt).localeCompare(String(a.prediction?.updatedAt)));
  const needsReviewCount = predictions.filter((item) => item.prediction?.needsReview).length;

  return {
    forecastPoints: predictions.reduce((sum, item) => sum + Number(item.forecastPoints ?? 0), 0),
    needsReviewCount,
    predictionCount: predictions.length,
    predictions,
    readyPredictionCount: Math.max(0, predictions.length - needsReviewCount),
    tournamentPoints: 0,
  };
}

function sanitizeTournament(tournament, forecastPredictions = []) {
  const roster = Array.isArray(tournament.roster) ? tournament.roster : [];

  return {
    club: tournament.club ?? "Padel Pro Club",
    completedResultId: tournament.completedResultId ?? null,
    conditions: tournament.conditions ?? "",
    createdAt: tournament.createdAt,
    date: tournament.date ?? "",
    format: tournament.format ?? "",
    id: tournament.id,
    image: tournament.image ?? "/assets/hero-court.png",
    league: normalizeTournamentLeague(tournament.league, tournament.title),
    players: tournament.players ?? `${roster.length} игроков`,
    predictionCount: getTournamentPredictionCount(tournament.id, forecastPredictions),
    pointsToWin: tournament.pointsToWin ?? "",
    predictionCloseAt: tournament.predictionCloseAt ?? "",
    roster,
    scoring: tournament.scoring ?? "1 балл за точное место",
    scoringMethod: tournament.scoringMethod ?? null,
    scoringMethodId: tournament.scoringMethodId ?? "",
    status: tournament.status ?? "Прием прогнозов",
    rosterChangedAt: tournament.rosterChangedAt ?? null,
    rosterChangeRevision: tournament.rosterChangeRevision ?? 0,
    resultsImportedAt: tournament.resultsImportedAt ?? null,
    time: tournament.time ?? "",
    timezone: tournament.timezone ?? "Asia/Vladivostok",
    title: tournament.title ?? "Будущий турнир",
    updatedAt: tournament.updatedAt ?? null,
  };
}

function sanitizeCompletedTournamentResult(result) {
  const standings = Array.isArray(result.standings) ? result.standings : [];
  const matches = Array.isArray(result.matches) ? result.matches : [];
  const insights = Array.isArray(result.insights) ? result.insights : [];
  const participants = Array.isArray(result.participants) ? result.participants : [];
  const meta = result.meta && typeof result.meta === "object" ? result.meta : {};

  return {
    club: result.club ?? meta.club ?? "Padel Pro Club",
    createdAt: result.createdAt ?? null,
    date: result.date ?? meta.tournament_date ?? "",
    forecastTournamentId: result.forecastTournamentId ?? "",
    format: result.format ?? meta.format ?? "",
    id: result.id,
    image: result.image ?? "/assets/trophy.png",
    importedAt: result.importedAt ?? null,
    insights: insights.map((insight) => ({
      evidence: insight.evidence ?? "",
      insightOrder: Number(insight.insightOrder ?? insight.insight_order ?? 0),
      insightType: insight.insightType ?? insight.insight_type ?? "custom",
      metricLabel: insight.metricLabel ?? insight.metric_label ?? "",
      metricValue: insight.metricValue ?? insight.metric_value ?? "",
      playerName: cleanImportPlayerName(insight.playerName ?? insight.player_name ?? ""),
      relatedPlayer2: cleanImportPlayerName(insight.relatedPlayer2 ?? insight.related_player_2 ?? ""),
      sourceRef: insight.sourceRef ?? insight.source_ref ?? "",
      summary: insight.summary ?? "",
      title: insight.title ?? "",
    })),
    league: normalizeTournamentLeague(result.league ?? meta.league, result.title ?? meta.tournament_title),
    matches: matches.map((match) => ({
      court: match.court ?? "",
      matchId: match.matchId ?? match.match_id ?? "",
      notes: match.notes ?? "",
      round: Number(match.round),
      scoreA: Number(match.scoreA ?? match.score_a),
      scoreB: Number(match.scoreB ?? match.score_b),
      sourceRef: match.sourceRef ?? match.source_ref ?? "",
      teamAPlayer1: cleanImportPlayerName(match.teamAPlayer1 ?? match.team_a_player_1 ?? ""),
      teamAPlayer2: cleanImportPlayerName(match.teamAPlayer2 ?? match.team_a_player_2 ?? ""),
      teamBPlayer1: cleanImportPlayerName(match.teamBPlayer1 ?? match.team_b_player_1 ?? ""),
      teamBPlayer2: cleanImportPlayerName(match.teamBPlayer2 ?? match.team_b_player_2 ?? ""),
      winner: cleanImportPlayerName(match.winner ?? ""),
    })),
    meta,
    participants: participants.map((participant) => ({
      lundaNick: participant.lundaNick ?? participant.lunda_nick ?? "",
      notes: participant.notes ?? "",
      participantId: participant.participantId ?? participant.participant_id ?? "",
      playerName: cleanImportPlayerName(participant.playerName ?? participant.player_name ?? ""),
      ratingAfter: participant.ratingAfter ?? participant.rating_after ?? "",
      ratingBefore: participant.ratingBefore ?? participant.rating_before ?? "",
      ratingChange: participant.ratingChange ?? participant.rating_change ?? "",
      seed: participant.seed ?? "",
    })),
    players: result.players ?? `${standings.length} игроков`,
    rounds: result.rounds ?? `${new Set(matches.map((match) => Number(match.round)).filter(Boolean)).size} раундов`,
    scoringScale: result.scoringScale ?? meta.scoring_scale ?? "",
    standings: standings.map((row) => ({
      clubPoints: Number(row.clubPoints ?? row.club_points ?? 0),
      delta: Number(row.delta ?? 0),
      draws: Number(row.draws ?? 0),
      losses: Number(row.losses ?? 0),
      place: Number(row.place),
      playerName: cleanImportPlayerName(row.playerName ?? row.player_name ?? ""),
      pointsAgainst: Number(row.pointsAgainst ?? row.points_against ?? 0),
      pointsFor: Number(row.pointsFor ?? row.points_for ?? 0),
      ratingAfter: row.ratingAfter ?? row.rating_after ?? "",
      ratingBefore: row.ratingBefore ?? row.rating_before ?? "",
      ratingChange: row.ratingChange ?? row.rating_change ?? "",
      sourceRef: row.sourceRef ?? row.source_ref ?? "",
      teamName: row.teamName ?? row.team_name ?? "",
      teamPlayer1: cleanImportPlayerName(row.teamPlayer1 ?? row.team_player_1 ?? ""),
      teamPlayer2: cleanImportPlayerName(row.teamPlayer2 ?? row.team_player_2 ?? ""),
      tiebreakNote: row.tiebreakNote ?? row.tiebreak_note ?? "",
      wins: Number(row.wins ?? 0),
    })),
    status: result.status ?? "Боевой турнир",
    time: result.time ?? meta.start_time ?? "",
    title: cleanTournamentTitle(result.title) || cleanTournamentTitle(meta.tournament_title) || "Завершенный турнир",
    updatedAt: result.updatedAt ?? null,
    validation: result.validation ?? [],
  };
}

function xmlDecode(value) {
  return String(value ?? "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function stripXmlTags(value) {
  return xmlDecode(String(value ?? "").replace(/<[^>]*>/g, ""));
}

function getXmlAttribute(value, name) {
  const match = String(value ?? "").match(new RegExp(`${name}="([^"]*)"`));
  return match ? xmlDecode(match[1]) : "";
}

function columnIndexFromCellRef(cellRef) {
  const letters = String(cellRef ?? "").match(/[A-Z]+/i)?.[0] ?? "A";
  return [...letters.toUpperCase()].reduce((sum, letter) => sum * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

function readZipEntries(buffer) {
  const eocdSignature = 0x06054b50;
  let eocdOffset = -1;
  for (let index = buffer.length - 22; index >= Math.max(0, buffer.length - 66000); index -= 1) {
    if (buffer.readUInt32LE(index) === eocdSignature) {
      eocdOffset = index;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error("Excel-файл не похож на .xlsx архив.");
  }

  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  const entries = new Map();
  let offset = centralDirectoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error("Не удалось прочитать структуру .xlsx.");
    }

    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.slice(offset + 46, offset + 46 + fileNameLength).toString("utf8");
    const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.slice(dataStart, dataStart + compressedSize);
    let data;

    if (method === 0) {
      data = compressed;
    } else if (method === 8) {
      data = inflateRawSync(compressed);
    } else {
      throw new Error(`Файл .xlsx использует неподдерживаемое сжатие: ${method}.`);
    }

    if (uncompressedSize && data.length !== uncompressedSize) {
      throw new Error(`Не совпал размер файла внутри .xlsx: ${name}.`);
    }

    entries.set(name, data.toString("utf8"));
    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function parseSharedStrings(xml = "") {
  return [...xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map((match) => stripXmlTags(match[1]));
}

function parseWorksheetRows(xml = "", sharedStrings = []) {
  return [...xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)].map((rowMatch) => {
    const values = [];
    for (const cellMatch of rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>|<c\b([^>]*)\/>/g)) {
      const attrs = cellMatch[1] ?? cellMatch[3] ?? "";
      const body = cellMatch[2] ?? "";
      const ref = getXmlAttribute(attrs, "r");
      const columnIndex = columnIndexFromCellRef(ref);
      const type = getXmlAttribute(attrs, "t");
      let value = "";
      const inlineMatch = body.match(/<is\b[^>]*>([\s\S]*?)<\/is>/);
      const valueMatch = body.match(/<v\b[^>]*>([\s\S]*?)<\/v>/);

      if (type === "inlineStr" && inlineMatch) {
        value = stripXmlTags(inlineMatch[1]);
      } else if (type === "s" && valueMatch) {
        value = sharedStrings[Number(stripXmlTags(valueMatch[1]))] ?? "";
      } else if (valueMatch) {
        value = stripXmlTags(valueMatch[1]);
      }

      values[columnIndex] = value;
    }

    return values.map((value) => value ?? "");
  });
}

function getWorkbookSheets(entries) {
  const workbookXml = entries.get("xl/workbook.xml");
  const relsXml = entries.get("xl/_rels/workbook.xml.rels");
  if (!workbookXml || !relsXml) {
    throw new Error("В .xlsx нет workbook.xml.");
  }

  const rels = new Map([...relsXml.matchAll(/<Relationship\b([^>]*)\/>/g)].map((match) => {
    const id = getXmlAttribute(match[1], "Id");
    const target = getXmlAttribute(match[1], "Target");
    return [id, target.startsWith("xl/") ? target : `xl/${target}`];
  }));

  return [...workbookXml.matchAll(/<sheet\b([^>]*)\/>/g)].map((match) => ({
    name: getXmlAttribute(match[1], "name"),
    path: rels.get(getXmlAttribute(match[1], "r:id")),
  }));
}

function rowsToObjects(rows) {
  if (!rows.length) {
    return [];
  }

  const headers = rows[0].map((header) => String(header ?? "").trim());
  return rows.slice(1)
    .filter((row) => row.some((value) => String(value ?? "").trim() !== ""))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

function normalizeImportPlayerName(value) {
  return String(value ?? "")
    .replace(/\s*\|\s*LOCKED IN\s*$/i, "")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function transliterateCyrillicToLatin(value) {
  const map = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
  };

  return normalizeImportPlayerName(value)
    .split("")
    .map((char) => map[char] ?? char)
    .join("");
}

function getPlayerNameKeys(value) {
  const normalized = normalizeImportPlayerName(value);
  if (!normalized) {
    return [];
  }

  const variants = new Set([
    normalized,
    transliterateCyrillicToLatin(normalized),
  ]);

  for (const variant of [...variants]) {
    const parts = variant.split(" ").filter(Boolean);
    if (parts.length === 2) {
      variants.add(`${parts[1]} ${parts[0]}`);
    }
    if (parts.length > 1 && parts.length <= 4) {
      variants.add([...parts].sort().join(" "));
    }
  }

  return [...variants].filter(Boolean);
}

function getCanonicalPlayerNameKey(value) {
  const transliterated = transliterateCyrillicToLatin(value);
  const parts = transliterated.split(" ").filter(Boolean);
  return parts.length > 1 ? parts.sort().join(" ") : transliterated;
}

function areSamePlayerName(left, right) {
  const rightKeys = new Set(getPlayerNameKeys(right));
  return getPlayerNameKeys(left).some((key) => rightKeys.has(key));
}

function addImportRecordPlayer(records, name, scoreFor, scoreAgainst) {
  const key = normalizeImportPlayerName(name);
  if (!key) {
    return;
  }

  const current = records.get(key) ?? { draws: 0, losses: 0, wins: 0 };
  if (scoreFor > scoreAgainst) {
    current.wins += 1;
  } else if (scoreFor < scoreAgainst) {
    current.losses += 1;
  } else {
    current.draws += 1;
  }
  records.set(key, current);
}

function getImportMatchRecords(matches = []) {
  const records = new Map();

  for (const match of matches) {
    const scoreA = Number(match.score_a ?? match.scoreA);
    const scoreB = Number(match.score_b ?? match.scoreB);
    if (!Number.isFinite(scoreA) || !Number.isFinite(scoreB)) {
      continue;
    }

    addImportRecordPlayer(records, match.team_a_player_1 ?? match.teamAPlayer1, scoreA, scoreB);
    addImportRecordPlayer(records, match.team_a_player_2 ?? match.teamAPlayer2, scoreA, scoreB);
    addImportRecordPlayer(records, match.team_b_player_1 ?? match.teamBPlayer1, scoreB, scoreA);
    addImportRecordPlayer(records, match.team_b_player_2 ?? match.teamBPlayer2, scoreB, scoreA);
  }

  return records;
}

function enrichImportStandingsWithMatchRecords(standings = [], matches = []) {
  const records = getImportMatchRecords(matches);
  return standings.map((row) => {
    const record = records.get(normalizeImportPlayerName(row.player_name ?? row.playerName));
    if (!record) {
      return row;
    }

    const rawWins = String(row.wins ?? "").trim();
    const rawLosses = String(row.losses ?? "").trim();
    const rawDraws = String(row.draws ?? "").trim();
    return {
      ...row,
      draws: rawDraws === "" ? String(record.draws) : row.draws,
      losses: rawLosses === "" || (Number(rawLosses) === 0 && record.losses > 0) ? String(record.losses) : row.losses,
      wins: rawWins === "" || (Number(rawWins) === 0 && record.wins > 0) ? String(record.wins) : row.wins,
    };
  });
}

function cleanImportPlayerName(value) {
  return String(value ?? "")
    .replace(/\s*\|\s*LOCKED IN\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeImportPreviewNames(preview, tournament) {
  const rosterNameByKey = new Map();
  for (const player of tournament?.roster ?? []) {
    for (const key of getPlayerNameKeys(player.name)) {
      rosterNameByKey.set(key, player.name);
    }
  }
  const displayName = (name) => {
    for (const key of getPlayerNameKeys(name)) {
      const rosterName = rosterNameByKey.get(key);
      if (rosterName) {
        return rosterName;
      }
    }
    return cleanImportPlayerName(name);
  };
  const normalizeRowNames = (row, fields) => Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, fields.includes(key) ? displayName(value) : value]),
  );

  const standings = (preview.standings ?? []).map((row) => normalizeRowNames(row, ["player_name", "team_player_1", "team_player_2"]));
  const participants = (preview.participants ?? []).map((row) => normalizeRowNames(row, ["player_name"]));
  const matches = (preview.matches ?? []).map((row) => normalizeRowNames(row, [
    "team_a_player_1",
    "team_a_player_2",
    "team_b_player_1",
    "team_b_player_2",
    "winner",
  ]));
  const insights = (preview.insights ?? []).map((row) => normalizeRowNames(row, ["player_name", "related_player_2"]));
  const winner = displayName(preview.summary?.winner);

  return {
    ...preview,
    insights,
    matches,
    participants,
    standings,
    summary: {
      ...(preview.summary ?? {}),
      winner,
    },
  };
}

function parseResultsWorkbook(fileBuffer) {
  const entries = readZipEntries(fileBuffer);
  const sharedStrings = parseSharedStrings(entries.get("xl/sharedStrings.xml") ?? "");
  const sheets = {};

  for (const sheet of getWorkbookSheets(entries)) {
    if (!sheet.path || !entries.has(sheet.path)) {
      continue;
    }

    sheets[sheet.name] = parseWorksheetRows(entries.get(sheet.path), sharedStrings);
  }

  const requiredSheets = ["meta", "participants", "matches", "standings", "insights", "validation"];
  const missingSheets = requiredSheets.filter((name) => !sheets[name]);
  if (missingSheets.length) {
    throw new Error(`В Excel нет обязательных листов: ${missingSheets.join(", ")}.`);
  }

  const metaRows = rowsToObjects(sheets.meta);
  const meta = Object.fromEntries(metaRows.map((row) => [String(row.field ?? "").trim(), row.value ?? ""]));
  if (meta.format_version !== "PB_RESULTS_IMPORT_V1") {
    throw new Error("Файл должен быть в формате PB_RESULTS_IMPORT_V1.");
  }

  const participants = rowsToObjects(sheets.participants);
  const matches = rowsToObjects(sheets.matches);
  const standings = enrichImportStandingsWithMatchRecords(rowsToObjects(sheets.standings), matches);
  const insights = rowsToObjects(sheets.insights);
  const validation = rowsToObjects(sheets.validation);
  const warnings = [];

  if (!standings.length) {
    warnings.push("На листе standings нет итоговой таблицы.");
  }

  if (!matches.length) {
    warnings.push("На листе matches нет матчей.");
  }

  const roundsCount = new Set(matches.map((match) => Number(match.round)).filter(Boolean)).size;
  const winner = standings.find((row) => Number(row.place) === 1)?.player_name ?? standings[0]?.player_name ?? "";

  return {
    fileFormat: meta.format_version,
    importedAt: new Date().toISOString(),
    insights,
    matches,
    meta,
    participants,
    standings,
    summary: {
      club: meta.club ?? "",
      date: meta.tournament_date ?? "",
      format: meta.format ?? "",
      league: normalizeTournamentLeague(meta.league, meta.tournament_title),
      matches: matches.length,
      players: standings.length || participants.length,
      rounds: roundsCount,
      scoringScale: meta.scoring_scale ?? "",
      title: meta.tournament_title ?? "",
      winner,
    },
    validation,
    warnings,
  };
}

function toNumberOrBlank(value) {
  const number = Number(value);
  return Number.isFinite(number) && String(value).trim() !== "" ? number : "";
}

function buildCompletedResultFromImport({ fileName, preview, tournament }) {
  const meta = preview.meta ?? {};
  const standings = (preview.standings ?? []).map((row) => ({
    clubPoints: Number(row.club_points ?? 0),
    delta: Number(row.delta ?? 0),
    draws: Number(row.draws ?? 0),
    losses: Number(row.losses ?? 0),
    place: Number(row.place),
    playerName: String(row.player_name ?? "").trim(),
    pointsAgainst: Number(row.points_against ?? 0),
    pointsFor: Number(row.points_for ?? 0),
    ratingAfter: toNumberOrBlank(row.rating_after),
    ratingBefore: toNumberOrBlank(row.rating_before),
    ratingChange: toNumberOrBlank(row.rating_change),
    sourceRef: row.source_ref ?? "",
    teamName: row.team_name ?? "",
    teamPlayer1: row.team_player_1 ?? "",
    teamPlayer2: row.team_player_2 ?? "",
    tiebreakNote: row.tiebreak_note ?? "",
    wins: Number(row.wins ?? 0),
  })).filter((row) => Number.isInteger(row.place) && row.playerName);
  const matches = (preview.matches ?? []).map((row) => ({
    court: row.court ?? "",
    matchId: row.match_id ?? "",
    notes: row.notes ?? "",
    round: Number(row.round),
    scoreA: Number(row.score_a),
    scoreB: Number(row.score_b),
    sourceRef: row.source_ref ?? "",
    teamAPlayer1: row.team_a_player_1 ?? "",
    teamAPlayer2: row.team_a_player_2 ?? "",
    teamBPlayer1: row.team_b_player_1 ?? "",
    teamBPlayer2: row.team_b_player_2 ?? "",
    winner: row.winner ?? "",
  })).filter((row) => Number.isInteger(row.round) && Number.isFinite(row.scoreA) && Number.isFinite(row.scoreB));
  const insights = (preview.insights ?? []).map((row) => ({
    evidence: row.evidence ?? "",
    insightOrder: Number(row.insight_order),
    insightType: row.insight_type ?? "custom",
    metricLabel: row.metric_label ?? "",
    metricValue: row.metric_value ?? "",
    playerName: row.player_name ?? "",
    relatedPlayer2: row.related_player_2 ?? "",
    sourceRef: row.source_ref ?? "",
    summary: row.summary ?? "",
    title: row.title ?? "",
  })).filter((row) => Number.isInteger(row.insightOrder) && row.title);

  if (!standings.length || !matches.length) {
    return { error: "В импортируемом файле должны быть матчи и итоговая таблица." };
  }

  const date = meta.tournament_date || tournament.date || "";
  const result = {
    club: meta.club || tournament.club || "Padel Pro Club",
    createdAt: new Date().toISOString(),
    date,
    forecastTournamentId: tournament.id,
    format: meta.format || tournament.format || "",
    id: `completed-${date || Date.now()}-${randomUUID().slice(0, 8)}`,
    image: tournament.image ?? "/assets/trophy.png",
    importedAt: new Date().toISOString(),
    insights,
    league: normalizeTournamentLeague(meta.league || tournament.league, tournament.title || meta.tournament_title),
    matches,
    meta: {
      ...meta,
      source_file: fileName ?? "",
    },
    participants: (preview.participants ?? []).map((row) => ({
      lundaNick: row.lunda_nick ?? "",
      notes: row.notes ?? "",
      participantId: row.participant_id ?? "",
      playerName: row.player_name ?? "",
      ratingAfter: toNumberOrBlank(row.rating_after),
      ratingBefore: toNumberOrBlank(row.rating_before),
      ratingChange: toNumberOrBlank(row.rating_change),
      seed: row.seed ?? "",
    })),
    players: `${standings.length} игроков`,
    rounds: `${new Set(matches.map((match) => match.round)).size} раундов`,
    scoringScale: meta.scoring_scale ?? "",
    standings,
    status: "Боевой турнир",
    time: meta.start_time || tournament.time || "",
    title: cleanTournamentTitle(tournament.title) || cleanTournamentTitle(meta.tournament_title) || "Завершенный турнир",
    updatedAt: null,
    validation: preview.validation ?? [],
  };

  return { result: sanitizeCompletedTournamentResult(result) };
}

function sanitizeScoringMethod(method) {
  return {
    createdAt: method.createdAt,
    description: method.description ?? "",
    exactPlace: Number(method.exactPlace),
    formats: method.formats ?? "",
    id: method.id,
    lastPlaceBonus: Number(method.lastPlaceBonus),
    name: method.name,
    onePositionError: Number(method.onePositionError),
    top3AnyOrderBonus: Number(method.top3AnyOrderBonus),
    top3ExactBonus: Number(method.top3ExactBonus),
    twoPositionError: Number(method.twoPositionError),
  };
}

function getPlayerKey(player) {
  return String(player?.id ?? player?.name ?? "");
}

function snapshotPlayer(player) {
  if (!player) {
    return null;
  }

  return {
    id: getPlayerKey(player),
    name: player.name ?? "",
    rating: Number(player.rating),
  };
}

function getPredictionDetails(prediction, tournament) {
  const roster = Array.isArray(tournament?.roster) ? tournament.roster : [];
  const placeCount = roster.length;
  const rosterById = new Map(roster.map((player) => [getPlayerKey(player), player]));
  const placements = Array.isArray(prediction?.placements) ? prediction.placements : [];
  const invalidPlacements = placements
    .filter((placement) => !rosterById.has(String(placement.playerId)))
    .map((placement) => ({
      place: placement.place,
      playerId: placement.playerId,
      playerName: placement.playerName ?? placement.name ?? "Выбывший игрок",
      rating: placement.rating ?? null,
    }));
  const currentPlacements = placements.filter((placement) => rosterById.has(String(placement.playerId)));
  const placedCurrentIds = new Set(currentPlacements.map((placement) => String(placement.playerId)));
  const missingPlayers = roster
    .filter((player) => !placedCurrentIds.has(getPlayerKey(player)))
    .sort((a, b) => Number(b.rating) - Number(a.rating) || String(a.name).localeCompare(String(b.name)));
  const freePlaces = [
    ...invalidPlacements.map((placement) => Number(placement.place)),
    ...Array.from({ length: placeCount }, (_, index) => index + 1).filter((place) => !placements.some((placement) => Number(placement.place) === place)),
  ]
    .filter((place, index, places) => Number.isInteger(place) && place >= 1 && place <= placeCount && places.indexOf(place) === index)
    .sort((a, b) => a - b);
  const replacementPlacements = missingPlayers.slice(0, freePlaces.length).map((player, index) => ({
    place: freePlaces[index],
    playerId: getPlayerKey(player),
    playerName: player.name,
    rating: Number(player.rating),
    autoAssigned: true,
  }));
  const effectivePlacements = [
    ...currentPlacements.map((placement) => ({
      place: Number(placement.place),
      playerId: String(placement.playerId),
      playerName: placement.playerName ?? rosterById.get(String(placement.playerId))?.name ?? "",
      rating: Number(placement.rating ?? rosterById.get(String(placement.playerId))?.rating),
    })),
    ...replacementPlacements,
  ].sort((a, b) => a.place - b.place);

  return {
    effectivePlacements,
    invalidPlacements,
    missingPlayers: missingPlayers.map(snapshotPlayer),
    needsReview: invalidPlacements.length > 0 || missingPlayers.length > 0 || Boolean(prediction?.needsReview),
  };
}

function sanitizeForecastPrediction(prediction, tournament = null) {
  if (!prediction) {
    return null;
  }

  const details = tournament ? getPredictionDetails(prediction, tournament) : {
    effectivePlacements: Array.isArray(prediction.effectivePlacements) ? prediction.effectivePlacements : [],
    invalidPlacements: [],
    missingPlayers: [],
    needsReview: Boolean(prediction.needsReview),
  };

  return {
    createdAt: prediction.createdAt,
    effectivePlacements: details.effectivePlacements,
    id: prediction.id,
    placements: Array.isArray(prediction.placements) ? prediction.placements : [],
    invalidPlacements: details.invalidPlacements,
    missingPlayers: details.missingPlayers,
    needsReview: details.needsReview,
    rosterChangeRevision: prediction.rosterChangeRevision ?? null,
    tournamentId: prediction.tournamentId,
    updatedAt: prediction.updatedAt,
    userId: prediction.userId,
  };
}

function getForecastScoringMethod(store, tournament) {
  return tournament?.scoringMethod
    ?? store.scoringMethods.find((method) => method.id === tournament?.scoringMethodId)
    ?? store.scoringMethods[0]
    ?? defaultScoringMethod;
}

function getCompletedResultForTournament(store, tournament) {
  if (!tournament) {
    return null;
  }

  return store.completedTournamentResults.find((result) => result.id === tournament.completedResultId)
    ?? store.completedTournamentResults.find((result) => result.forecastTournamentId === tournament.id)
    ?? null;
}

function scoreForecastPrediction({ prediction, result, scoringMethod, tournament }) {
  const finalRows = sanitizeCompletedTournamentResult(result).standings;
  const rosterById = new Map((tournament?.roster ?? []).map((player) => [getPlayerKey(player), player]));
  const actualByName = new Map();
  for (const row of finalRows) {
    for (const key of getPlayerNameKeys(row.playerName)) {
      actualByName.set(key, row);
    }
  }
  for (const player of tournament?.roster ?? []) {
    const actual = actualByName.get(normalizeImportPlayerName(player.name))
      ?? getPlayerNameKeys(player.name).map((key) => actualByName.get(key)).find(Boolean);
    if (!actual) {
      continue;
    }
    for (const key of getPlayerNameKeys(player.name)) {
      actualByName.set(key, actual);
    }
    actualByName.set(getPlayerKey(player), actual);
  }
  const actualTop3 = finalRows.slice(0, 3).map((row) => getCanonicalPlayerNameKey(row.playerName));
  const actualLast = finalRows.at(-1);
  const details = getPredictionDetails(prediction, tournament);
  const rows = details.effectivePlacements
    .map((placement) => {
      const predictedName = placement.playerName ?? rosterById.get(String(placement.playerId))?.name ?? "";
      const actual = actualByName.get(String(placement.playerId))
        ?? actualByName.get(normalizeImportPlayerName(predictedName))
        ?? getPlayerNameKeys(predictedName).map((key) => actualByName.get(key)).find(Boolean);
      const predictedPlace = Number(placement.place);
      const actualPlace = Number(actual?.place ?? 0);
      const diff = actualPlace ? Math.abs(predictedPlace - actualPlace) : null;
      let points = 0;
      let reason = "Нет в итоговой таблице";

      if (diff === 0) {
        points = Number(scoringMethod.exactPlace ?? 0);
        reason = "Точное место";
      } else if (diff === 1) {
        points = Number(scoringMethod.onePositionError ?? 0);
        reason = "Ошибка на 1 позицию";
      } else if (diff === 2) {
        points = Number(scoringMethod.twoPositionError ?? 0);
        reason = "Ошибка на 2 позиции";
      } else if (actual) {
        reason = `Ошибка на ${diff} поз.`;
      }

      return {
        actualPlace,
        diff,
        playerName: predictedName,
        points,
        predictedPlace,
        reason,
      };
    })
    .sort((a, b) => a.predictedPlace - b.predictedPlace);

  const predictedTop3 = rows.slice(0, 3).map((row) => getCanonicalPlayerNameKey(row.playerName));
  const top3Exact = actualTop3.length === 3 && actualTop3.every((name, index) => name === predictedTop3[index]);
  const top3AnyOrder = actualTop3.length === 3
    && actualTop3.every((name) => predictedTop3.includes(name))
    && !top3Exact;
  const predictedLast = rows.find((row) => row.predictedPlace === finalRows.length);
  const lastExact = actualLast && predictedLast && areSamePlayerName(predictedLast.playerName, actualLast.playerName);
  const bonuses = [];

  if (top3Exact) {
    bonuses.push({ label: "Топ-3 точный", points: Number(scoringMethod.top3ExactBonus ?? 0) });
  } else if (top3AnyOrder) {
    bonuses.push({ label: "Топ-3 в любом порядке", points: Number(scoringMethod.top3AnyOrderBonus ?? 0) });
  }

  if (lastExact) {
    bonuses.push({ label: "Последнее место", points: Number(scoringMethod.lastPlaceBonus ?? 0) });
  }

  const basePoints = rows.reduce((sum, row) => sum + row.points, 0);
  const bonusPoints = bonuses.reduce((sum, bonus) => sum + bonus.points, 0);

  return {
    basePoints,
    bonusPoints,
    bonuses,
    exactCount: rows.filter((row) => row.diff === 0).length,
    oneOffCount: rows.filter((row) => row.diff === 1).length,
    points: basePoints + bonusPoints,
    rows,
    twoOffCount: rows.filter((row) => row.diff === 2).length,
  };
}

function getForecastResultsSummary(store, tournament, viewer) {
  const result = getCompletedResultForTournament(store, tournament);
  if (!result) {
    return { completed: false };
  }

  const scoringMethod = sanitizeScoringMethod(getForecastScoringMethod(store, tournament));
  const finalResult = sanitizeCompletedTournamentResult(result);
  const predictions = store.forecastPredictions
    .filter((prediction) => prediction.tournamentId === tournament.id)
    .map((prediction) => {
      const user = store.users.find((item) => item.id === prediction.userId);
      const score = scoreForecastPrediction({ prediction, result, scoringMethod, tournament });
      return {
        lundaNick: user?.lundaNick ?? "",
        name: user ? `${user.firstName} ${user.lastName}`.trim() || user.lundaNick : "Участник",
        prediction: sanitizeForecastPrediction(prediction, tournament),
        updatedAt: prediction.updatedAt,
        userId: prediction.userId,
        ...score,
      };
    })
    .sort((a, b) => b.points - a.points || b.exactCount - a.exactCount || b.oneOffCount - a.oneOffCount || String(a.name).localeCompare(String(b.name)))
    .map((row, index) => ({ ...row, rank: index + 1 }));

  return {
    completed: true,
    finalStandings: finalResult.standings,
    leaderboard: predictions,
    resultId: finalResult.id,
    scoringMethod,
    tournamentId: tournament.id,
    viewerUserId: viewer?.id ?? null,
  };
}

function sanitizeNotification(notification) {
  return {
    createdAt: notification.createdAt,
    id: notification.id,
    message: notification.message,
    readAt: notification.readAt ?? null,
    title: notification.title,
    tournamentId: notification.tournamentId ?? null,
    type: notification.type ?? "info",
  };
}

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const hash = pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  return { hash, salt };
}

function verifyPassword(password, user) {
  const { hash } = hashPassword(password, user.passwordSalt);
  const stored = Buffer.from(user.passwordHash, "hex");
  const incoming = Buffer.from(hash, "hex");
  return stored.length === incoming.length && timingSafeEqual(stored, incoming);
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function makeSession(store, userId) {
  const token = randomUUID();
  store.sessions.push({
    createdAt: new Date().toISOString(),
    tokenHash: createHash("sha256").update(token).digest("hex"),
    userId,
  });
  return token;
}

function getToken(request) {
  const header = request.headers.authorization ?? "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

function getAuthedUser(store, request) {
  const token = getToken(request);
  if (!token) {
    return null;
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const session = store.sessions.find((item) => item.tokenHash === tokenHash);
  if (!session) {
    return null;
  }

  return store.users.find((user) => user.id === session.userId) ?? null;
}

function isActiveAdmin(user) {
  return user?.role === "admin" && user?.status === "active";
}

function authPayload(store, user = null, token) {
  return {
    ...(token !== undefined ? { token } : {}),
    hasUsers: store.users.length > 0,
    notifications: user ? store.notifications
      .filter((notification) => notification.userId === user.id)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, 12)
      .map(sanitizeNotification) : [],
    settings: sanitizeSettings(store.settings),
    user: sanitizeUser(user),
    users: isActiveAdmin(user) ? store.users.map(sanitizeUser) : [],
  };
}

function parseVladivostokDateTime(value) {
  if (!value || !value.includes("T")) {
    return null;
  }

  return new Date(`${value}:00+10:00`);
}

function normalizePredictionPlacements(body, tournament) {
  const roster = Array.isArray(tournament.roster) ? tournament.roster : [];
  const placeCount = roster.length;
  const rosterIds = new Set(roster.map((player) => String(player.id ?? player.name)));
  const requiredIds = roster.map((player) => String(player.id ?? player.name));
  const sourcePlacements = Array.isArray(body.placements) ? body.placements : [];
  const placements = sourcePlacements
    .map((placement, index) => {
      if (!placement) {
        return null;
      }

      const place = Number(placement.place ?? index + 1);
      const playerId = String(placement.playerId ?? "").trim();
      if (!Number.isInteger(place) || place < 1 || place > placeCount || !playerId || !rosterIds.has(playerId)) {
        return null;
      }

      const player = roster.find((item) => getPlayerKey(item) === playerId);
      return {
        place,
        playerId,
        playerName: player?.name ?? "",
        rating: Number(player?.rating),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.place - b.place);

  const seenPlaces = new Set();
  const seenPlayers = new Set();
  for (const placement of placements) {
    if (seenPlaces.has(placement.place) || seenPlayers.has(placement.playerId)) {
      return { error: "В прогнозе не должно быть повторяющихся мест или игроков." };
    }

    seenPlaces.add(placement.place);
    seenPlayers.add(placement.playerId);
  }

  if (requiredIds.length === 0 || !requiredIds.every((playerId) => seenPlayers.has(playerId))) {
    return { error: "Расставь всех игроков из состава турнира перед сохранением прогноза." };
  }

  return { placements };
}

function describePlayers(players) {
  return players.map((player) => player.name).filter(Boolean).join(", ");
}

async function sendEmail({ html, subject, text, to }) {
  if (!resendApiKey || !mailFrom || !to) {
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: mailFrom,
      html,
      subject,
      text,
      to: [to],
    }),
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message ?? "Resend email failed");
  }

  return payload;
}

async function sendRosterChangeEmail({ addedPlayers, removedPlayers, tournament, user }) {
  const forecastUrl = publicSiteUrl || "";
  const removedText = removedPlayers.length ? `Выбыли: ${describePlayers(removedPlayers)}.` : "";
  const addedText = addedPlayers.length ? `Добавлены: ${describePlayers(addedPlayers)}.` : "";
  const subject = `Изменился состав турнира: ${tournament.title}`;
  const text = [
    `Привет, ${user.firstName || user.lundaNick}!`,
    `В турнире "${tournament.title}" изменился состав.`,
    removedText,
    addedText,
    "Открой прогноз на сайте и скорректируй расстановку до старта турнира.",
    forecastUrl ? `Сайт: ${forecastUrl}` : "",
  ].filter(Boolean).join("\n\n");
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1b241d; line-height: 1.5;">
      <h2 style="margin: 0 0 12px; color: #1d5d2a;">Изменился состав турнира</h2>
      <p>Привет, ${escapeHtml(user.firstName || user.lundaNick)}!</p>
      <p>В турнире <strong>${escapeHtml(tournament.title)}</strong> изменился состав.</p>
      ${removedText ? `<p><strong>${escapeHtml(removedText)}</strong></p>` : ""}
      ${addedText ? `<p><strong>${escapeHtml(addedText)}</strong></p>` : ""}
      <p>Открой прогноз на сайте и скорректируй расстановку до старта турнира.</p>
      ${forecastUrl ? `<p><a href="${escapeHtml(forecastUrl)}" style="display: inline-block; background: #1d5d2a; color: #fffefa; padding: 10px 14px; border-radius: 8px; text-decoration: none; font-weight: 700;">Открыть Padel Brazzers</a></p>` : ""}
    </div>
  `;

  return sendEmail({ html, subject, text, to: user.email });
}

function applyTournamentRosterChange(store, previousTournament, nextTournament) {
  const previousRoster = Array.isArray(previousTournament.roster) ? previousTournament.roster : [];
  const nextRoster = Array.isArray(nextTournament.roster) ? nextTournament.roster : [];
  const previousById = new Map(previousRoster.map((player) => [getPlayerKey(player), player]));
  const nextById = new Map(nextRoster.map((player) => [getPlayerKey(player), player]));
  const removedPlayers = previousRoster.filter((player) => !nextById.has(getPlayerKey(player)));
  const addedPlayers = nextRoster.filter((player) => !previousById.has(getPlayerKey(player)));

  if (removedPlayers.length === 0 && addedPlayers.length === 0) {
    return nextTournament;
  }

  const now = new Date().toISOString();
  const rosterChangeRevision = Number(previousTournament.rosterChangeRevision ?? 0) + 1;
  const changedTournament = {
    ...nextTournament,
    rosterChangedAt: now,
    rosterChangeRevision,
  };
  const affectedPredictions = store.forecastPredictions.filter((prediction) => prediction.tournamentId === previousTournament.id);

  store.forecastPredictions = store.forecastPredictions.map((prediction) => {
    if (prediction.tournamentId !== previousTournament.id) {
      return prediction;
    }

    return {
      ...prediction,
      needsReview: true,
      placements: (Array.isArray(prediction.placements) ? prediction.placements : []).map((placement) => {
        const snapshot = previousById.get(String(placement.playerId));
        return {
          ...placement,
          playerName: placement.playerName ?? snapshot?.name ?? "",
          rating: Number(placement.rating ?? snapshot?.rating),
        };
      }),
      rosterChangeRevision,
      rosterChangedAt: now,
    };
  });

  for (const prediction of affectedPredictions) {
    const alreadyNotified = store.notifications.some((notification) => (
      notification.userId === prediction.userId
      && notification.tournamentId === previousTournament.id
      && notification.rosterChangeRevision === rosterChangeRevision
      && notification.type === "forecast-roster-changed"
    ));

    if (alreadyNotified) {
      continue;
    }

    const removedText = removedPlayers.length ? `Выбыли: ${describePlayers(removedPlayers)}. ` : "";
    const addedText = addedPlayers.length ? `Добавлены: ${describePlayers(addedPlayers)}. ` : "";
    store.notifications.push({
      createdAt: now,
      id: `notification-${Date.now()}-${randomUUID().slice(0, 8)}`,
      message: `${removedText}${addedText}Открой прогноз и скорректируй расстановку до старта турнира.`,
      readAt: null,
      rosterChangeRevision,
      title: `Изменился состав: ${previousTournament.title}`,
      tournamentId: previousTournament.id,
      type: "forecast-roster-changed",
      userId: prediction.userId,
    });

    const user = store.users.find((item) => item.id === prediction.userId);
    if (user?.email) {
      sendRosterChangeEmail({
        addedPlayers,
        removedPlayers,
        tournament: previousTournament,
        user,
      }).catch((error) => {
        console.warn(`Failed to send roster change email to ${user.email}:`, error.message);
      });
    }
  }

  return changedTournament;
}

function buildForecastTournamentFromBody(body, store, existingTournament = null) {
  const isEdit = Boolean(existingTournament);
  const title = String(body.title ?? existingTournament?.title ?? "").trim();
  const date = String(body.date ?? existingTournament?.date ?? "").trim();
  const time = String(body.time ?? existingTournament?.time ?? "").trim();
  const club = String(body.club ?? existingTournament?.club ?? "Padel Pro Club").trim();
  const format = String(body.format ?? existingTournament?.format ?? "").trim();
  const league = normalizeTournamentLeague(body.league ?? existingTournament?.league, title);
  const conditions = String(body.conditions ?? existingTournament?.conditions ?? "").trim();
  const rawPointsToWin = body.pointsToWin ?? existingTournament?.pointsToWin;
  const pointsToWin = format === "Americano" ? Number(rawPointsToWin) : null;
  const predictionCloseAt = date && time ? `${date}T${time}` : "";
  const scoringMethodId = String(body.scoringMethodId ?? existingTournament?.scoringMethodId ?? existingTournament?.scoringMethod?.id ?? "").trim();
  const scoringMethod = store.scoringMethods.find((method) => method.id === scoringMethodId)
    ?? store.scoringMethods.find((method) => method.id === existingTournament?.scoringMethodId)
    ?? store.scoringMethods[0]
    ?? defaultScoringMethod;
  const sourceRoster = Array.isArray(body.roster) ? body.roster : existingTournament?.roster;
  const roster = Array.isArray(sourceRoster)
    ? sourceRoster
        .map((player) => ({
          id: String(player.id ?? "").trim() || randomUUID(),
          name: String(player.name ?? "").trim(),
          rating: Number(player.rating),
        }))
        .filter((player) => player.name && Number.isFinite(player.rating))
      : [];

  if (!title || !date || !time || !allowedClubs.has(club) || !format || !scoringMethod || roster.length < 2 || (!conditions && !isEdit)) {
    return {
      error: "Заполни название, дату, время, выбери клуб, формат, методику, условия и минимум двух игроков с рейтингами.",
    };
  }

  if (format === "Americano" && (!Number.isInteger(pointsToWin) || pointsToWin < 1)) {
    return { error: "Для Americano укажи, до скольки очков идет розыгрыш." };
  }

  return {
    tournament: {
      club,
      conditions,
      createdAt: existingTournament?.createdAt ?? new Date().toISOString(),
      date,
      format,
      id: existingTournament?.id ?? `forecast-${Date.now()}-${randomUUID().slice(0, 8)}`,
      image: existingTournament?.image ?? "/assets/hero-court.png",
      league,
      players: `${roster.length} игроков`,
      pointsToWin,
      predictionCloseAt,
      roster,
      scoring: scoringMethod.name,
      scoringMethod: sanitizeScoringMethod(scoringMethod),
      scoringMethodId: scoringMethod.id,
      status: existingTournament?.status ?? "Прием прогнозов",
      time,
      timezone: "Asia/Vladivostok",
      title,
      updatedAt: existingTournament ? new Date().toISOString() : null,
    },
  };
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function handleApi(request, response, url) {
  const store = readStore();

  if (request.method === "GET" && url.pathname === "/api/auth/state") {
    const user = getAuthedUser(store, request);
    jsonResponse(response, 200, authPayload(store, user));
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/forecast-tournaments") {
    jsonResponse(response, 200, { tournaments: store.forecastTournaments.map((tournament) => sanitizeTournament(tournament, store.forecastPredictions)) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/completed-tournament-results") {
    jsonResponse(response, 200, {
      results: store.completedTournamentResults
        .map(sanitizeCompletedTournamentResult)
        .sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.importedAt).localeCompare(String(a.importedAt))),
    });
    return;
  }

  const completedResultTitleMatch = url.pathname.match(/^\/api\/admin\/completed-tournament-results\/([^/]+)$/);
  if (request.method === "PUT" && completedResultTitleMatch) {
    const admin = getAuthedUser(store, request);
    if (!isActiveAdmin(admin)) {
      jsonResponse(response, 403, { message: "Доступ только для админа." });
      return;
    }

    const resultIndex = store.completedTournamentResults.findIndex((result) => result.id === completedResultTitleMatch[1]);
    if (resultIndex === -1) {
      jsonResponse(response, 404, { message: "Турнир не найден." });
      return;
    }

    const body = await readJson(request);
    const title = cleanTournamentTitle(body.title);
    if (!title) {
      jsonResponse(response, 400, { message: "Название турнира не может быть пустым." });
      return;
    }

    store.completedTournamentResults[resultIndex] = {
      ...store.completedTournamentResults[resultIndex],
      title,
      updatedAt: new Date().toISOString(),
    };
    writeStore(store);
    jsonResponse(response, 200, {
      result: sanitizeCompletedTournamentResult(store.completedTournamentResults[resultIndex]),
      results: store.completedTournamentResults.map(sanitizeCompletedTournamentResult),
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/settings") {
    jsonResponse(response, 200, { settings: sanitizeSettings(store.settings) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/scoring-methods") {
    jsonResponse(response, 200, { methods: store.scoringMethods.map(sanitizeScoringMethod) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/leaderboard-point-methods") {
    jsonResponse(response, 200, { methods: store.leaderboardPointMethods.map(sanitizeLeaderboardPointMethod) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/forecast-leaderboard") {
    jsonResponse(response, 200, { leaders: getForecastLeaderboard(store) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/me/cabinet") {
    const user = getAuthedUser(store, request);
    if (user?.status !== "active") {
      jsonResponse(response, 403, { message: "Кабинет доступен только подтвержденным участникам." });
      return;
    }

    jsonResponse(response, 200, getUserCabinet(store, user));
    return;
  }

  if (request.method === "PUT" && url.pathname === "/api/me/profile") {
    const user = getAuthedUser(store, request);
    if (user?.status !== "active") {
      jsonResponse(response, 403, { message: "Профиль доступен только подтвержденным участникам." });
      return;
    }

    const body = await readJson(request);
    const lundaNick = String(body.lundaNick ?? "").trim();
    if (!lundaNick) {
      jsonResponse(response, 400, { message: "Укажи ник в Lunda." });
      return;
    }

    if (store.users.some((item) => item.id !== user.id && String(item.lundaNick ?? "").toLowerCase() === lundaNick.toLowerCase())) {
      jsonResponse(response, 409, { message: "Этот ник в Lunda уже занят." });
      return;
    }

    const userIndex = store.users.findIndex((item) => item.id === user.id);
    store.users[userIndex] = {
      ...store.users[userIndex],
      lundaNick,
      updatedAt: new Date().toISOString(),
    };
    writeStore(store);
    jsonResponse(response, 200, authPayload(store, store.users[userIndex]));
    return;
  }

  const ownPredictionMatch = url.pathname.match(/^\/api\/forecast-tournaments\/([^/]+)\/prediction$/);
  if ((request.method === "GET" || request.method === "PUT") && ownPredictionMatch) {
    const user = getAuthedUser(store, request);
    if (user?.status !== "active") {
      jsonResponse(response, 403, { message: "Прогнозы доступны только подтвержденным участникам." });
      return;
    }

    const tournament = store.forecastTournaments.find((item) => item.id === ownPredictionMatch[1]);
    if (!tournament) {
      jsonResponse(response, 404, { message: "Турнир не найден." });
      return;
    }

    const existingPrediction = store.forecastPredictions.find((prediction) => (
      prediction.tournamentId === tournament.id && prediction.userId === user.id
    ));

    if (request.method === "GET") {
      jsonResponse(response, 200, { prediction: sanitizeForecastPrediction(existingPrediction, tournament) });
      return;
    }

    const closeAt = parseVladivostokDateTime(tournament.predictionCloseAt);
    if (closeAt && Date.now() >= closeAt.getTime()) {
      jsonResponse(response, 400, { message: "Прием прогнозов уже закрыт." });
      return;
    }

    const body = await readJson(request);
    const normalized = normalizePredictionPlacements(body, tournament);
    if (normalized.error) {
      jsonResponse(response, 400, { message: normalized.error });
      return;
    }

    const now = new Date().toISOString();
    const prediction = {
      createdAt: existingPrediction?.createdAt ?? now,
      id: existingPrediction?.id ?? `prediction-${Date.now()}-${randomUUID().slice(0, 8)}`,
      placements: normalized.placements,
      tournamentId: tournament.id,
      updatedAt: now,
      userId: user.id,
    };

    if (existingPrediction) {
      const index = store.forecastPredictions.findIndex((item) => item.id === existingPrediction.id);
      store.forecastPredictions[index] = prediction;
    } else {
      store.forecastPredictions.push(prediction);
    }

    writeStore(store);
    jsonResponse(response, 200, {
      prediction: sanitizeForecastPrediction(prediction, tournament),
      predictionCount: getTournamentPredictionCount(tournament.id, store.forecastPredictions),
    });
    return;
  }

  const forecastResultsSummaryMatch = url.pathname.match(/^\/api\/forecast-tournaments\/([^/]+)\/results-summary$/);
  if (request.method === "GET" && forecastResultsSummaryMatch) {
    const viewer = getAuthedUser(store, request);
    if (viewer?.status !== "active") {
      jsonResponse(response, 403, { message: "Итоги прогнозов доступны только подтвержденным участникам." });
      return;
    }

    const tournament = store.forecastTournaments.find((item) => item.id === forecastResultsSummaryMatch[1]);
    if (!tournament) {
      jsonResponse(response, 404, { message: "Турнир не найден." });
      return;
    }

    jsonResponse(response, 200, getForecastResultsSummary(store, tournament, viewer));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/register") {
    const body = await readJson(request);
    const email = normalizeEmail(body.email);
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const lundaNick = String(body.lundaNick ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");

    if (!firstName || !lastName || !lundaNick || !email || !phone || password.length < 6) {
      jsonResponse(response, 400, { message: "Заполни все поля, пароль минимум 6 символов." });
      return;
    }

    if (store.users.some((user) => user.email === email)) {
      jsonResponse(response, 409, { message: "Аккаунт с такой почтой уже есть." });
      return;
    }

    if (store.users.some((user) => String(user.lundaNick ?? "").toLowerCase() === lundaNick.toLowerCase())) {
      jsonResponse(response, 409, { message: "Этот ник в Lunda уже занят." });
      return;
    }

    const isFirstUser = store.users.length === 0;
    const passwordData = hashPassword(password);
    const user = {
      approvedAt: isFirstUser ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      email,
      firstName,
      id: randomUUID(),
      lastName,
      lundaNick,
      passwordHash: passwordData.hash,
      passwordSalt: passwordData.salt,
      phone,
      role: isFirstUser ? "admin" : "member",
      status: isFirstUser ? "active" : "pending",
    };

    store.users.push(user);
    const token = makeSession(store, user.id);
    writeStore(store);
    jsonResponse(response, 201, authPayload(store, user, token));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await readJson(request);
    const email = normalizeEmail(body.email);
    const password = String(body.password ?? "");
    const user = store.users.find((item) => item.email === email);

    if (!user || !verifyPassword(password, user)) {
      jsonResponse(response, 401, { message: "Почта или пароль не совпали." });
      return;
    }

    const token = makeSession(store, user.id);
    writeStore(store);
    jsonResponse(response, 200, authPayload(store, user, token));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/logout") {
    const token = getToken(request);
    const tokenHash = createHash("sha256").update(token).digest("hex");
    writeStore({
      ...store,
      sessions: store.sessions.filter((session) => session.tokenHash !== tokenHash),
    });
    jsonResponse(response, 200, { ok: true });
    return;
  }

  const notificationReadMatch = url.pathname.match(/^\/api\/notifications\/([^/]+)\/read$/);
  if (request.method === "POST" && notificationReadMatch) {
    const user = getAuthedUser(store, request);
    if (!user) {
      jsonResponse(response, 401, { message: "Нужно войти в аккаунт." });
      return;
    }

    const notification = store.notifications.find((item) => item.id === notificationReadMatch[1] && item.userId === user.id);
    if (!notification) {
      jsonResponse(response, 404, { message: "Уведомление не найдено." });
      return;
    }

    notification.readAt = notification.readAt ?? new Date().toISOString();
    writeStore(store);
    jsonResponse(response, 200, authPayload(store, user));
    return;
  }

  const predictionsSummaryMatch = url.pathname.match(/^\/api\/(?:admin\/)?forecast-tournaments\/([^/]+)\/predictions-summary$/);
  if (request.method === "GET" && predictionsSummaryMatch) {
    const viewer = getAuthedUser(store, request);
    const isAdminRequest = url.pathname.startsWith("/api/admin/");
    const canViewRegistry = isActiveAdmin(viewer) || (viewer?.status === "active" && sanitizeSettings(store.settings).predictionRegistryVisibility === "all");
    if ((isAdminRequest && !isActiveAdmin(viewer)) || !canViewRegistry) {
      jsonResponse(response, 403, { message: "Реестр прогнозов сейчас доступен только админу." });
      return;
    }

    const tournament = store.forecastTournaments.find((item) => item.id === predictionsSummaryMatch[1]);
    if (!tournament) {
      jsonResponse(response, 404, { message: "Турнир не найден." });
      return;
    }

    const resultsSummary = getForecastResultsSummary(store, tournament, viewer);
    const predictions = store.forecastPredictions
      .filter((prediction) => prediction.tournamentId === tournament.id)
      .map((prediction) => {
        const predictionUser = store.users.find((item) => item.id === prediction.userId);
        const details = getPredictionDetails(prediction, tournament);
        const scored = resultsSummary.completed
          ? resultsSummary.leaderboard.find((row) => row.userId === prediction.userId)
          : null;

        return {
          email: isActiveAdmin(viewer) ? predictionUser?.email ?? "" : "",
          lundaNick: predictionUser?.lundaNick ?? "",
          name: predictionUser ? `${predictionUser.firstName} ${predictionUser.lastName}`.trim() || predictionUser.lundaNick : "Участник",
          needsReview: details.needsReview,
          points: scored?.points ?? 0,
          rank: scored?.rank ?? null,
          updatedAt: prediction.updatedAt,
          userId: prediction.userId,
        };
      })
      .sort((a, b) => (b.points - a.points) || Number(b.needsReview) - Number(a.needsReview) || String(a.name).localeCompare(String(b.name)));

    jsonResponse(response, 200, {
      completed: resultsSummary.completed,
      needsReviewCount: predictions.filter((prediction) => prediction.needsReview).length,
      predictionCount: predictions.length,
      predictions,
      visibility: sanitizeSettings(store.settings).predictionRegistryVisibility,
    });
    return;
  }

  const approveMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/approve$/);
  if (request.method === "POST" && approveMatch) {
    const admin = getAuthedUser(store, request);
    if (!isActiveAdmin(admin)) {
      jsonResponse(response, 403, { message: "Доступ только для админа." });
      return;
    }

    const targetUser = store.users.find((user) => user.id === approveMatch[1]);
    if (!targetUser) {
      jsonResponse(response, 404, { message: "Заявка не найдена." });
      return;
    }

    targetUser.status = "active";
    targetUser.approvedAt = new Date().toISOString();
    writeStore(store);
    jsonResponse(response, 200, authPayload(store, admin));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/admin/forecast-tournaments") {
    const admin = getAuthedUser(store, request);
    if (!isActiveAdmin(admin)) {
      jsonResponse(response, 403, { message: "Доступ только для админа." });
      return;
    }

    const body = await readJson(request);
    const result = buildForecastTournamentFromBody(body, store);
    if (result.error) {
      jsonResponse(response, 400, { message: result.error });
      return;
    }

    const { tournament } = result;

    store.forecastTournaments.unshift(tournament);
    writeStore(store);
    jsonResponse(response, 201, {
      tournament: sanitizeTournament(tournament, store.forecastPredictions),
      tournaments: store.forecastTournaments.map((item) => sanitizeTournament(item, store.forecastPredictions)),
    });
    return;
  }

  const forecastTournamentResultsPreviewMatch = url.pathname.match(/^\/api\/admin\/forecast-tournaments\/([^/]+)\/results\/preview$/);
  if (request.method === "POST" && forecastTournamentResultsPreviewMatch) {
    const admin = getAuthedUser(store, request);
    if (!isActiveAdmin(admin)) {
      jsonResponse(response, 403, { message: "Доступ только для админа." });
      return;
    }

    const tournament = store.forecastTournaments.find((item) => item.id === forecastTournamentResultsPreviewMatch[1]);
    if (!tournament) {
      jsonResponse(response, 404, { message: "Турнир не найден." });
      return;
    }

    const body = await readJson(request);
    const fileDataBase64 = String(body.fileDataBase64 ?? "");
    if (!fileDataBase64) {
      jsonResponse(response, 400, { message: "Загрузи Excel-файл с результатами." });
      return;
    }

    try {
      const preview = normalizeImportPreviewNames(parseResultsWorkbook(Buffer.from(fileDataBase64, "base64")), tournament);
      jsonResponse(response, 200, {
        preview: {
          ...preview,
          fileName: String(body.fileName ?? ""),
          previewId: `results-preview-${Date.now()}-${randomUUID().slice(0, 8)}`,
          targetTournament: sanitizeTournament(tournament, store.forecastPredictions),
        },
      });
    } catch (error) {
      jsonResponse(response, 400, { message: error.message || "Excel не удалось распознать." });
    }
    return;
  }

  const forecastTournamentResultsConfirmMatch = url.pathname.match(/^\/api\/admin\/forecast-tournaments\/([^/]+)\/results\/confirm$/);
  if (request.method === "POST" && forecastTournamentResultsConfirmMatch) {
    const admin = getAuthedUser(store, request);
    if (!isActiveAdmin(admin)) {
      jsonResponse(response, 403, { message: "Доступ только для админа." });
      return;
    }

    const tournamentIndex = store.forecastTournaments.findIndex((item) => item.id === forecastTournamentResultsConfirmMatch[1]);
    if (tournamentIndex === -1) {
      jsonResponse(response, 404, { message: "Турнир не найден." });
      return;
    }

    const body = await readJson(request);
    const preview = body.preview && typeof body.preview === "object" ? body.preview : null;
    if (!preview) {
      jsonResponse(response, 400, { message: "Сначала распознай Excel и проверь предпросмотр." });
      return;
    }

    const built = buildCompletedResultFromImport({
      fileName: body.fileName,
      preview,
      tournament: store.forecastTournaments[tournamentIndex],
    });
    if (built.error) {
      jsonResponse(response, 400, { message: built.error });
      return;
    }

    const previousResultIndex = store.completedTournamentResults.findIndex((result) => result.forecastTournamentId === store.forecastTournaments[tournamentIndex].id);
    if (previousResultIndex >= 0) {
      store.completedTournamentResults[previousResultIndex] = {
        ...built.result,
        id: store.completedTournamentResults[previousResultIndex].id,
        createdAt: store.completedTournamentResults[previousResultIndex].createdAt,
        updatedAt: new Date().toISOString(),
      };
    } else {
      store.completedTournamentResults.unshift(built.result);
    }

    store.forecastTournaments[tournamentIndex] = {
      ...store.forecastTournaments[tournamentIndex],
      completedResultId: previousResultIndex >= 0 ? store.completedTournamentResults[previousResultIndex].id : built.result.id,
      resultsImportedAt: new Date().toISOString(),
      status: "Результаты внесены",
      updatedAt: new Date().toISOString(),
    };
    writeStore(store);
    jsonResponse(response, 200, {
      forecastLeaders: getForecastLeaderboard(store),
      result: sanitizeCompletedTournamentResult(previousResultIndex >= 0 ? store.completedTournamentResults[previousResultIndex] : built.result),
      results: store.completedTournamentResults.map(sanitizeCompletedTournamentResult),
      tournament: sanitizeTournament(store.forecastTournaments[tournamentIndex], store.forecastPredictions),
      tournaments: store.forecastTournaments.map((item) => sanitizeTournament(item, store.forecastPredictions)),
    });
    return;
  }

  const forecastTournamentMatch = url.pathname.match(/^\/api\/admin\/forecast-tournaments\/([^/]+)$/);
  if ((request.method === "PUT" || request.method === "DELETE") && forecastTournamentMatch) {
    const admin = getAuthedUser(store, request);
    if (!isActiveAdmin(admin)) {
      jsonResponse(response, 403, { message: "Доступ только для админа." });
      return;
    }

    const tournamentIndex = store.forecastTournaments.findIndex((tournament) => tournament.id === forecastTournamentMatch[1]);
    if (tournamentIndex === -1) {
      jsonResponse(response, 404, { message: "Турнир не найден." });
      return;
    }

    if (request.method === "DELETE") {
      const [deletedTournament] = store.forecastTournaments.splice(tournamentIndex, 1);
      store.forecastPredictions = store.forecastPredictions.filter((prediction) => prediction.tournamentId !== deletedTournament.id);
      writeStore(store);
      jsonResponse(response, 200, {
        deletedTournament: sanitizeTournament(deletedTournament, store.forecastPredictions),
        tournaments: store.forecastTournaments.map((item) => sanitizeTournament(item, store.forecastPredictions)),
      });
      return;
    }

    const body = await readJson(request);
    const result = buildForecastTournamentFromBody(body, store, store.forecastTournaments[tournamentIndex]);
    if (result.error) {
      jsonResponse(response, 400, { message: result.error });
      return;
    }

    store.forecastTournaments[tournamentIndex] = applyTournamentRosterChange(
      store,
      store.forecastTournaments[tournamentIndex],
      result.tournament,
    );
    writeStore(store);
    jsonResponse(response, 200, {
      tournament: sanitizeTournament(store.forecastTournaments[tournamentIndex], store.forecastPredictions),
      tournaments: store.forecastTournaments.map((item) => sanitizeTournament(item, store.forecastPredictions)),
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/admin/scoring-methods") {
    const admin = getAuthedUser(store, request);
    if (!isActiveAdmin(admin)) {
      jsonResponse(response, 403, { message: "Доступ только для админа." });
      return;
    }

    const body = await readJson(request);
    const method = {
      createdAt: new Date().toISOString(),
      description: String(body.description ?? "").trim(),
      exactPlace: Number(body.exactPlace),
      formats: String(body.formats ?? "").trim(),
      id: `scoring-${Date.now()}-${randomUUID().slice(0, 8)}`,
      lastPlaceBonus: Number(body.lastPlaceBonus),
      name: String(body.name ?? "").trim(),
      onePositionError: Number(body.onePositionError),
      top3AnyOrderBonus: Number(body.top3AnyOrderBonus),
      top3ExactBonus: Number(body.top3ExactBonus),
      twoPositionError: Number(body.twoPositionError),
    };

    const numbers = [
      method.exactPlace,
      method.onePositionError,
      method.twoPositionError,
      method.top3ExactBonus,
      method.top3AnyOrderBonus,
      method.lastPlaceBonus,
    ];

    if (!method.name || !method.formats || numbers.some((value) => !Number.isFinite(value) || value < 0)) {
      jsonResponse(response, 400, { message: "Заполни название, форматы и все числовые поля методики." });
      return;
    }

    store.scoringMethods.push(method);
    writeStore(store);
    jsonResponse(response, 201, {
      method: sanitizeScoringMethod(method),
      methods: store.scoringMethods.map(sanitizeScoringMethod),
    });
    return;
  }

  const leaderboardMethodMatch = url.pathname.match(/^\/api\/admin\/leaderboard-point-methods\/([^/]+)$/);
  if (request.method === "PUT" && leaderboardMethodMatch) {
    const admin = getAuthedUser(store, request);
    if (!isActiveAdmin(admin)) {
      jsonResponse(response, 403, { message: "Доступ только для админа." });
      return;
    }

    const body = await readJson(request);
    const methodIndex = store.leaderboardPointMethods.findIndex((method) => method.id === leaderboardMethodMatch[1]);
    if (methodIndex === -1) {
      jsonResponse(response, 404, { message: "Методика очков не найдена." });
      return;
    }

    const points = body.points && typeof body.points === "object" ? body.points : null;
    const requiredKeys = ["individual_12", "individual_16", "team_6", "team_8"];
    const hasAllKeys = points && requiredKeys.every((key) => points[key] && typeof points[key] === "object");
    const allValuesValid = hasAllKeys && requiredKeys.every((key) => (
      Object.values(points[key]).every((value) => Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) % 5 === 0)
    ));

    if (!String(body.name ?? "").trim() || !allValuesValid) {
      jsonResponse(response, 400, { message: "Заполни название и таблицу очков: значения должны быть целыми, не ниже 0 и кратными пяти." });
      return;
    }

    store.leaderboardPointMethods[methodIndex] = {
      ...store.leaderboardPointMethods[methodIndex],
      description: String(body.description ?? "").trim(),
      name: String(body.name ?? "").trim(),
      points,
      updatedAt: new Date().toISOString(),
    };
    writeStore(store);
    jsonResponse(response, 200, {
      method: sanitizeLeaderboardPointMethod(store.leaderboardPointMethods[methodIndex]),
      methods: store.leaderboardPointMethods.map(sanitizeLeaderboardPointMethod),
    });
    return;
  }

  if (request.method === "PUT" && url.pathname === "/api/admin/settings") {
    const admin = getAuthedUser(store, request);
    if (!isActiveAdmin(admin)) {
      jsonResponse(response, 403, { message: "Доступ только для админа." });
      return;
    }

    const body = await readJson(request);
    store.settings = sanitizeSettings({
      ...store.settings,
      predictionRegistryVisibility: body.predictionRegistryVisibility,
    });
    writeStore(store);
    jsonResponse(response, 200, { settings: sanitizeSettings(store.settings) });
    return;
  }

  jsonResponse(response, 404, { message: "API endpoint не найден." });
}

function serveStatic(request, response, url) {
  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const normalizedPath = normalize(decodeURIComponent(requestedPath)).replace(/^(\.\.(\/|\\|$))+/, "");
  let filePath = join(distDir, normalizedPath);

  if (!existsSync(filePath) || url.pathname.startsWith("/api/")) {
    filePath = join(distDir, "index.html");
  }

  const extension = extname(filePath);
  response.writeHead(200, { "Content-Type": mimeTypes[extension] ?? "application/octet-stream" });
  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }

    serveStatic(request, response, url);
  } catch (error) {
    jsonResponse(response, 500, { message: "Сервер не смог обработать запрос." });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Padel Brazzers server is running on port ${port}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}, shutting down gracefully`);
  server.close(() => {
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(0);
  }, 5000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
