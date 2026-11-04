<template>
  <section
    v-if="content"
    class="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white/70 p-5 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 sm:p-6"
  >
    <h2 class="mb-3 text-xl font-semibold text-slate-900 dark:text-white">{{ content.heading }}</h2>
    <p v-for="paragraph in content.paragraphs" :key="paragraph" class="mb-3 text-sm leading-7">
      {{ paragraph }}
    </p>
    <ul v-if="content.bullets?.length" class="list-disc space-y-1.5 ps-5 text-sm leading-6">
      <li v-for="bullet in content.bullets" :key="bullet">{{ bullet }}</li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import toolContent from '~/data/tool-content'

const route = useRoute()

const normalizedPath = computed(() => {
  const path = route.path.replace(/^\/(zh|ja|de|fr|ar)(?=\/|$)/, '').replace(/\/+$/, '')
  return path || '/'
})

const content = computed(() => toolContent[normalizedPath.value] || null)
</script>
