import { createHash, pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const distDir = join(rootDir, "dist");
const dataDir = process.env.DATA_DIR ?? join(rootDir, "data");
const storePath = join(dataDir, "auth-store.json");
const port = Number(process.env.PORT ?? 4173);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function ensureStore() {
  mkdirSync(dataDir, { recursive: true });
  if (!existsSync(storePath)) {
    writeFileSync(storePath, JSON.stringify({ sessions: [], users: [] }, null, 2));
  }
}

function readStore() {
  ensureStore();

  try {
    const parsed = JSON.parse(readFileSync(storePath, "utf8"));
    return {
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      users: Array.isArray(parsed.users) ? parsed.users : [],
    };
  } catch {
    return { sessions: [], users: [] };
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

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const { passwordHash, passwordSalt, ...safeUser } = user;
  return safeUser;
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
    user: sanitizeUser(user),
    users: isActiveAdmin(user) ? store.users.map(sanitizeUser) : [],
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
