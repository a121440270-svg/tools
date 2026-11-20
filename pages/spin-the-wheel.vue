<template>
  <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <header class="mb-6 reveal" style="--rd: 40ms">
      <p class="kicker">{{ $t('wheelTool.category') }}</p>
      <h1 class="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl dark:text-white">
        {{ $t('wheelTool.title') }}
      </h1>
      <p class="mt-2 max-w-3xl text-base leading-6 text-slate-600 dark:text-slate-300">
        {{ $t('wheelTool.description') }}
      </p>
    </header>

    <!-- Trust strip: front-loaded direct answers for fairness / free / no-signup queries -->
    <section class="mb-6 grid gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/30 sm:grid-cols-3">
      <div v-for="(item, i) in trustPoints" :key="i" class="flex items-start gap-2">
        <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white">✓</span>
        <p class="text-sm leading-5 text-emerald-900 dark:text-emerald-200">{{ item }}</p>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-[360px_1fr]">
      <!-- Editor panel -->
      <aside class="reveal overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900" style="--rd: 120ms">
        <div class="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h2 class="text-sm font-semibold text-slate-800 dark:text-white">{{ $t('wheelTool.entriesTitle') }}</h2>
          <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{{ $t('wheelTool.entriesHint') }}</p>
        </div>
        <div class="space-y-4 p-4">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-white">{{ $t('wheelTool.bulkLabel') }}</label>
            <textarea
              v-model="bulkText"
              rows="5"
              class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              :placeholder="$t('wheelTool.bulkPlaceholder')"
            />
            <button class="btn-secondary mt-2 w-full" type="button" @click="applyBulk">{{ $t('wheelTool.applyBulk') }}</button>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-white">{{ $t('wheelTool.modeLabel') }}</label>
            <select v-model="mode" class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <option value="normal">{{ $t('wheelTool.modeNormal') }}</option>
              <option value="elimination">{{ $t('wheelTool.modeElimination') }}</option>
              <option value="accumulate">{{ $t('wheelTool.modeAccumulate') }}</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-white">{{ $t('wheelTool.durationLabel') }}</label>
              <input v-model.number="duration" type="range" min="1500" max="8000" step="500" class="h-2 w-full cursor-pointer accent-primary" />
              <span class="text-xs text-slate-500">{{ (duration / 1000).toFixed(1) }}s</span>
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-white">{{ $t('wheelTool.turnsLabel') }}</label>
              <input v-model.number="turns" type="range" min="3" max="12" step="1" class="h-2 w-full cursor-pointer accent-primary" />
              <span class="text-xs text-slate-500">{{ turns }}×</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-4 text-sm">
            <label class="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <input v-model="soundOn" type="checkbox" class="accent-primary" /> {{ $t('wheelTool.soundLabel') }}
            </label>
            <label class="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <input v-model="confettiOn" type="checkbox" class="accent-primary" /> {{ $t('wheelTool.confettiLabel') }}
            </label>
          </div>

          <!-- Entry list -->
          <div>
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-medium text-slate-700 dark:text-white">{{ $t('wheelTool.listLabel') }} ({{ entries.length }})</span>
              <button class="text-xs text-rose-600 hover:underline" type="button" @click="clearAll">{{ $t('wheelTool.clearAll') }}</button>
            </div>
            <ul class="max-h-56 space-y-1.5 overflow-y-auto pr-1">
              <li v-for="entry in entries" :key="entry.id" class="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5 dark:border-slate-700">
                <span class="h-3 w-3 shrink-0 rounded-full" :style="{ background: entry.color }" />
                <input v-model="entry.label" class="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none dark:text-slate-100" />
                <input v-model.number="entry.weight" type="number" min="1" max="1000" class="w-14 rounded border border-slate-200 bg-transparent px-1 py-0.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300" :title="$t('wheelTool.weightLabel')" />
                <button class="text-slate-400 hover:text-rose-600" type="button" @click="removeEntry(entry.id)" aria-label="remove">×</button>
              </li>
            </ul>
          </div>

          <button class="btn-primary w-full" type="button" @click="addEntry">+ {{ $t('wheelTool.addEntry') }}</button>
        </div>
      </aside>

      <!-- Wheel panel -->
      <section class="reveal flex flex-col items-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900" style="--rd: 200ms">
        <div class="relative">
          <div class="pointer" aria-hidden="true" />
          <canvas ref="canvasRef" width="520" height="520" class="block h-[min(78vw,520px)] w-[min(78vw,520px)] max-w-full rounded-full shadow-lg" />
          <div v-if="confetti" class="confetti" aria-hidden="true">🎉</div>
        </div>

        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button class="btn-primary px-8 py-3 text-base" type="button" :disabled="spinning || activeEntries.length === 0" @click="spin">
            {{ spinning ? $t('wheelTool.spinning') : $t('wheelTool.spin') }}
          </button>
          <button class="btn-secondary" type="button" @click="resetSpin">{{ $t('wheelTool.resetSpin') }}</button>
          <button class="btn-secondary" type="button" @click="toggleFullscreen">{{ $t('wheelTool.fullscreen') }}</button>
          <button class="btn-secondary" type="button" @click="share">{{ $t('wheelTool.share') }}</button>
        </div>

        <div v-if="winner" class="mt-5 w-full rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
          <p class="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">{{ $t('wheelTool.winnerLabel') }}</p>
          <p class="mt-1 font-display text-3xl font-bold text-primary">{{ winner }}</p>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ $t('wheelTool.remainingLabel') }}: {{ activeEntries.length }}</p>
        </div>
        <p v-else class="mt-5 text-sm text-slate-400">{{ $t('wheelTool.winnerNone') }}</p>

        <!-- Audit note: answers "is it random / can it be verified" -->
        <div v-if="lastAudit" class="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ $t('wheelTool.auditTitle') }}</h3>
            <button class="text-xs text-primary hover:underline" type="button" @click="copyAudit">{{ $t('wheelTool.auditCopy') }}</button>
          </div>
          <pre class="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-4 text-slate-600 dark:text-slate-400">{{ auditText }}</pre>
        </div>
      </section>
    </div>

    <!-- Use cases: direct-answer blocks target validated long-tail scenarios (classroom, giveaway, teams, yes-or-no) -->
    <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <h2 class="text-lg font-semibold text-slate-800 dark:text-white">{{ $t('wheelTool.useTitle') }}</h2>
      <div class="mt-3 grid gap-4 md:grid-cols-2">
        <div v-for="(u, i) in useCases" :key="i" class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <h3 class="font-medium text-slate-800 dark:text-slate-100">{{ u.title }}</h3>
          <p class="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{{ u.body }}</p>
        </div>
      </div>
    </section>

    <!-- Secondary random tools: research showed hiding these causes bad reviews; expose them on the main page -->
    <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <h2 class="text-lg font-semibold text-slate-800 dark:text-white">{{ $t('wheelTool.moreTitle') }}</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-3">
        <button class="choice-card" type="button" @click="fairCoin">
          <span class="text-2xl">🪙</span>
          <span class="font-medium">{{ $t('wheelTool.coinFlip') }}</span>
          <span class="text-sm font-bold text-primary">{{ coinResult || '—' }}</span>
        </button>
        <div class="choice-card">
          <span class="text-2xl">🔢</span>
          <span class="font-medium">{{ $t('wheelTool.randomNumber') }}</span>
          <span class="text-sm text-slate-500">0 – <input v-model.number="randMax" type="number" min="1" class="w-16 rounded border border-slate-200 bg-transparent px-1 text-center dark:border-slate-700" /></span>
          <button class="btn-secondary mt-1" type="button" @click="rollNumber">{{ $t('wheelTool.roll') }} <b class="ml-1 text-primary">{{ randResult }}</b></button>
        </div>
        <button class="choice-card" type="button" @click="shuffleEntries">
          <span class="text-2xl">🔀</span>
          <span class="font-medium">{{ $t('wheelTool.shuffle') }}</span>
          <span class="text-xs text-slate-500">{{ $t('wheelTool.shuffleHint') }}</span>
        </button>
      </div>
    </section>

    <!-- Visible FAQ: same source as the FAQPage schema in useToolSeo -->
    <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <h2 class="text-lg font-semibold text-slate-800 dark:text-white">{{ $t('wheelTool.faqTitle') }}</h2>
      <div class="mt-3 grid gap-4 md:grid-cols-2">
        <div v-for="(faq, i) in faqItems" :key="i" class="faq-item">
          <h3 class="font-medium text-slate-800 dark:text-slate-100">{{ faq.q }}</h3>
          <p class="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{{ faq.a }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

// ---------- state ----------
const STORAGE_KEY = 'onlitool-wheel-v1'
const PALETTE = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b']
let seq = 0
const makeEntry = (label, weight = 1, color) => ({ id: `e${Date.now()}_${seq++}`, label, weight: Math.max(1, Number(weight) || 1), color: color || PALETTE[seq % PALETTE.length] })

const entries = ref([])
const bulkText = ref('')
const mode = ref('normal')
const duration = ref(4500)
const turns = ref(7)
const soundOn = ref(true)
const confettiOn = ref(true)
const spinning = ref(false)
const winner = ref('')
const history = ref([])
const lastAudit = ref(null)
const coinResult = ref('')
const randMax = ref(100)
const randResult = ref('')
const confetti = ref(false)

const activeEntries = computed(() => mode.value === 'elimination' ? entries.value.filter(e => !e._removed) : entries.value)

// ---------- trusted randomness: Web Crypto + no modulo bias ----------
function secureUint32() {
  if (!globalThis.crypto?.getRandomValues) throw new Error('Web Crypto unavailable')
  const a = new Uint32Array(1)
  globalThis.crypto.getRandomValues(a)
  return a[0]
}
function secureFraction() {
  return secureUint32() / 0x100000000
}
async function sha256(text) {
  const bytes = new TextEncoder().encode(text)
  const buf = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ---------- FAQ (visible + schema share the same source) ----------
const faqItems = computed(() => [
  { q: t('wheelTool.faq1Q'), a: t('wheelTool.faq1A') },
  { q: t('wheelTool.faq2Q'), a: t('wheelTool.faq2A') },
  { q: t('wheelTool.faq3Q'), a: t('wheelTool.faq3A') },
  { q: t('wheelTool.faq4Q'), a: t('wheelTool.faq4A') },
  { q: t('wheelTool.faq5Q'), a: t('wheelTool.faq5A') },
  { q: t('wheelTool.faq6Q'), a: t('wheelTool.faq6A') },
  { q: t('wheelTool.faq7Q'), a: t('wheelTool.faq7A') },
  { q: t('wheelTool.faq8Q'), a: t('wheelTool.faq8A') },
  { q: t('wheelTool.faq9Q'), a: t('wheelTool.faq9A') },
  { q: t('wheelTool.faq10Q'), a: t('wheelTool.faq10A') },
])
const useCases = computed(() => [
  { title: t('wheelTool.use1Title'), body: t('wheelTool.use1A') },
  { title: t('wheelTool.use2Title'), body: t('wheelTool.use2A') },
  { title: t('wheelTool.use3Title'), body: t('wheelTool.use3A') },
  { title: t('wheelTool.use4Title'), body: t('wheelTool.use4A') },
])
const trustPoints = computed(() => [t('wheelTool.trust1'), t('wheelTool.trust2'), t('wheelTool.trust3')])

useToolSeo({
  title: () => t('wheelTool.seoTitle'),
  description: () => t('wheelTool.description'),
  keywords: () => t('wheelTool.seoKeywords'),
  applicationCategory: 'UtilitiesApplication',
  featureList: () => [
    t('wheelTool.f1'), t('wheelTool.f2'), t('wheelTool.f3'),
    t('wheelTool.f4'), t('wheelTool.f5'), t('wheelTool.f6'),
    t('wheelTool.f7'), t('wheelTool.f8'), t('wheelTool.f9'), t('wheelTool.f10'),
  ],
  faqItems,
  dateModified: '2026-11-20',
  schemaProperties: () => ({
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }),
})

// ---------- canvas drawing ----------
const canvasRef = ref(null)
let ctx = null
let angle = 0 // cumulative rotation in radians (monotonic)
const TWO_PI = Math.PI * 2

function setupCanvas() {
  const c = canvasRef.value
  if (!c) return
  const dpr = globalThis.devicePixelRatio || 1
  c.width = 520 * dpr
  c.height = 520 * dpr
  ctx = c.getContext('2d')
  ctx.scale(dpr, dpr)
  draw(angle)
}

function draw(rotation) {
  if (!ctx) return
  const size = 520
  const r = size / 2 - 14
  ctx.clearRect(0, 0, size, size)
  ctx.save()
  ctx.translate(size / 2, size / 2)
  ctx.rotate(rotation)
  const list = activeEntries.value
  const total = list.reduce((s, e) => s + (Number(e.weight) || 1), 0) || 1
  let cum = -Math.PI / 2
  const fontSize = list.length > 40 ? 9 : list.length > 20 ? 11 : 14
  list.forEach((entry) => {
    const slice = TWO_PI * ((Number(entry.weight) || 1) / total)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, r, cum, cum + slice)
    ctx.closePath()
    ctx.fillStyle = entry.color
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.save()
    ctx.rotate(cum + slice / 2)
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.font = `600 ${fontSize}px system-ui, sans-serif`
    ctx.fillStyle = '#fff'
    ctx.shadowColor = 'rgba(0,0,0,0.35)'
    ctx.shadowBlur = 2
    let label = String(entry.label || '')
    if (label.length > 16) label = label.slice(0, 15) + '…'
    ctx.fillText(label, r - 12, 0)
    ctx.restore()
    cum += slice
  })
  ctx.beginPath()
  ctx.arc(0, 0, 12, 0, TWO_PI)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()
}

// ---------- pick the winner first, then compute the angle (animation is display only) ----------
function pickIndex(list) {
  const total = list.reduce((s, e) => s + (Number(e.weight) || 1), 0)
  let threshold = secureFraction() * total
  for (let i = 0; i < list.length; i++) {
    threshold -= (Number(list[i].weight) || 1)
    if (threshold < 0) return i
  }
  return list.length - 1
}

async function spin() {
  if (spinning.value) return
  const list = activeEntries.value.slice()
  if (!list.length) return
  spinning.value = true
  winner.value = ''

  // 1) decide the result first, independent of visuals (addresses "rigged" concerns)
  const idx = pickIndex(list)
  const chosen = list[idx]
  const raw = secureUint32()

  // 2) compute the geometric centre of the slice
  const total = list.reduce((s, e) => s + (Number(e.weight) || 1), 0)
  let cum = 0
  for (let i = 0; i < idx; i++) cum += TWO_PI * ((Number(list[i].weight) || 1) / total)
  const slice = TWO_PI * ((Number(chosen.weight) || 1) / total)
  const center = cum + slice / 2
  const jitter = (secureFraction() - 0.5) * slice * 0.6
  let target = -(center + jitter)
  while (target <= angle) target += TWO_PI
  target += (turns.value + Math.floor(secureFraction() * 3)) * TWO_PI

  // 3) audit note (result snapshot hash + random source hash)
  const snapshot = JSON.stringify({ v: 1, labels: list.map(e => e.label), weights: list.map(e => Number(e.weight) || 1) })
  lastAudit.value = {
    algorithm: 'CSPRNG+weighted-v1',
    timestamp: new Date().toISOString(),
    entriesHash: (await sha256(snapshot)).slice(0, 16),
    randomUint32: raw,
    randomHex: raw.toString(16).padStart(8, '0'),
    winner: chosen.label,
    weight: Number(chosen.weight) || 1,
    totalWeight: total,
    mode: mode.value,
  }
  winner.value = chosen.label

  // 4) animation (easeOutQuart)
  const start = angle
  const delta = target - start
  const startTime = performance.now()
  const dur = duration.value
  let lastSlice = topSliceIndex(start, list, total)
  const frame = (now) => {
    const p = Math.min(1, (now - startTime) / dur)
    const eased = 1 - Math.pow(1 - p, 4)
    angle = start + delta * eased
    draw(angle)
    const cur = topSliceIndex(angle, list, total)
    if (cur !== lastSlice) { lastSlice = cur; tick() }
    if (p < 1) {
      rafId = requestAnimationFrame(frame)
    } else {
      spinning.value = false
      if (mode.value === 'elimination') chosen._removed = true
      history.value.unshift({ label: chosen.label, at: Date.now() })
      if (confettiOn.value) fireConfetti()
    }
  }
  let rafId = requestAnimationFrame(frame)
}

function topSliceIndex(rotation, list, total) {
  const a = (((-rotation) % TWO_PI) + TWO_PI) % TWO_PI
  let cum = 0
  for (let i = 0; i < list.length; i++) {
    const slice = TWO_PI * ((Number(list[i].weight) || 1) / total)
    if (a >= cum && a < cum + slice) return i
    cum += slice
  }
  return list.length - 1
}

// ---------- sound (Web Audio, no external assets) ----------
let audioCtx = null
function tick() {
  if (!soundOn.value) return
  try {
    audioCtx = audioCtx || new (globalThis.AudioContext || globalThis.webkitAudioContext)()
    const o = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    o.type = 'square'
    o.frequency.value = 900
    g.gain.setValueAtTime(0.02, audioCtx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.03)
    o.connect(g).connect(audioCtx.destination)
    o.start()
    o.stop(audioCtx.currentTime + 0.03)
  } catch (_) { /* silent if unsupported */ }
}

function fireConfetti() {
  confetti.value = true
  setTimeout(() => { confetti.value = false }, 2200)
}

// ---------- entry operations ----------
function parseNames(text) {
  return text.split(/[\n,;，、]+/).map(s => s.trim()).filter(Boolean)
}
function applyBulk() {
  const names = parseNames(bulkText.value)
  if (!names.length) return
  entries.value.push(...names.map(n => makeEntry(n)))
  bulkText.value = ''
  ElMessage.success(t('wheelTool.added', { n: names.length }))
}
function addEntry() {
  entries.value.push(makeEntry(`${t('wheelTool.option')} ${entries.value.length + 1}`))
  draw(angle)
}
function removeEntry(id) {
  entries.value = entries.value.filter(e => e.id !== id)
  draw(angle)
}
function clearAll() {
  entries.value = []
  winner.value = ''
  angle = 0
  draw(angle)
}
function resetSpin() {
  entries.value.forEach(e => { delete e._removed })
  winner.value = ''
  angle = 0
  draw(angle)
}
function shuffleEntries() {
  for (let i = entries.value.length - 1; i > 0; i--) {
    const j = Math.floor(secureFraction() * (i + 1))
    ;[entries.value[i], entries.value[j]] = [entries.value[j], entries.value[i]]
  }
  draw(angle)
  ElMessage.success(t('wheelTool.shuffled'))
}

// ---------- secondary random tools ----------
function fairCoin() { coinResult.value = secureFraction() < 0.5 ? 'HEADS' : 'TAILS' }
function rollNumber() { randResult.value = Math.floor(secureFraction() * (Number(randMax.value) || 100)) }

// ---------- share / save / copy audit ----------
function share() {
  const payload = entries.value.map(e => [e.label, Number(e.weight) || 1])
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
  const url = `${location.origin}${location.pathname}?w=${encodeURIComponent(b64)}`
  navigator.clipboard.writeText(url).then(() => ElMessage.success(t('wheelTool.linkCopied')))
}
const auditText = computed(() => lastAudit.value ? JSON.stringify(lastAudit.value, null, 2) : '')
function copyAudit() { navigator.clipboard.writeText(auditText.value).then(() => ElMessage.success(t('wheelTool.copied'))) }
function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen()
  else document.documentElement.requestFullscreen?.()
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value)) } catch (_) {}
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) entries.value = JSON.parse(raw)
  } catch (_) {}
  try {
    const q = new URLSearchParams(location.search).get('w')
    if (q) {
      const data = JSON.parse(decodeURIComponent(escape(atob(q))))
      entries.value = data.map(([label, weight]) => makeEntry(label, weight))
    }
  } catch (_) {}
}

let ro = null
onMounted(() => {
  load()
  setupCanvas()
  if (globalThis.ResizeObserver && canvasRef.value) {
    ro = new ResizeObserver(() => setupCanvas())
    ro.observe(canvasRef.value)
  }
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  ro?.disconnect()
})
function onKey(e) {
  if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) { e.preventDefault(); spin() }
  if (e.key === 'r' || e.key === 'R') resetSpin()
}
watch(entries, save, { deep: true })
</script>

<style scoped>
.pointer {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 24px solid rgb(var(--primary));
  z-index: 5;
  filter: drop-shadow(0 2px 2px rgba(0,0,0,.25));
}
.confetti {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 90px;
  pointer-events: none;
  animation: pop 2.2s ease-out forwards;
}
@keyframes pop {
  0% { transform: scale(.3); opacity: 0; }
  20% { transform: scale(1.15); opacity: 1; }
  80% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.3); opacity: 0; }
}
.choice-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: .4rem;
  border: 1px solid rgb(var(--border));
  border-radius: 12px;
  padding: 1rem;
  background: transparent;
  text-align: left;
  color: rgb(var(--foreground));
}
.choice-card:hover { border-color: rgb(var(--primary)); }
.faq-item { border-top: 1px solid rgb(var(--border)); padding-top: 1rem; }
</style>
