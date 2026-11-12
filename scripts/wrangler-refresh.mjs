#!/usr/bin/env node
// wrangler-refresh.mjs v2 - directional, identity-aware wrangler token management
//
// Two files, two different roles (multi-account safe):
//
//   tools.toml                        THIS project's account credentials (source of truth)
//   ~/.wrangler/config/default.toml   wrangler's active slot - may hold ANY account at any
//                                     time (you work on several projects / accounts)
//
// Modes:
//   (default) activate   Make the slot hold THIS project's token (replaces switchenv.bat).
//                        Refreshes the project token first if it is expired / low.
//   --archive            Copy the slot's token back into tools.toml - but ONLY after
//                        verifying via the API that it belongs to this project's account
//                        (replaces switchenvbk.bat; also the tail of `npm run deploy` and
//                        `npm run se`, so a token rotated by wrangler mid-command is kept).
//   --adopt              Copy the slot's token into tools.toml UNCONDITIONALLY and re-stamp
//                        the project identity. This is how you intentionally point this
//                        project at a different account: `npx wrangler login`, then adopt.
//                        (`npm run login` does exactly this.)
//
// Identity: tools.toml carries a marker comment `# wrangler-refresh account: <email>`,
// stamped after API verification (GET /user with the oauth token works as Bearer on
// api.cloudflare.com while the token is alive). Archive compares the slot token's email
// against the marker and refuses loudly on mismatch, so a foreign account in the slot can
// never silently overwrite this project's backup.
//
// Hard rules (learned the hard way on 2026-11-11):
//   - Cloudflare refresh tokens are single-use, and replaying a consumed one revokes the
//     ENTIRE token lineage. So this script NEVER tries a refresh token it does not believe
//     is current, and never falls back to "the other file's" refresh token. On refresh
//     failure the only correct action is `npm run login`.
//   - Because of that, the archive step after deploy is not optional: if wrangler rotates
//     the token mid-deploy, tools.toml's stored refresh_token is dead from that moment.
//     Archive adopts the new generation; activate additionally recovers this case via the
//     "slot holds a newer same-account token" check.
//
// Other notes:
// - dash.cloudflare.com / api.cloudflare.com are directly reachable from this machine;
//   no proxy is used (Node fetch has no socks5 support anyway).
// - Console output is ASCII-only on purpose (Windows console codepage is GBK).
// - Exits non-zero on failure so && chains stop loudly.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROJ_PATH = join(ROOT, "tools.toml");
const SLOT_PATH = join(homedir(), ".wrangler", "config", "default.toml");

const TOKEN_URL = "https://dash.cloudflare.com/oauth2/token";
const USER_URL = "https://api.cloudflare.com/client/v4/user";
const MIN_VALID_MS = 10 * 60 * 1000; // refresh if less than 10 min of life remains
const FALLBACK_CLIENT_ID = "54d11594-84e4-41aa-b438-e81b8fa78ee7"; // wrangler 4.x production
const MARKER_RE = /^([ \t]*#[ \t]*wrangler-refresh account:[ \t]*)(\S+)[ \t\r]*$/m;
const TEMPLATE = 'oauth_token = ""\nexpiration_time = ""\nrefresh_token = ""\n';

const TAG = "[wrangler-refresh]";
const log = (msg) => console.log(`${TAG} ${msg}`);
const fail = (msg) => {
  console.error(`${TAG} ERROR: ${msg}`);
  process.exit(1);
};

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0) return "activate";
  if (args[0] === "--archive" || args[0] === "-a") return "archive";
  if (args[0] === "--adopt") return "adopt";
  fail(`unknown argument "${args[0]}" - usage: node scripts/wrangler-refresh.mjs [--archive | --adopt]`);
}

function parseToml(text) {
  const get = (key) => text.match(new RegExp(`^\\s*${key}\\s*=\\s*"([^"]*)"`, "m"))?.[1] ?? null;
  const oauth_token = get("oauth_token");
  const refresh_token = get("refresh_token");
  const expiration_time = get("expiration_time");
  const parsed = expiration_time ? Date.parse(expiration_time) : NaN;
  return {
    oauth_token,
    refresh_token,
    expiration_time,
    expMs: Number.isNaN(parsed) ? 0 : parsed,
    marker: text.match(MARKER_RE)?.[2] ?? null,
  };
}

function loadSide(label, path) {
  let text = "";
  try {
    text = existsSync(path) ? readFileSync(path, "utf8") : "";
  } catch (err) {
    log(`WARN cannot read ${path}: ${err.message}`);
  }
  const toml = text ? parseToml(text) : null;
  const hasPair = !!(toml && (toml.oauth_token || toml.refresh_token));
  return { label, path, text, toml: hasPair ? toml : null };
}

const alive = (t) => !!t && t.expMs > Date.now(); // identity checks work on any unexpired token
const pairOf = (t) => ({ oauth_token: t.oauth_token, refresh_token: t.refresh_token, expiration_time: t.expiration_time });
const samePair = (a, b) =>
  !!a && !!b && a.oauth_token === b.oauth_token && a.refresh_token === b.refresh_token && a.expiration_time === b.expiration_time;

function findWranglerCli() {
  const direct = join(ROOT, "node_modules", "wrangler", "wrangler-dist", "cli.js");
  if (existsSync(direct)) return direct;
  const pnpm = join(ROOT, "node_modules", ".pnpm");
  try {
    for (const entry of readdirSync(pnpm)) {
      if (!entry.startsWith("wrangler@")) continue;
      const candidate = join(pnpm, entry, "node_modules", "wrangler", "wrangler-dist", "cli.js");
      if (existsSync(candidate)) return candidate;
    }
  } catch {
    // no .pnpm directory
  }
  return null;
}

function getClientId() {
  if (process.env.WRANGLER_CLIENT_ID) return { id: process.env.WRANGLER_CLIENT_ID, from: "env WRANGLER_CLIENT_ID" };
  const cli = findWranglerCli();
  if (cli) {
    try {
      const src = readFileSync(cli, "utf8");
      // bundle embeds: variableName: "WRANGLER_CLIENT_ID", defaultValue: env === "staging" ? "<staging>" : "<production>"
      const m = src.match(
        /"WRANGLER_CLIENT_ID"[\s\S]{0,400}?"staging"\s*\?\s*"([0-9a-f-]{36})"\s*:\s*"([0-9a-f-]{36})"/
      );
      if (m) return { id: m[2], from: cli };
    } catch {
      // unreadable bundle
    }
  }
  return { id: FALLBACK_CLIENT_ID, from: "hardcoded fallback" };
}

async function refreshAccessToken(refreshToken, clientId) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  }).toString();
  let res;
  try {
    res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
      body,
      signal: AbortSignal.timeout(25000),
    });
  } catch (err) {
    throw new Error(`cannot reach ${TOKEN_URL}: ${err.message}`);
  }
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} ${text.slice(0, 180).replace(/\s+/g, " ")}`);
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`non-JSON response: ${text.slice(0, 180)}`);
  }
  if (!json.access_token || !json.refresh_token || !json.expires_in) {
    throw new Error(`response missing access_token/refresh_token/expires_in: ${text.slice(0, 180)}`);
  }
  return json;
}

async function apiUserEmail(accessToken) {
  let res;
  try {
    res = await fetch(USER_URL, {
      headers: { authorization: `Bearer ${accessToken}`, accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
  } catch (err) {
    throw new Error(`cannot reach ${USER_URL}: ${err.message}`);
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`GET /user HTTP ${res.status} code ${json?.errors?.[0]?.code ?? "?"}`);
  const email = json?.result?.email;
  if (!email) throw new Error("no email in /user response");
  return email;
}

// best-effort identity of a side; null if the token is dead or /user fails
async function identify(toml) {
  if (!toml?.oauth_token || !alive(toml)) return null;
  try {
    return await apiUserEmail(toml.oauth_token);
  } catch {
    return null;
  }
}

function upsert(text, pair) {
  let out = text;
  for (const [key, value] of [
    ["oauth_token", pair.oauth_token],
    ["refresh_token", pair.refresh_token],
    ["expiration_time", pair.expiration_time],
  ]) {
    const re = new RegExp(`^(\\s*${key}\\s*=\\s*)"[^"]*"`, "m");
    if (re.test(out)) out = out.replace(re, (_m, prefix) => `${prefix}"${value}"`);
    else out += `${key} = "${value}"\n`;
  }
  if (!out.endsWith("\n")) out += "\n";
  return out;
}

function withMarker(text, email) {
  if (!email) return text;
  if (MARKER_RE.test(text)) return text.replace(MARKER_RE, `$1${email}`);
  return `# wrangler-refresh account: ${email}\n${text}`;
}

function stripMarker(text) {
  return text.replace(MARKER_RE, "");
}

function writeSide(side, pair, markerEmail) {
  // base text: keep this file's own extra keys (scopes etc.); clone the other side if empty
  let base = side.toml ? side.text : "";
  if (!base) base = TEMPLATE;
  let out = upsert(base, pair);
  out = side.path === PROJ_PATH ? withMarker(out, markerEmail) : stripMarker(out);
  try {
    mkdirSync(dirname(side.path), { recursive: true });
    writeFileSync(side.path, out, "utf8");
  } catch (err) {
    fail(`cannot write ${side.path}: ${err.message}`);
  }
}

// ---------------------------------------------------------------- activate
async function activate() {
  const proj = loadSide("project", PROJ_PATH);
  const slot = loadSide("slot", SLOT_PATH);
  if (!proj.toml) fail(`${PROJ_PATH} has no oauth token - run \`npm run login\``);

  let pair = pairOf(proj.toml);
  let marker = proj.toml.marker;
  let projDirty = false;

  if (!marker) {
    const email = await identify(proj.toml);
    if (email) {
      marker = email;
      projDirty = true;
      log(`project account identified via API: ${email}`);
    } else {
      log("WARN project identity unknown (token dead, no marker) - will retry after refresh");
    }
  }

  // late-archive recovery: wrangler rotated the token mid-command during an earlier run and
  // the archive step never happened -> the slot holds a NEWER generation of the SAME
  // account. tools.toml's refresh_token is already consumed by that rotation, so using it
  // would trip Cloudflare's replay detection. Adopt the slot's generation instead.
  const slotNewer = slot.toml && slot.toml.expMs > proj.toml.expMs && alive(slot.toml);
  if (slotNewer) {
    const slotEmail = await identify(slot.toml);
    const projEmail = marker ?? (await identify(proj.toml));
    if (slotEmail && projEmail && slotEmail === projEmail) {
      pair = pairOf(slot.toml);
      projDirty = true;
      log(`slot holds a newer token of account ${slotEmail} (rotation was never archived) - adopting it into tools.toml instead of refreshing`);
    } else {
      log(`slot holds ${slotEmail ?? "an unidentifiable"} token - it will be replaced by this project's account${marker ? ` (${marker})` : ""}`);
    }
  } else if (slot.toml && !samePair(slot.toml, pair)) {
    const slotEmail = await identify(slot.toml);
    log(`slot currently holds ${slotEmail ?? "an expired/unknown"} token - replacing with this project's account${marker ? ` (${marker})` : ""}`);
  }

  const remainingMs = Date.parse(pair.expiration_time) - Date.now();
  const needsRefresh = !pair.oauth_token || Number.isNaN(remainingMs) || remainingMs < MIN_VALID_MS;
  if (needsRefresh) {
    if (!pair.refresh_token) fail("project token has no refresh_token - run `npm run login`");
    const { id: clientId, from: clientFrom } = getClientId();
    if (!pair.oauth_token) log("project access token missing -> refreshing");
    else if (Number.isNaN(remainingMs)) log("project token has no valid expiration_time -> refreshing");
    else if (remainingMs <= 0) log(`project token expired ${Math.round(-remainingMs / 60000)} min ago -> refreshing`);
    else log(`project token expires in ${Math.round(remainingMs / 60000)} min (< ${MIN_VALID_MS / 60000} min guard) -> refreshing`);
    log(`client_id ${clientId} (${clientFrom})`);

    let json;
    try {
      json = await refreshAccessToken(pair.refresh_token, clientId);
    } catch (err) {
      fail(
        `token refresh failed (${err.message}).\n` +
          `The lineage is likely revoked or rotated - Cloudflare revokes the whole family if a\n` +
          `consumed refresh token is ever replayed, so there is no safe automatic recovery.\n` +
          `Run: npm run login`
      );
    }
    pair = {
      oauth_token: json.access_token,
      refresh_token: json.refresh_token,
      expiration_time: new Date(Date.now() + json.expires_in * 1000).toISOString(),
    };
    projDirty = true;
    log(`refreshed ok, valid until ${pair.expiration_time}`);

    if (!marker) {
      const email = await identify({ oauth_token: pair.oauth_token, expMs: Infinity });
      if (email) {
        marker = email;
        log(`project account identified: ${email}`);
      } else {
        log("WARN could not identify account after refresh (continuing without marker)");
      }
    }
  }

  if (projDirty || !samePair(proj.toml, pair) || proj.toml.marker !== marker) {
    writeSide(proj, pair, marker);
    log(`wrote project ${PROJ_PATH}`);
  } else {
    log("project file already up to date, skip");
  }

  if (samePair(slot.toml, pair)) {
    log("slot already holds this project's token, skip");
  } else {
    writeSide(slot, pair, null);
    log(`activated project token into slot ${SLOT_PATH}`);
  }

  log(`done - account ${marker ?? "?"}, token valid until ${pair.expiration_time}`);
}

// ---------------------------------------------------------------- archive
async function archive() {
  const proj = loadSide("project", PROJ_PATH);
  const slot = loadSide("slot", SLOT_PATH);
  if (!slot.toml) {
    log("slot has no token - nothing to archive");
    return;
  }
  if (samePair(proj.toml, slot.toml)) {
    log("project backup already matches the slot, skip");
    return;
  }
  if (!alive(slot.toml)) {
    fail(
      `slot token expired - cannot verify its owner, refusing to archive.\n` +
        `Run \`npm run se\` first (it activates this project's token), or use --adopt to force.`
    );
  }

  let slotEmail;
  try {
    slotEmail = await apiUserEmail(slot.toml.oauth_token);
  } catch (err) {
    fail(`cannot verify slot token owner (${err.message}) - refusing to archive`);
  }

  let projEmail = proj.toml?.marker ?? null;
  if (!projEmail && proj.toml) {
    projEmail = await identify(proj.toml);
    if (projEmail) log(`project identity confirmed via API: ${projEmail}`);
  }
  if (proj.toml && !projEmail) {
    fail(`cannot determine this project's account identity (token expired, no marker) - run \`npm run se\` first`);
  }
  if (projEmail && slotEmail !== projEmail) {
    fail(
      `REFUSING to archive: the slot holds ${slotEmail} but this project's account is ${projEmail}.\n` +
        `If you really want to switch this project to ${slotEmail}, run:\n` +
        `  node scripts/wrangler-refresh.mjs --adopt`
    );
  }

  writeSide(proj, pairOf(slot.toml), slotEmail);
  log(`archived slot token (${slotEmail}) -> ${PROJ_PATH}`);
}

// ---------------------------------------------------------------- adopt
async function adopt() {
  const proj = loadSide("project", PROJ_PATH);
  const slot = loadSide("slot", SLOT_PATH);
  if (!slot.toml) fail(`slot has no token - run \`npx wrangler login\` first`);
  if (!alive(slot.toml)) fail(`slot token is expired - run \`npx wrangler login\` again, then rerun --adopt`);

  let email;
  try {
    email = await apiUserEmail(slot.toml.oauth_token);
  } catch (err) {
    fail(`cannot identify the slot's account (${err.message}) - rerun right after a fresh login`);
  }

  const old = proj.toml?.marker ?? null;
  if (samePair(proj.toml, slot.toml) && old === email) {
    log(`project already holds this account (${email}), skip`);
    return;
  }

  writeSide(proj, pairOf(slot.toml), email);
  if (old && old !== email) {
    log(`ACCOUNT SWITCH: tools.toml now holds ${email} (was ${old})`);
  } else {
    log(`adopted slot account ${email} into tools.toml`);
  }
}

const mode = parseArgs();
try {
  if (mode === "activate") await activate();
  else if (mode === "archive") await archive();
  else await adopt();
} catch (err) {
  fail(err?.stack ?? String(err));
}
