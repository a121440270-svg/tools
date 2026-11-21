<template>
  <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Header -->
    <header class="mb-5 reveal" style="--rd: 40ms">
      <p class="kicker">{{ $t('wheelTool.category') }}</p>
      <h1 class="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl dark:text-white">
        {{ $t('wheelTool.title') }}
      </h1>
      <p class="mt-2 max-w-3xl text-base leading-6 text-slate-600 dark:text-slate-300">
        {{ $t('wheelTool.description') }}
      </p>
    </header>

    <!-- Trust strip: front-loaded answers, kept compact so it does not push the tool down -->
    <div class="trust-strip mb-5 reveal flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-2.5 dark:border-emerald-900 dark:bg-emerald-950/30" style="--rd: 80ms">
      <span v-for="(item, i) in trustPoints" :key="i" class="inline-flex items-center gap-2 text-sm text-emerald-900 dark:text-emerald-200">
        <svg class="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" clip-rule="evenodd" />
        </svg>
        {{ item }}
      </span>
    </div>

    <!-- Workbench: names on the left, dominant wheel on the right -->
    <div class="grid items-start gap-6" :class="editorCollapsed ? 'lg:grid-cols-[1fr_48px]' : 'lg:grid-cols-[1fr_minmax(0,400px)]'">
      <!-- ============ WHEEL STAGE ============ -->
      <section ref="stageRef" class="wheel-stage reveal rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6" style="--rd: 120ms">
        <div class="mb-3 flex items-baseline justify-between gap-3">
          <h2 class="text-base font-semibold text-slate-800 dark:text-white">{{ $t('wheelTool.spin') }}</h2>
          <p class="hidden text-xs text-slate-400 sm:block">{{ $t('wheelTool.spinHint') }}</p>
        </div>

        <div class="wheel-frame">
          <div class="pointer" aria-hidden="true" />
          <canvas ref="canvasRef" :width="SIZE" :height="SIZE" class="wheel-canvas" @click="spin" />
          <button class="spin-hub" :class="{ spinning: spinning }" type="button" :disabled="spinning || activeEntries.length === 0" @click="spin">
            <span class="hub-inner"><span class="hub-label">{{ $t('wheelTool.spinShort') }}</span></span>
          </button>
          <!-- full-screen confetti: teleported to body so it covers the whole viewport,
               including when the wheel itself is in fullscreen -->
          <ClientOnly>
            <!-- in fullscreen the wheel stage covers the page, so confetti must live inside it -->
            <Teleport :to="isFullscreen ? '.wheel-stage' : 'body'">
              <div v-if="confetti" class="confetti-screen" aria-hidden="true">
                <i v-for="(p, i) in screenBits" :key="'s' + i" :style="{ '--x': p.x, '--dx': p.dx, '--r': p.r, '--c': p.c, '--d': p.d, '--t': p.t, '--w': p.w, '--h': p.h, '--br': p.br }" />
              </div>
            </Teleport>
          </ClientOnly>
          <!-- compact result toast: centred, fades out on its own after 2s -->
          <ClientOnly>
            <Teleport :to="isFullscreen ? '.wheel-stage' : 'body'">
              <div v-if="showNotify && notifyText" class="compact-notify" role="status" aria-live="polite">
                <span class="compact-notify-kicker">{{ $t('wheelTool.congrats') }}</span>
                <span class="compact-notify-name">{{ notifyText }}</span>
                <span class="compact-notify-sub">{{ $t('wheelTool.remainingLabel') }}: {{ activeEntries.length }}</span>
              </div>
            </Teleport>
          </ClientOnly>
          <!-- winner celebration: shown only after the wheel stops (Wheel of Names style) -->
          <transition name="winner-pop">
            <div v-if="showWinner && winner" class="winner-overlay" @click.self="showWinner = false">
              <div class="winner-pop" role="dialog" aria-modal="true">
                <div class="winner-pop-confetti" aria-hidden="true">
                  <i v-for="(p, i) in confettiBits" :key="'o' + i" :style="{ '--x': p.x, '--y': p.y, '--r': p.r, '--c': p.c, '--d': p.d }" />
                </div>
                <div class="winner-pop-trophy" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 21h8m-4-4v4M7 4h10v4a5 5 0 0 1-10 0V4Zm0 1H4v2a3 3 0 0 0 3 3m10-5h3v2a3 3 0 0 1-3 3" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </div>
                <p class="winner-pop-kicker">{{ $t('wheelTool.congrats') }}</p>
                <p class="winner-pop-name">{{ winner }}</p>
                <p class="winner-pop-sub">{{ $t('wheelTool.remainingLabel') }}: {{ activeEntries.length }}</p>
                <div class="winner-pop-actions">
                  <button class="btn-primary" type="button" @click="showWinner = false; spin()">{{ $t('wheelTool.spinAgain') }}</button>
                  <button class="btn-secondary" type="button" @click="showWinner = false">{{ $t('wheelTool.close') }}</button>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- secondary controls: icon + label, visually subordinate to the hub -->
        <div class="stage-actions mt-5">
          <button class="icon-btn" type="button" @click="resetSpin">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-4 w-4"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" stroke-linecap="round" stroke-linejoin="round" /></svg>
            {{ $t('wheelTool.resetSpin') }}
          </button>
          <button class="icon-btn" type="button" @click="toggleFullscreen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-4 w-4"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5m11-5v5h-5" stroke-linecap="round" stroke-linejoin="round" /></svg>
            {{ $t('wheelTool.fullscreen') }}
          </button>
          <button class="icon-btn" type="button" @click="share">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-4 w-4"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1" stroke-linecap="round" /></svg>
            {{ $t('wheelTool.share') }}
          </button>
        </div>

        <!-- fairness audit: present but collapsed so it does not dominate the main flow -->
        <details v-if="lastAudit" class="audit-box mt-5">
          <summary>
            <svg class="chevron h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 8 4 4 4-4" stroke-linecap="round" stroke-linejoin="round" /></svg>
            <span>{{ $t('wheelTool.auditTitle') }}</span>
            <button class="ml-auto text-xs text-primary hover:underline" type="button" @click.stop="copyAudit">{{ $t('wheelTool.auditCopy') }}</button>
          </summary>
          <pre class="audit-pre">{{ auditText }}</pre>
        </details>
      </section>

      <!-- ============ ENTRY EDITOR ============ -->
      <aside class="reveal rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900" :class="{ 'editor-collapsed': editorCollapsed }" style="--rd: 200ms">
        <button v-if="editorCollapsed" class="editor-handle" type="button" :title="$t('wheelTool.expandPanel')" :aria-label="$t('wheelTool.expandPanel')" @click="editorCollapsed = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-5 w-5"><path d="m14 6-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" /></svg>
          <span class="editor-handle-text">{{ $t('wheelTool.tabEntries') }}</span>
        </button>
        <div v-show="!editorCollapsed">
        <!-- panel tabs: entries / result history (Wheel of Names pattern) -->
        <div class="mb-4 flex items-center gap-2">
          <div class="wheel-tabs flex-1" role="tablist" aria-label="wheel panel">
            <button class="wheel-tab" :class="{ active: activeTab === 'entries' }" role="tab" type="button" :aria-selected="activeTab === 'entries'" @click="activeTab = 'entries'">
              {{ $t('wheelTool.tabEntries') }}
              <span class="wheel-tab-count">{{ entries.length }}</span>
            </button>
            <button class="wheel-tab" :class="{ active: activeTab === 'results' }" role="tab" type="button" :aria-selected="activeTab === 'results'" @click="activeTab = 'results'; seenHistory = history.length">
              {{ $t('wheelTool.tabResults') }}
              <span v-if="history.length" class="wheel-tab-count accent" :class="{ unread: history.length > seenHistory }">{{ history.length }}</span>
            </button>
          </div>
          <button class="panel-toggle" type="button" :title="$t('wheelTool.collapsePanel')" :aria-label="$t('wheelTool.collapsePanel')" @click="editorCollapsed = true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-4 w-4"><path d="m9 6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>
        </div>

        <div v-show="activeTab === 'entries'">
        <div class="mb-4 flex items-baseline justify-between">
          <div>
            <h2 class="text-base font-semibold text-slate-800 dark:text-white">{{ $t('wheelTool.entriesTitle') }}</h2>
            <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{{ $t('wheelTool.entriesHint') }}</p>
          </div>
          <span class="count-badge" aria-label="entry count">{{ entries.length }}</span>
        </div>

        <!-- primary input -->
        <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200" for="wheel-bulk">{{ $t('wheelTool.bulkLabel') }}</label>
        <textarea
          id="wheel-bulk"
          v-model="bulkText"
          rows="5"
          class="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          :placeholder="$t('wheelTool.bulkPlaceholder')"
          @keydown.ctrl.enter="applyBulk"
          @keydown.meta.enter="applyBulk"
        />
        <div class="mt-2 flex gap-2">
          <button class="btn-primary flex-1" type="button" @click="applyBulk">{{ $t('wheelTool.applyBulk') }}</button>
          <button class="btn-secondary inline-flex items-center gap-1.5 px-4" type="button" :disabled="spinning || activeEntries.length === 0" @click="spin">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" class="h-4 w-4"><path d="M12 3a9 9 0 1 0 9 9" stroke-linecap="round" /><path d="M21 3v6h-6" stroke-linecap="round" stroke-linejoin="round" /></svg>
            {{ $t('wheelTool.spinShort') }}
          </button>
        </div>

        <!-- quick start -->
        <div class="mt-5">
          <p class="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ $t('wheelTool.quickStart') }}</p>
          <div class="flex flex-wrap gap-2">
            <button class="preset-pill" type="button" @click="loadPreset('classroom')">{{ $t('wheelTool.presetClassroom') }}</button>
            <button class="preset-pill" type="button" @click="loadPreset('giveaway')">{{ $t('wheelTool.presetGiveaway') }}</button>
            <button class="preset-pill" type="button" @click="loadPreset('yesno')">{{ $t('wheelTool.presetYesNo') }}</button>
          </div>
        </div>

        <!-- editable entry list -->
        <div class="mt-5">
          <!-- add action stays above the list so new entries never push the button down -->
          <div class="mb-2 flex items-center justify-between gap-2">
            <span class="text-sm font-medium text-slate-700 dark:text-white">{{ $t('wheelTool.listLabel') }}</span>
            <div class="flex items-center gap-2">
              <button class="add-entry-btn" type="button" @click="addEntry">+ {{ $t('wheelTool.addEntry') }}</button>
              <button class="text-xs text-rose-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40" type="button" :disabled="!entries.length" @click="clearAll">{{ $t('wheelTool.clearAll') }}</button>
            </div>
          </div>
          <!-- explain the weight column so the number is not a mystery -->
          <p class="mb-2 flex items-start gap-1.5 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
            <svg class="mt-0.5 h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="10" cy="10" r="8" /><path d="M10 9v5m0-8h.01" stroke-linecap="round" /></svg>
            <span>{{ $t('wheelTool.weightHint') }}</span>
          </p>
          <ul v-if="entries.length" class="max-h-60 space-y-1.5 overflow-y-auto pr-1">
            <li v-for="entry in entries" :key="entry.id" class="entry-row">
              <button class="color-dot" type="button" :style="{ background: entry.color }" :title="$t('wheelTool.colorLabel')" @click="cycleColor(entry)" />
              <input v-model="entry.label" class="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none dark:text-slate-100" />
              <input v-model.number="entry.weight" type="number" min="1" max="1000" class="weight-input" :title="$t('wheelTool.weightHint')" :aria-label="$t('wheelTool.weightLabel')" />
              <button class="remove-btn" type="button" :aria-label="'remove ' + entry.label" @click="removeEntry(entry.id)">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" class="h-4 w-4"><path d="M5 5l10 10M15 5 5 15" stroke-linecap="round" /></svg>
              </button>
            </li>
          </ul>
          <div v-else class="rounded-xl border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-slate-400 dark:border-slate-700">
            {{ $t('wheelTool.winnerNone') }}
          </div>
        </div>

        <!-- progressive disclosure: power-user settings stay out of the default view -->
        <details class="options-box mt-5">
          <summary>
            <svg class="chevron h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 8 4 4 4-4" stroke-linecap="round" stroke-linejoin="round" /></svg>
            <span>{{ $t('wheelTool.advanced') }}</span>
          </summary>
          <div class="options-body">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300" for="wheel-mode">{{ $t('wheelTool.modeLabel') }}</label>
              <select id="wheel-mode" v-model="mode" class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <option value="normal">{{ $t('wheelTool.modeNormal') }}</option>
                <option value="elimination">{{ $t('wheelTool.modeElimination') }}</option>
                <option value="accumulate">{{ $t('wheelTool.modeAccumulate') }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-300">{{ $t('wheelTool.durationLabel') }} · {{ (duration / 1000).toFixed(1) }}s</label>
                <input v-model.number="duration" type="range" min="1500" max="8000" step="500" class="h-2 w-full cursor-pointer accent-primary" />
              </div>
              <div>
                <label class="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-300">{{ $t('wheelTool.turnsLabel') }} · {{ turns }}×</label>
                <input v-model.number="turns" type="range" min="3" max="12" step="1" class="h-2 w-full cursor-pointer accent-primary" />
              </div>
            </div>
            <div class="flex flex-wrap gap-5">
              <label class="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input v-model="soundOn" type="checkbox" class="accent-primary" /> {{ $t('wheelTool.soundLabel') }}</label>
              <label class="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input v-model="confettiOn" type="checkbox" class="accent-primary" /> {{ $t('wheelTool.confettiLabel') }}</label>
              <label class="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input v-model="compactNotify" type="checkbox" class="accent-primary" /> {{ $t('wheelTool.compactNotifyLabel') }}</label>
            </div>
          </div>
        </details>
        </div><!-- /entries pane -->

        <!-- result history pane -->
        <div v-show="activeTab === 'results'">
          <div class="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold text-slate-800 dark:text-white">{{ $t('wheelTool.historyTitle') }}</h2>
              <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{{ $t('wheelTool.historyHint') }}</p>
            </div>
            <button class="text-xs text-rose-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40" type="button" :disabled="!history.length" @click="clearHistory">{{ $t('wheelTool.clearHistory') }}</button>
          </div>
          <ol v-if="history.length" class="history-list">
            <li v-for="(item, i) in history" :key="item.at + '-' + i" class="history-row">
              <span class="history-seq">{{ history.length - i }}</span>
              <span class="history-label">{{ item.label }}</span>
              <time class="history-time" :datetime="new Date(item.at).toISOString()">{{ formatHistoryTime(item.at) }}</time>
            </li>
          </ol>
          <div v-else class="rounded-xl border border-dashed border-slate-300 px-3 py-8 text-center text-sm text-slate-400 dark:border-slate-700">
            {{ $t('wheelTool.historyEmpty') }}
          </div>
        </div>
        </div><!-- /panel content -->
      </aside>

    </div>

    <!-- Secondary random tools -->
    <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <h2 class="text-base font-semibold text-slate-800 dark:text-white">{{ $t('wheelTool.moreTitle') }}</h2>
      <div class="mt-4 grid gap-3 sm:grid-cols-3">
        <button class="choice-card" type="button" @click="fairCoin">
          <span class="tool-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" class="h-5 w-5"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><path d="M12 7v2m0 6v2" stroke-linecap="round" /></svg>
          </span>
          <span class="font-medium text-slate-800 dark:text-slate-100">{{ $t('wheelTool.coinFlip') }}</span>
          <span class="text-sm font-bold text-primary">{{ coinResult || '—' }}</span>
        </button>
        <div class="choice-card">
          <span class="tool-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" class="h-5 w-5"><path d="M9 4 7 20M17 4l-2 16M4 9h16M3 15h16" stroke-linecap="round" /></svg>
          </span>
          <span class="font-medium text-slate-800 dark:text-slate-100">{{ $t('wheelTool.randomNumber') }}</span>
          <span class="flex items-center gap-2 text-sm text-slate-500">0 – <input v-model.number="randMax" type="number" min="1" class="w-16 rounded border border-slate-200 bg-transparent px-1 py-1 text-center dark:border-slate-700" /></span>
          <button class="btn-secondary mt-1 w-full" type="button" @click="rollNumber">{{ $t('wheelTool.roll') }} <b class="ml-1 text-primary">{{ randResult }}</b></button>
        </div>
        <button class="choice-card" type="button" @click="shuffleEntries">
          <span class="tool-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" class="h-5 w-5"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </span>
          <span class="font-medium text-slate-800 dark:text-slate-100">{{ $t('wheelTool.shuffle') }}</span>
          <span class="text-xs text-slate-500">{{ $t('wheelTool.shuffleHint') }}</span>
        </button>
      </div>
    </section>

    <!-- Use cases -->
    <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <h2 class="text-base font-semibold text-slate-800 dark:text-white">{{ $t('wheelTool.useTitle') }}</h2>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div v-for="(u, i) in useCases" :key="i" class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <h3 class="font-medium text-slate-800 dark:text-slate-100">{{ u.title }}</h3>
          <p class="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{{ u.body }}</p>
        </div>
      </div>
    </section>

    <!-- FAQ accordion: all content stays in the DOM for SEO / FAQPage schema -->
    <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <h2 class="text-base font-semibold text-slate-800 dark:text-white">{{ $t('wheelTool.faqTitle') }}</h2>
      <div class="mt-3 divide-y divide-slate-200 dark:divide-slate-700">
        <details v-for="(faq, i) in faqItems" :key="i" class="faq-row" name="wheel-faq">
          <summary>
            <span>{{ faq.q }}</span>
            <svg class="chevron h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 8 4 4 4-4" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </summary>
          <p class="faq-answer">{{ faq.a }}</p>
        </details>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'

const { t, locale } = useI18n()

// ---------- state ----------
const STORAGE_KEY = 'onlitool-wheel-v1'
const SIZE = 560
// Pointer rests at the right edge (3 o'clock, angle 0). The slice that lands here is the winner.
// Top would be -Math.PI / 2; changing this alone is enough to move both the visual pointer and the result.
const POINTER_ANGLE = 0
const PALETTE = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b']
const PRESETS = {
  classroom: ['Alice', 'Ben', 'Chloe', 'Diego', 'Emma', 'Farid', 'Grace', 'Hana'],
  giveaway: ['@alex', '@mia', '@jordan', '@sam', '@taylor', '@riley', '@casey', '@jules'],
}
// Shown on a first visit so the wheel is never empty; once the user clears or edits,
// the (possibly empty) list is persisted and this demo is not restored again.
// Localised so each language sees its own example labels.
const demoEntries = () => String(t('wheelTool.demoEntries')).split('~').map(s => s.trim()).filter(Boolean)
// Track which list is still an untouched demo so it can follow the UI language.
const DEMO_SIG_KEY = 'onlitool-wheel-demo-sig'
// Demo signatures from earlier versions, so browsers that already saved a demo
// still refresh it into the current language instead of staying stuck.
const KNOWN_DEMOS = [
  // current interleaved demos (opposite pairs sit 180° apart)
  '需要么|约|打工|去|不需要么|不约|不打工|不去',
  "Need it|Date|Work|Go|Don't need it|No date|No work|Don't go",
  // older demo orderings, so saved demos refresh into the current layout
  '需要么|不需要么|约|不约|打工|不打工|去|不去',
  "Need it|Don't need it|Date|No date|Work|No work|Go|Stay",
  "Need it|Don't need it|Date|No date|Work|No work|Go|Don't go",
  'Alice|Ben|Chloe|Diego|Emma|Farid',
]
const demoSig = list => list.map(e => e.label).join('|')
function isUntouchedDemo(list) {
  const sig = demoSig(list)
  if (!sig) return false
  try { if (sig === localStorage.getItem(DEMO_SIG_KEY)) return true } catch (_) {}
  return KNOWN_DEMOS.includes(sig)
}
function makeDemo() {
  const list = demoEntries().map(n => makeEntry(n))
  try { localStorage.setItem(DEMO_SIG_KEY, demoSig(list)) } catch (_) {}
  return list
}
// Rebuild an untouched demo in the newly selected language.
function refreshDemoIfUntouched() {
  if (isUntouchedDemo(entries.value)) entries.value = makeDemo()
}
let seq = 0
const makeEntry = (label, weight = 1, color) => ({ id: `e${Date.now()}_${seq++}`, label, weight: Math.max(1, Number(weight) || 1), color: color || PALETTE[seq % PALETTE.length] })

const entries = ref([])
const bulkText = ref('')
const mode = ref('normal')
const duration = ref(4500)
const turns = ref(7)
const soundOn = ref(true)
const confettiOn = ref(true)
const compactNotify = ref(false)
const spinning = ref(false)
const winner = ref('')
const winnerIndex = ref(null)
const showWinner = ref(false)
const showNotify = ref(false)
const notifyText = ref('')
let notifyTimer = null
const history = ref([])
const activeTab = ref('entries')
const seenHistory = ref(0)
const editorCollapsed = ref(false)
const lastAudit = ref(null)
const coinResult = ref('')
const randMax = ref(100)
const randResult = ref('')
const confetti = ref(false)
const confettiBits = ref([])
const screenBits = ref([])
const isFullscreen = ref(false)

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
const stageRef = ref(null)
let ctx = null
let angle = 0 // cumulative rotation in radians (monotonic)
const TWO_PI = Math.PI * 2

function setupCanvas() {
  const c = canvasRef.value
  if (!c) return
  const dpr = globalThis.devicePixelRatio || 1
  c.width = SIZE * dpr
  c.height = SIZE * dpr
  ctx = c.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  draw(angle)
}

function draw(rotation) {
  if (!ctx) return
  const r = SIZE / 2 - 18
  ctx.clearRect(0, 0, SIZE, SIZE)
  ctx.save()
  ctx.translate(SIZE / 2, SIZE / 2)
  ctx.rotate(rotation)
  const list = activeEntries.value
  const total = list.reduce((s, e) => s + (Number(e.weight) || 1), 0) || 1
  let cum = -Math.PI / 2
  list.forEach((entry, i) => {
    const slice = TWO_PI * ((Number(entry.weight) || 1) / total)
    const isWinner = i === winnerIndex.value
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, r, cum, cum + slice)
    ctx.closePath()
    ctx.fillStyle = entry.color
    if (isWinner) { ctx.shadowColor = 'rgba(255,255,255,0.9)'; ctx.shadowBlur = 18 }
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = isWinner ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)'
    ctx.lineWidth = isWinner ? 3 : 1
    ctx.stroke()

    ctx.save()
    ctx.rotate(cum + slice / 2)
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    const label = String(entry.label || '')
    // Wheel-of-Names style: text runs radially from near the rim toward the hub
    // and keeps a roughly constant radial length. Two SEPARATE limits apply:
    //  - radial: the string must stop before the central SPIN hub
    //  - tangential: the font HEIGHT must fit the slice width at the inner end,
    //    otherwise the letters spill into neighbouring slices ("撑破").
    const INNER = 76 // keep clear of the hub and of the narrow part of the slice
    const labelX = r - 22
    const radialAvail = labelX - INNER
    const maxFont = Math.min(104, Math.max(14, Math.floor(slice * INNER * 0.95)))
    let fs = maxFont
    let text = ` ${label} `
    const setFont = size => { ctx.font = `700 ${size}px 'Instrument Sans', system-ui, sans-serif` }
    setFont(fs)
    while (ctx.measureText(text).width > radialAvail && fs > 14) {
      fs = Math.max(14, fs - 2)
      setFont(fs)
    }
    if (ctx.measureText(text).width > radialAvail) {
      let core = label
      while (core.length > 1 && ctx.measureText(` ${core}… `).width > radialAvail) core = core.slice(0, -1)
      text = ` ${core}… `
    }
    ctx.fillStyle = '#fff'
    ctx.shadowColor = 'rgba(0,0,0,0.55)'
    ctx.shadowBlur = 4
    ctx.fillText(text, labelX, 0)
    ctx.restore()
    cum += slice
  })
  // clean outer rim
  ctx.beginPath()
  ctx.arc(0, 0, r + 4, 0, TWO_PI)
  ctx.strokeStyle = 'rgba(255,255,255,0.92)'
  ctx.lineWidth = 8
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, r + 9, 0, TWO_PI)
  ctx.strokeStyle = 'rgba(11,110,83,0.35)'
  ctx.lineWidth = 2
  ctx.stroke()
  // hub base underneath the HTML spin button
  ctx.beginPath()
  ctx.arc(0, 0, 46, 0, TWO_PI)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.strokeStyle = 'rgba(11,110,83,0.3)'
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
  winnerIndex.value = null
  showWinner.value = false
  clearTimeout(notifyTimer)
  showNotify.value = false
  notifyText.value = ''

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
  // slices are drawn from -π/2 (top); rotate so the chosen slice centre lands on POINTER_ANGLE
  let target = POINTER_ANGLE + Math.PI / 2 - (center + jitter)
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

  // 4) animation (easeOutQuart)
  const start = angle
  const delta = target - start
  const startTime = performance.now()
  const dur = duration.value
  let rafId = requestAnimationFrame(frame)
  function frame(now) {
    const p = Math.min(1, (now - startTime) / dur)
    const eased = 1 - Math.pow(1 - p, 4)
    angle = start + delta * eased
    draw(angle)
    if (p < 1) {
      rafId = requestAnimationFrame(frame)
    } else {
      spinning.value = false
      winnerIndex.value = idx
      draw(angle)
      if (mode.value === 'elimination') chosen._removed = true
      history.value.unshift({ label: chosen.label, at: Date.now() })
      if (confettiOn.value) fireConfetti()
      winner.value = chosen.label
      if (compactNotify.value) {
        // compact mode: a centred toast that fades away by itself
        clearTimeout(notifyTimer)
        notifyText.value = chosen.label
        showNotify.value = true
        notifyTimer = setTimeout(() => { showNotify.value = false; notifyText.value = '' }, 2000)
      } else {
        showWinner.value = true
      }
    }
  }
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
  const colors = [...PALETTE, '#ffffff', '#fbbf24', '#22d3ee']
  // small burst inside the winner card
  confettiBits.value = Array.from({ length: 20 }, (_, i) => {
    const ang = Math.random() * Math.PI * 2
    const dist = 90 + Math.random() * 150
    return {
      x: `${Math.cos(ang) * dist}px`,
      y: `${Math.sin(ang) * dist - 30}px`,
      r: `${Math.round(Math.random() * 540 - 270)}deg`,
      c: colors[i % colors.length],
      d: `${Math.round(Math.random() * 250)}ms`,
    }
  })
  // full-screen falling confetti across the whole viewport
  screenBits.value = Array.from({ length: 90 }, (_, i) => ({
    x: `${Math.random() * 100}vw`,
    dx: `${Math.round(Math.random() * 160 - 80)}px`,
    r: `${Math.round(Math.random() * 900 - 450)}deg`,
    c: colors[i % colors.length],
    d: `${(Math.random() * 1.2).toFixed(2)}s`,
    t: `${(2.6 + Math.random() * 2.2).toFixed(2)}s`,
    w: `${7 + Math.round(Math.random() * 6)}px`,
    h: `${10 + Math.round(Math.random() * 8)}px`,
    br: Math.random() > 0.5 ? '2px' : '50%',
  }))
  confetti.value = true
  setTimeout(() => { confetti.value = false; confettiBits.value = []; screenBits.value = [] }, 5200)
}

// ---------- entry operations ----------
function parseNames(text) {
  return text.split(/[\n,;，、]+/).map(s => s.trim()).filter(Boolean)
}
function applyBulk() {
  const names = parseNames(bulkText.value)
  if (!names.length) return
  // newest entries first so they are visible without scrolling
  entries.value.unshift(...names.map(n => makeEntry(n)))
  bulkText.value = ''
  ElMessage.success(t('wheelTool.added', { n: names.length }))
}
function loadPreset(kind) {
  const names = kind === 'yesno' ? [t('wheelTool.yes'), t('wheelTool.no')] : PRESETS[kind]
  if (!names) return
  entries.value = names.map(n => makeEntry(n))
  winner.value = ''
  winnerIndex.value = null
  lastAudit.value = null
  angle = 0
  draw(angle)
  ElMessage.success(t('wheelTool.added', { n: names.length }))
}
function cycleColor(entry) {
  const i = PALETTE.indexOf(entry.color)
  entry.color = PALETTE[(i + 1) % PALETTE.length]
  draw(angle)
}
function addEntry() {
  entries.value.unshift(makeEntry(`${t('wheelTool.option')} ${entries.value.length + 1}`))
  draw(angle)
}
function removeEntry(id) {
  entries.value = entries.value.filter(e => e.id !== id)
  draw(angle)
}
function clearAll() {
  entries.value = []
  winner.value = ''
  winnerIndex.value = null
  angle = 0
  draw(angle)
}
function clearHistory() {
  history.value = []
  seenHistory.value = 0
}
function formatHistoryTime(at) {
  try { return new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } catch (_) { return '' }
}
function resetSpin() {
  entries.value.forEach(e => { delete e._removed })
  winner.value = ''
  winnerIndex.value = null
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
  const el = stageRef.value
  if (!el) return
  if (document.fullscreenElement === el) {
    document.exitFullscreen?.()
  } else if (el.requestFullscreen) {
    el.requestFullscreen().catch(() => {})
  }
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value)) } catch (_) {}
}
function load() {
  let hasSaved = false
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) { entries.value = JSON.parse(raw); hasSaved = true }
  } catch (_) {}
  try {
    const q = new URLSearchParams(location.search).get('w')
    if (q) {
      const data = JSON.parse(decodeURIComponent(escape(atob(q))))
      entries.value = data.map(([label, weight]) => makeEntry(label, weight))
      hasSaved = true
    }
  } catch (_) {}
  if (!hasSaved && !entries.value.length) {
    entries.value = makeDemo()
  } else {
    // an untouched demo from a previous visit / another language follows the current UI language
    refreshDemoIfUntouched()
  }
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
  document.addEventListener('fullscreenchange', onFullscreenChange)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  clearTimeout(notifyTimer)
  ro?.disconnect()
})
function onFullscreenChange() {
  isFullscreen.value = document.fullscreenElement === stageRef.value
}
function onKey(e) {
  if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(e.target.tagName)) return
  if (e.code === 'Space') { e.preventDefault(); spin() }
  if (e.key === 'r' || e.key === 'R') resetSpin()
}
watch(entries, save, { deep: true })
// switching UI language rebuilds an untouched demo in that language
watch(locale, () => refreshDemoIfUntouched())
// keep the wheel in sync with edits and mode changes without waiting for a spin
watch(mode, () => draw(angle))
watch(() => entries.value.map(e => `${e.label}|${e.weight}|${e.color}`).join('~'), () => draw(angle))
watch(history, h => { if (activeTab.value === 'results') seenHistory.value = h.length })
</script>

<style scoped>
.count-badge {
  display: inline-grid; place-items: center; min-width: 30px; height: 30px; padding: 0 8px;
  border-radius: 999px; background: rgb(var(--secondary)); color: rgb(var(--foreground));
  font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 600;
}
.preset-pill {
  border: 1px solid rgb(var(--input)); border-radius: 999px;
  background: rgb(var(--card)); color: rgb(var(--foreground));
  padding: 6px 13px; font-size: 12.5px; font-weight: 600; cursor: pointer;
  transition: border-color .18s, background-color .18s, color .18s, transform .18s;
}
.preset-pill:hover { border-color: rgb(var(--primary)); color: rgb(var(--primary)); transform: translateY(-1px); }
.preset-pill:active { transform: translateY(0); }

/* collapsible editor panel */
.panel-toggle {
  flex: none; display: grid; place-items: center; width: 36px; height: 36px;
  border: 1px solid rgb(var(--border)); border-radius: 9px;
  background: rgb(var(--card)); color: rgb(var(--foreground) / .55); cursor: pointer;
  transition: color .18s, border-color .18s, background-color .18s;
}
.panel-toggle:hover { color: rgb(var(--primary)); border-color: rgb(var(--primary)); background: rgb(var(--primary) / .06); }
.editor-collapsed { padding: 0 !important; border: 0 !important; background: transparent !important; box-shadow: none !important; }
.editor-handle {
  position: sticky; top: 32px;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  width: 44px; min-height: 132px; padding: 14px 0;
  border: 1px solid rgb(var(--border)); border-radius: 12px;
  background: rgb(var(--card)); color: rgb(var(--primary));
  box-shadow: 0 6px 18px -8px rgb(0 0 0 / .35); cursor: pointer;
  transition: border-color .18s, transform .18s, box-shadow .18s;
}
.editor-handle:hover { border-color: rgb(var(--primary)); transform: translateX(-2px); box-shadow: 0 10px 24px -10px rgb(var(--primary) / .4); }
.editor-handle-text { writing-mode: vertical-rl; font-size: 12px; font-weight: 700; letter-spacing: .12em; }

/* panel tabs (entries / results) */
.wheel-tabs { display: flex; gap: 4px; padding: 4px; border-radius: 12px; background: rgb(var(--secondary) / .7); }
.wheel-tab {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  min-height: 36px; border-radius: 9px; padding: 0 10px;
  font-size: 13px; font-weight: 600; color: rgb(var(--foreground) / .6);
  transition: background-color .18s, color .18s, box-shadow .18s;
}
.wheel-tab:hover { color: rgb(var(--foreground)); }
.wheel-tab.active { background: rgb(var(--card)); color: rgb(var(--primary)); box-shadow: 0 1px 3px rgb(0 0 0 / .1); }
.wheel-tab-count {
  display: inline-grid; place-items: center; min-width: 18px; height: 18px; padding: 0 5px;
  border-radius: 999px; background: rgb(var(--foreground) / .1);
  font-family: 'DM Mono', monospace; font-size: 10px; line-height: 1;
}
.wheel-tab.active .wheel-tab-count { background: rgb(var(--primary) / .14); color: rgb(var(--primary)); }
.wheel-tab-count.accent { background: rgb(var(--primary) / .12); color: rgb(var(--primary)); }
.wheel-tab-count.unread { background: rgb(225 29 72 / .92); color: #fff; animation: unread-pulse 1.6s ease-in-out infinite; }
@keyframes unread-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }

/* result history */
.history-list { display: grid; gap: 8px; max-height: 22rem; overflow-y: auto; padding-right: 4px; }
.history-row {
  display: flex; align-items: center; gap: 10px;
  border: 1px solid rgb(var(--border)); border-radius: 10px; padding: 9px 11px;
  background: rgb(var(--card));
}
.history-seq {
  flex: none; display: grid; place-items: center; width: 22px; height: 22px; border-radius: 7px;
  background: rgb(var(--primary) / .1); color: rgb(var(--primary));
  font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 700;
}
.history-label { flex: 1; min-width: 0; font-size: 14px; font-weight: 600; color: rgb(var(--foreground)); overflow-wrap: anywhere; }
.history-time { flex: none; font-family: 'DM Mono', monospace; font-size: 11px; color: rgb(var(--foreground) / .5); }

.add-entry-btn {
  flex: none; display: inline-flex; align-items: center; gap: 4px;
  min-height: 30px; padding: 0 10px; border-radius: 8px;
  border: 1px solid rgb(var(--input)); background: rgb(var(--card)); color: rgb(var(--primary));
  font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap;
  transition: border-color .18s, background-color .18s, transform .18s;
}
.add-entry-btn:hover { border-color: rgb(var(--primary)); background: rgb(var(--primary) / .06); }
.add-entry-btn:active { transform: translateY(1px); }
.entry-row {
  display: flex; align-items: center; gap: 8px;
  border: 1px solid rgb(var(--border)); border-radius: 10px; padding: 5px 8px;
  background: rgb(var(--card));
}
.color-dot { width: 14px; height: 14px; flex: none; border-radius: 50%; border: 1px solid rgb(0 0 0 / .12); cursor: pointer; }
.weight-input {
  width: 52px; border: 1px solid rgb(var(--border)); border-radius: 6px;
  background: transparent; color: rgb(var(--foreground)); padding: 2px 4px; font-size: 12px; text-align: center;
}
.remove-btn { display: grid; place-items: center; width: 26px; height: 26px; flex: none; border-radius: 6px; color: rgb(var(--foreground) / .45); }
.remove-btn:hover { color: #e11d48; background: rgb(225 29 72 / .08); }
.options-box, .audit-box { border: 1px solid rgb(var(--border)); border-radius: 12px; overflow: hidden; background: rgb(var(--card)); }
.options-box summary, .audit-box summary {
  display: flex; align-items: center; gap: 8px; cursor: pointer; list-style: none;
  padding: 11px 13px; font-size: 13px; font-weight: 600; color: rgb(var(--foreground));
}
.options-box summary::-webkit-details-marker, .audit-box summary::-webkit-details-marker,
.faq-row summary::-webkit-details-marker { display: none; }
.chevron { transition: transform .2s ease; }
details[open] > summary .chevron { transform: rotate(180deg); }
.options-body { display: grid; gap: 16px; border-top: 1px solid rgb(var(--border)); padding: 14px 13px; }
.audit-pre {
  margin: 0; border-top: 1px solid rgb(var(--border)); padding: 12px 13px;
  max-height: 220px; overflow: auto; white-space: pre-wrap; word-break: break-all;
  font-family: 'DM Mono', monospace; font-size: 11px; line-height: 1.6; color: rgb(var(--foreground) / .75);
}

/* wheel stage */
.wheel-stage:fullscreen {
  display: grid; place-items: center; padding: 0; border: 0; border-radius: 0;
  overflow: hidden; background: rgb(var(--background));
}
/* keep the confetti + compact toast alive in fullscreen; hide every other stage child */
.wheel-stage:fullscreen > *:not(.wheel-frame):not(.confetti-screen):not(.compact-notify) { display: none !important; }
.wheel-stage:fullscreen .wheel-frame { width: min(90vh, 90vw, 900px); max-width: none; }
.wheel-stage:fullscreen .confetti-screen { z-index: 60; }
.wheel-stage:fullscreen .compact-notify { z-index: 70; }
.wheel-frame {
  position: relative; width: min(80vw, 500px); max-width: 100%; aspect-ratio: 1;
  margin: 0 auto; display: grid; place-items: center;
}
.wheel-canvas {
  display: block; width: 100%; height: 100%; border-radius: 50%; cursor: pointer;
  box-shadow: 0 24px 50px -26px rgb(0 0 0 / .6), 0 0 0 1px rgb(var(--border));
}
.pointer {
  position: absolute; top: 50%; right: -10px; transform: translateY(-50%);
  width: 0; height: 0;
  border-top: 12px solid transparent; border-bottom: 12px solid transparent;
  border-right: 24px solid rgb(var(--primary));
  z-index: 5; filter: drop-shadow(2px 0 2px rgba(0,0,0,.25));
}
.spin-hub {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  z-index: 6; width: 86px; height: 86px; border-radius: 50%;
  border: 4px solid rgb(var(--card)); background: rgb(var(--primary)); color: #fff;
  box-shadow: 0 10px 26px -10px rgb(0 0 0 / .7), inset 0 1px 0 rgb(255 255 255 / .3);
  cursor: pointer; display: grid; place-items: center;
  transition: transform .18s ease, filter .18s ease, box-shadow .18s ease;
}
.spin-hub:hover:not(:disabled) { transform: translate(-50%, -50%) scale(1.07); filter: brightness(1.08); box-shadow: 0 14px 34px -12px rgb(var(--primary) / .8); }
.spin-hub:active:not(:disabled) { transform: translate(-50%, -50%) scale(.95); }
.spin-hub:disabled { cursor: not-allowed; opacity: .55; }
.hub-inner {
  display: grid; place-items: center; width: 100%; height: 100%; border-radius: 50%;
  border: 2px dashed rgb(255 255 255 / .45);
}
.hub-label {
  font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 13px;
  letter-spacing: .06em; text-transform: uppercase; line-height: 1.05; text-align: center; padding: 0 6px;
}
.spin-hub.spinning .hub-inner { animation: hub-pulse 1s ease-in-out infinite; }
.spin-hub.spinning .hub-label { opacity: .7; }
@keyframes hub-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(.92); } }

/* full-screen confetti (teleported to <body>) */
.confetti-screen { position: fixed; inset: 0; z-index: 60; pointer-events: none; overflow: hidden; }
.confetti-screen i {
  position: absolute; top: -6vh; left: var(--x);
  width: var(--w); height: var(--h); border-radius: var(--br);
  background: var(--c); opacity: 0;
  animation: confetti-fall var(--t) linear var(--d) forwards;
}
@keyframes confetti-fall {
  0% { transform: translate3d(0, 0, 0) rotate(0); opacity: 0; }
  6% { opacity: 1; }
  88% { opacity: 1; }
  100% { transform: translate3d(var(--dx), 108vh, 0) rotate(var(--r)); opacity: 0; }
}

/* compact centred result toast: appears, holds, then fades out within 2s */
.compact-notify {
  position: fixed; left: 50%; top: 50%; z-index: 70; pointer-events: none;
  display: grid; place-items: center; gap: 5px;
  min-width: 240px; max-width: 80vw; padding: 20px 34px;
  border-radius: 18px; border: 1px solid rgb(255 255 255 / .16);
  background: rgb(8 22 17 / .94); color: #fff; text-align: center;
  box-shadow: 0 26px 70px -24px rgb(0 0 0 / .85);
  animation: notify-fade 2s ease forwards;
}
.compact-notify-kicker { font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: rgb(255 255 255 / .65); }
.compact-notify-name {
  font-family: 'Bricolage Grotesque', sans-serif; font-size: 32px; font-weight: 800;
  line-height: 1.15; overflow-wrap: anywhere;
}
.compact-notify-sub { font-size: 12px; color: rgb(255 255 255 / .6); }
@keyframes notify-fade {
  0%   { opacity: 0; transform: translate(-50%, -50%) scale(.92); }
  12%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  72%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(.98); }
}

/* winner-card mini burst (uses the same keyframes kept below) */
@keyframes burst {
  0% { transform: translate(-50%, -50%) scale(.4) rotate(0); opacity: 0; }
  12% { opacity: 1; }
  100% { transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1) rotate(var(--r)); opacity: 0; }
}

/* winner celebration overlay (Wheel of Names style) */
.winner-overlay {
  position: absolute; inset: 0; z-index: 9;
  display: grid; place-items: center; padding: 16px;
  background: rgb(2 12 9 / .48); backdrop-filter: blur(3px); border-radius: 20px;
}
.winner-pop {
  position: relative; width: min(92%, 380px); overflow: hidden;
  border: 1px solid rgb(var(--primary) / .35); border-radius: 20px;
  background: linear-gradient(160deg, rgb(var(--card)), rgb(var(--primary) / .07));
  box-shadow: 0 30px 60px -20px rgb(0 0 0 / .6);
  padding: 26px 22px 22px; text-align: center;
}
.winner-pop-confetti { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.winner-pop-confetti i {
  position: absolute; left: 50%; top: 38%; width: 7px; height: 7px; border-radius: 2px;
  background: var(--c); opacity: 0;
  animation: burst 1.5s cubic-bezier(.16,.7,.3,1) var(--d) forwards;
}
.winner-pop-trophy {
  display: grid; place-items: center; width: 54px; height: 54px; margin: 0 auto 12px;
  border-radius: 50%; background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #fff;
  box-shadow: 0 8px 20px -8px rgb(245 158 11 / .9);
}
.winner-pop-trophy svg { width: 28px; height: 28px; }
.winner-pop-kicker { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: rgb(var(--foreground) / .5); }
.winner-pop-name { margin-top: 6px; font-family: 'Bricolage Grotesque', sans-serif; font-size: clamp(28px, 7vw, 42px); font-weight: 800; letter-spacing: -.02em; line-height: 1.1; color: rgb(var(--primary)); overflow-wrap: anywhere; }
.winner-pop-sub { margin-top: 6px; font-size: 12px; color: rgb(var(--foreground) / .55); }
.winner-pop-actions { display: flex; justify-content: center; gap: 10px; margin-top: 20px; }
.winner-pop-actions button { min-width: 120px; }
.winner-pop-enter-active { animation: pop-in .42s cubic-bezier(.2,1.3,.4,1) both; }
.winner-pop-leave-active { animation: pop-out .2s ease both; }
@keyframes pop-in { from { opacity: 0; transform: scale(.8); } to { opacity: 1; transform: none; } }
@keyframes pop-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: scale(.94); } }

/* secondary controls */
.stage-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.icon-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 42px;
  border: 1px solid rgb(var(--input)); border-radius: 10px; background: rgb(var(--card));
  color: rgb(var(--foreground)); padding: 0 14px; font-size: 13px; font-weight: 600; cursor: pointer;
  transition: border-color .18s, color .18s, transform .18s, box-shadow .18s;
}
.icon-btn:hover { border-color: rgb(var(--primary) / .6); color: rgb(var(--primary)); transform: translateY(-2px); box-shadow: 0 10px 22px -18px rgb(0 0 0 / .8); }
.icon-btn:active { transform: translateY(0); }

/* tool cards */
.choice-card {
  display: flex; flex-direction: column; align-items: flex-start; gap: .45rem;
  border: 1px solid rgb(var(--border)); border-radius: 12px; padding: 1rem;
  background: rgb(var(--card)); text-align: left; color: rgb(var(--foreground));
  transition: border-color .18s, transform .18s, box-shadow .18s;
}
button.choice-card { cursor: pointer; }
.choice-card:hover { border-color: rgb(var(--primary)); transform: translateY(-2px); box-shadow: 0 12px 26px -20px rgb(0 0 0 / .7); }
.tool-icon { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 9px; background: rgb(var(--primary) / .1); color: rgb(var(--primary)); }

/* FAQ */
.faq-row summary {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 14px 0; cursor: pointer; list-style: none; font-size: 14px; font-weight: 600;
  color: rgb(var(--foreground));
}
.faq-answer { padding: 0 0 16px; font-size: 14px; line-height: 1.7; color: rgb(var(--foreground) / .65); max-width: 75ch; }
</style>
