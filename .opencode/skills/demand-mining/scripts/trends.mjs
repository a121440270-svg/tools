// Google Trends collector — Node + system curl.exe through SOCKS5 proxy.
//
// Usage:
//   node trends.mjs groups.json out.json [geo] [timeframe]
//   groups.json: [["kw1","kw2","kw3","kw4","kw5"], ...]   max 5 keywords per group
//   timeframe:   "today 12-m" | "today 5-y" | "today 3-m" | "all"
//
// Output: [{ keywords, timeline:[{date,v,partial}], relatedTop, relatedRising, avg, last12wAvg }]
//
// Why not pytrends: pip/uv cannot install through this SOCKS proxy
// (uv: "SOCKS error: failed parsing server response"; pip: CRYPT_E_REVOCATION_OFFLINE).
// curl.exe works fine with --ssl-no-revoke.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [groupsPath, outPath, geo = 'US', timeframe = 'today 12-m'] = process.argv.slice(2);
if (!groupsPath || !outPath) {
  console.error('usage: node trends.mjs groups.json out.json [geo] [timeframe]');
  process.exit(1);
}

const groups = JSON.parse(fs.readFileSync(groupsPath, 'utf8').replace(/^\uFEFF/, ''));
const cookieJar = path.join(os.tmpdir(), 'trends-cookie.txt');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function curl(url) {
  try {
    return execFileSync('curl.exe', [
      '-sS', '--ssl-no-revoke', '--max-time', '40',
      '--proxy', 'socks5h://127.0.0.1:4080',
      '-A', UA,
      '-b', cookieJar, '-c', cookieJar,
      url,
    ], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  } catch (e) {
    return (e.stdout || '') + (e.stderr || '');
  }
}

function getJson(url, label, tries = 8) {
  for (let i = 1; i <= tries; i++) {
    const body = curl(url);
    if (body.includes(")]}'")) {
      // Prefix is ")]}'" + optional comma/newlines — strip both before parsing.
      const clean = body.slice(body.indexOf(")]}'") + 5).replace(/^[,\s]+/, '');
      try { return JSON.parse(clean); } catch { /* retry */ }
    }
    if (/429|Too Many Requests/.test(body)) sleep(8000 * i);
    else sleep(3000 + i * 1500);
    console.error(`retry ${i} ${label}`);
  }
  return null;
}

// widget id → widgetdata endpoint (do NOT use the widget id directly)
const ENDPOINTS = {
  TIMESERIES: 'multiline',
  RELATED_QUERIES: 'relatedsearches',
  RELATED_TOPICS: 'relatedsearches',
  GEO_MAP: 'comparedgeo',
};

const out = [];
for (const kws of groups) {
  const comparisonItem = kws.map((k) => ({ keyword: k, geo, time: timeframe }));
  const exploreUrl = `https://trends.google.com/trends/api/explore?hl=en-US&tz=0&req=${encodeURIComponent(JSON.stringify({ comparisonItem, category: 0, property: '' }))}`;
  const explore = getJson(exploreUrl, 'explore ' + kws.join('|'));
  if (!explore) { out.push({ keywords: kws, error: 'explore failed' }); continue; }

  const entry = { keywords: kws, timeline: [], relatedTop: [], relatedRising: [] };
  for (const w of explore.widgets) {
    const endpoint = ENDPOINTS[w.id];
    if (!endpoint) continue;
    const url = `https://trends.google.com/trends/api/widgetdata/${endpoint}?hl=en-US&tz=0`
      + `&req=${encodeURIComponent(JSON.stringify(w.request))}&token=${encodeURIComponent(w.token)}`;
    const data = getJson(url, w.id);
    if (w.id === 'TIMESERIES' && data?.default?.timelineData) {
      entry.timeline = data.default.timelineData.map((p) => ({
        date: p.formattedTime,
        v: (p.value || []).join(','),
        partial: !!p.isPartial,
      }));
    } else if (w.id === 'RELATED_QUERIES' && data?.default?.rankedList) {
      const flat = (l) => (l?.rankedKeyword || []).map((k) => ({ q: k.query, v: k.value, f: k.formattedValue }));
      entry.relatedTop = flat(data.default.rankedList[0]);
      entry.relatedRising = flat(data.default.rankedList[1]);
    }
    sleep(2500);
  }

  const series = (k) => entry.timeline.map((p) => Number(String(p.v).split(',')[k] || 0));
  const mean = (a) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null);
  entry.series = kws.map((kw, k) => {
    const v = series(k);
    const mid = Math.floor(v.length / 2);
    const a = mean(v.slice(0, mid));
    const b = mean(v.slice(mid));
    return {
      keyword: kw,
      avg: mean(v),
      last12w: mean(v.slice(-12)),
      firstHalf: a,
      secondHalf: b,
      deltaPct: a ? Math.round(((b - a) / a) * 100) : null,
      peak: v.length ? Math.max(...v) : null,
    };
  });

  out.push(entry);
  console.log(`OK ${kws.join(' | ')}  weeks=${entry.timeline.length}`);
  for (const s of entry.series) console.log(`   ${s.keyword.padEnd(30)} avg=${s.avg} last12w=${s.last12w} delta=${s.deltaPct}% peak=${s.peak}`);
  // Persist after every group so an interrupted run keeps finished groups.
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
  sleep(4000);
}

console.log('saved ' + outPath);
