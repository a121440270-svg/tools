<template>
  <div class="mx-auto max-w-5xl py-6 sm:py-10">
    <!-- Hero: exact-match H1 plus a self-contained answer paragraph for GEO citation -->
    <header class="reveal relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_30px_60px_-52px_rgba(0,0,0,0.5)] dark:border-slate-800 dark:bg-slate-900/95 sm:p-10" style="--rd: 40ms">
      <div class="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#ff5a2d]/10 blur-3xl" aria-hidden="true" />
      <div class="relative">
        <nav class="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500" aria-label="Breadcrumb">
          <NuxtLinkLocale to="/spin-the-wheel" class="transition hover:text-primary">{{ config.breadcrumbLabel }}</NuxtLinkLocale>
          <span aria-hidden="true">/</span>
          <span class="text-slate-600 dark:text-slate-300">{{ config.breadcrumbCurrent }}</span>
        </nav>
        <p class="kicker mt-4">{{ config.kicker }}</p>
        <h1 class="mt-3 max-w-3xl font-display text-[clamp(2.1rem,5vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-slate-900 dark:text-white">
          {{ config.title }}
        </h1>
        <p class="mt-5 max-w-3xl text-[15px] leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
          {{ config.lead }}
        </p>
        <p class="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          {{ config.updated }}
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <NuxtLinkLocale to="/spin-the-wheel" class="btn-primary inline-flex items-center gap-2">
            {{ config.primaryText }} <span aria-hidden="true">→</span>
          </NuxtLinkLocale>
          <NuxtLinkLocale :to="config.secondaryTo" class="btn-secondary inline-flex items-center">
            {{ config.secondaryText }}
          </NuxtLinkLocale>
        </div>
      </div>
    </header>

    <!-- Direct answer + features: the paragraph is written to stand alone when quoted -->
    <section class="mt-5 rounded-2xl border border-primary/25 bg-primary/5 p-5 dark:border-primary/30 dark:bg-primary/10 sm:p-6" aria-labelledby="answer-title">
      <h2 id="answer-title" class="font-display text-lg font-bold text-slate-900 dark:text-white">
        {{ config.answerTitle }}
      </h2>
      <p class="mt-2 max-w-3xl text-[15px] leading-7 text-slate-700 dark:text-slate-200">
        {{ config.answer }}
      </p>
      <ul class="mt-4 grid gap-2.5 sm:grid-cols-2">
        <li v-for="item in config.bullets" :key="item" class="flex gap-2.5 text-sm leading-6 text-slate-700 dark:text-slate-200">
          <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <span>{{ item }}</span>
        </li>
      </ul>
    </section>

    <!-- How-to steps -->
    <section class="mt-8" aria-labelledby="steps-title">
      <h2 id="steps-title" class="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {{ config.stepsTitle }}
      </h2>
      <ol class="mt-4 grid gap-3 sm:grid-cols-2">
        <li
          v-for="(step, index) in config.steps"
          :key="index"
          class="flex gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-900/80"
        >
          <span class="font-mono text-sm font-bold text-[#ff5a2d]">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="text-sm leading-6 text-slate-600 dark:text-slate-300">{{ step }}</span>
        </li>
      </ol>
    </section>

    <!-- Sibling cross-links -->
    <section class="mt-8 rounded-[28px] border border-slate-200 bg-white/95 p-6 dark:border-slate-800 dark:bg-slate-900/95 sm:p-8" aria-labelledby="related-title">
      <h2 id="related-title" class="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {{ config.relatedTitle }}
      </h2>
      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        <NuxtLinkLocale
          v-for="link in config.related"
          :key="link.to"
          :to="link.to"
          class="lift group flex items-start justify-between gap-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4 transition hover:border-primary/40 dark:border-slate-700/70 dark:bg-slate-800/40"
        >
          <span>
            <span class="block text-sm font-semibold text-slate-800 dark:text-slate-100">{{ link.title }}</span>
            <span class="mt-1 block text-[13px] leading-6 text-slate-500 dark:text-slate-400">{{ link.text }}</span>
          </span>
          <span class="mt-1 shrink-0 font-mono text-sm text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#ff5a2d]" aria-hidden="true">→</span>
        </NuxtLinkLocale>
      </div>
    </section>

    <!-- Visible FAQ: same items feed the FAQPage schema in each route -->
    <section class="mt-8" aria-labelledby="faq-title">
      <h2 id="faq-title" class="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {{ config.faqTitle }}
      </h2>
      <div class="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white/90 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/80">
        <details v-for="faq in config.faqs" :key="faq.q" class="group p-5">
          <summary class="flex cursor-pointer list-none items-start justify-between gap-4 text-[15px] font-semibold text-slate-800 dark:text-slate-100">
            <span>{{ faq.q }}</span>
            <span class="mt-0.5 font-mono text-slate-400 transition group-open:rotate-45" aria-hidden="true">+</span>
          </summary>
          <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{{ faq.a }}</p>
        </details>
      </div>
    </section>

    <footer class="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <p class="text-[13px] leading-6 text-slate-500 dark:text-slate-400">{{ config.footerNote }}</p>
      <p class="mt-3 text-[13px]">
        <NuxtLinkLocale to="/spin-the-wheel" class="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
          {{ config.breadcrumbLabel }}
        </NuxtLinkLocale>
      </p>
    </footer>
  </div>
</template>

<script setup>
defineProps({
  config: {
    type: Object,
    required: true
  }
})
</script>
