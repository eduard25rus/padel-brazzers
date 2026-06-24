import { createHash, pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

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

function sanitizeSettings(settings = {}) {
  return {
    predictionRegistryVisibility: settings.predictionRegistryVisibility === "all" ? "all" : "admin",
  };
}

function ensureStore() {
  mkdirSync(dataDir, { recursive: true });
  if (!existsSync(storePath)) {
    writeFileSync(storePath, JSON.stringify({ forecastPredictions: [], forecastTournaments: [], notifications: [], scoringMethods: [defaultScoringMethod], sessions: [], settings: defaultSettings, users: [] }, null, 2));
  }
}

function readStore() {
  ensureStore();

  try {
    const parsed = JSON.parse(readFileSync(storePath, "utf8"));
    const scoringMethods = Array.isArray(parsed.scoringMethods) && parsed.scoringMethods.length > 0
      ? parsed.scoringMethods
      : [defaultScoringMethod];

    return {
      forecastPredictions: Array.isArray(parsed.forecastPredictions) ? parsed.forecastPredictions : [],
      forecastTournaments: Array.isArray(parsed.forecastTournaments) ? parsed.forecastTournaments : [],
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      scoringMethods,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      settings: sanitizeSettings(parsed.settings),
      users: Array.isArray(parsed.users) ? parsed.users : [],
    };
  } catch {
    return { forecastPredictions: [], forecastTournaments: [], notifications: [], scoringMethods: [defaultScoringMethod], sessions: [], settings: defaultSettings, users: [] };
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

function sanitizeTournament(tournament, forecastPredictions = []) {
  const roster = Array.isArray(tournament.roster) ? tournament.roster : [];

  return {
    club: tournament.club ?? "Padel Pro Club",
    conditions: tournament.conditions ?? "",
    createdAt: tournament.createdAt,
    date: tournament.date ?? "",
    format: tournament.format ?? "",
    id: tournament.id,
    image: tournament.image ?? "/assets/hero-court.png",
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
    time: tournament.time ?? "",
    timezone: tournament.timezone ?? "Asia/Vladivostok",
    title: tournament.title ?? "Будущий турнир",
    updatedAt: tournament.updatedAt ?? null,
  };
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
    ...Array.from({ length: 16 }, (_, index) => index + 1).filter((place) => !placements.some((placement) => Number(placement.place) === place)),
  ]
    .filter((place, index, places) => Number.isInteger(place) && place >= 1 && place <= 16 && places.indexOf(place) === index)
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
  const rosterIds = new Set(roster.map((player) => String(player.id ?? player.name)));
  const requiredIds = roster.slice(0, 16).map((player) => String(player.id ?? player.name));
  const sourcePlacements = Array.isArray(body.placements) ? body.placements : [];
  const placements = sourcePlacements
    .map((placement, index) => {
      if (!placement) {
        return null;
      }

      const place = Number(placement.place ?? index + 1);
      const playerId = String(placement.playerId ?? "").trim();
      if (!Number.isInteger(place) || place < 1 || place > 16 || !playerId || !rosterIds.has(playerId)) {
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

  if (request.method === "GET" && url.pathname === "/api/settings") {
    jsonResponse(response, 200, { settings: sanitizeSettings(store.settings) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/scoring-methods") {
    jsonResponse(response, 200, { methods: store.scoringMethods.map(sanitizeScoringMethod) });
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

    if (store.users.some((user) => user.lundaNick.toLowerCase() === lundaNick.toLowerCase())) {
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

    const predictions = store.forecastPredictions
      .filter((prediction) => prediction.tournamentId === tournament.id)
      .map((prediction) => {
        const predictionUser = store.users.find((item) => item.id === prediction.userId);
        const details = getPredictionDetails(prediction, tournament);

        return {
          email: isActiveAdmin(viewer) ? predictionUser?.email ?? "" : "",
          lundaNick: predictionUser?.lundaNick ?? "",
          name: predictionUser ? `${predictionUser.firstName} ${predictionUser.lastName}`.trim() || predictionUser.lundaNick : "Участник",
          needsReview: details.needsReview,
          updatedAt: prediction.updatedAt,
          userId: prediction.userId,
        };
      })
      .sort((a, b) => Number(b.needsReview) - Number(a.needsReview) || String(a.name).localeCompare(String(b.name)));

    jsonResponse(response, 200, {
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
