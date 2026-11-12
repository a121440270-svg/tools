<template>
  <ToolLandingLayout
    :badge="t('mergeTool.badge')"
    :title="t('mergeTool.title')"
    :description="t('mergeTool.description')"
    :seo-title="t('mergeTool.seoTitle')"
    :seo-description="t('mergeTool.seoDescription')"
    :seo-keywords="t('mergeTool.seoKeywords')"
    :hero-foot="t('mergeTool.heroFoot')"
    :meta-label="t('mergeTool.metaLabel')"
    :tool-bar-text="t('mergeTool.toolBar')"
    :tool-bar-hint="t('mergeTool.toolBarHint')"
    primary-href="#tool"
    :primary-text="t('mergeTool.primaryCta')"
    secondary-href="/image-compress"
    :secondary-text="t('mergeTool.secondaryCta')"
    :points="[t('mergeTool.point1'), t('mergeTool.point2'), t('mergeTool.point3'), t('mergeTool.point4')]"
    :features="[
      { title: t('mergeTool.feature1Title'), text: t('mergeTool.feature1Text') },
      { title: t('mergeTool.feature2Title'), text: t('mergeTool.feature2Text') },
      { title: t('mergeTool.feature3Title'), text: t('mergeTool.feature3Text') }
    ]"
    :faq-items="faqItems"
  >
    <ImageMergerTool />

    <section class="merge-extra">
      <h2>{{ t('mergeTool.compareTitle') }}</h2>
      <p class="compare-intro">{{ t('mergeTool.compareIntro') }}</p>

      <div class="table-wrap">
        <table class="compare-table">
          <thead>
            <tr>
              <th scope="col">{{ t('mergeTool.compareFeature') }}</th>
              <th scope="col" class="is-us">OnliTool</th>
              <th scope="col">PineTools</th>
              <th scope="col">Canva</th>
              <th scope="col">Smallpdf</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in compareRows" :key="row.label">
              <th scope="row">{{ row.label }}</th>
              <td class="is-us cell-yes">✓</td>
              <td :class="cellClass(row.pine)">{{ cellSymbol(row.pine) }}</td>
              <td :class="cellClass(row.canva)">{{ cellSymbol(row.canva) }}</td>
              <td :class="cellClass(row.smallpdf)">{{ cellSymbol(row.smallpdf) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="compare-legend">{{ t('mergeTool.compareLegend') }}</p>
      <p class="compare-note">{{ t('mergeTool.compareNote') }}</p>

      <h2 class="faq-title">{{ t('mergeTool.faqTitle') }}</h2>
      <div class="faq-list">
        <details v-for="item in faqItems" :key="item.q" class="faq-item">
          <summary>{{ item.q }}</summary>
          <p>{{ item.a }}</p>
        </details>
      </div>
    </section>
  </ToolLandingLayout>
</template>

<script setup>
import { computed } from 'vue'

const { t } = useI18n()

const FAQ_COUNT = 8

const faqItems = computed(() =>
  Array.from({ length: FAQ_COUNT }, (_, index) => ({
    q: t(`mergeTool.faq${index + 1}Q`),
    a: t(`mergeTool.faq${index + 1}A`)
  }))
)

const compareRows = computed(() => [
  { label: t('mergeTool.compareRow1'), pine: 'partial', canva: 'yes', smallpdf: 'no' },
  { label: t('mergeTool.compareRow2'), pine: 'no', canva: 'no', smallpdf: 'no' },
  { label: t('mergeTool.compareRow3'), pine: 'partial', canva: 'partial', smallpdf: 'no' },
  { label: t('mergeTool.compareRow4'), pine: 'no', canva: 'no', smallpdf: 'no' },
  { label: t('mergeTool.compareRow5'), pine: 'yes', canva: 'no', smallpdf: 'partial' }
])

function cellSymbol(value) {
  if (value === 'yes') return '✓'
  if (value === 'partial') return '~'
  return '—'
}

function cellClass(value) {
  if (value === 'yes') return 'cell-yes'
  if (value === 'partial') return 'cell-partial'
  return 'cell-no'
}
</script>

<style scoped>
.merge-extra {
  padding: 8px clamp(16px, 3vw, 32px) 34px;
}

.merge-extra h2 {
  margin: 26px 0 8px;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.compare-intro {
  margin: 0 0 14px;
  max-width: 70ch;
  color: rgb(var(--foreground) / 0.68);
  font-size: 0.92rem;
  line-height: 1.7;
}

.table-wrap {
  overflow-x: auto;
  border: 1.5px solid rgb(var(--border));
  border-radius: 14px;
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 560px;
  font-size: 0.84rem;
}

.compare-table th,
.compare-table td {
  padding: 10px 12px;
  border-bottom: 1px solid rgb(var(--border));
  text-align: center;
}

.compare-table thead th {
  background: rgb(var(--secondary) / 0.75);
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(var(--foreground) / 0.6);
}

.compare-table thead th.is-us {
  color: rgb(var(--primary));
}

.compare-table tbody th {
  text-align: start;
  font-weight: 600;
  color: rgb(var(--foreground) / 0.8);
}

.compare-table tbody tr:last-child th,
.compare-table tbody tr:last-child td {
  border-bottom: 0;
}

.compare-table td.is-us {
  background: rgb(var(--primary) / 0.07);
  font-weight: 700;
}

.cell-yes {
  color: rgb(var(--primary));
  font-weight: 700;
}

.cell-partial {
  color: rgb(var(--accent));
  font-weight: 700;
}

.cell-no {
  color: rgb(var(--foreground) / 0.35);
  font-weight: 700;
}

.compare-legend {
  margin: 8px 0 0;
  color: rgb(var(--foreground) / 0.5);
  font-size: 0.76rem;
}

.compare-note {
  margin: 6px 0 0;
  max-width: 78ch;
  color: rgb(var(--foreground) / 0.62);
  font-size: 0.82rem;
  line-height: 1.65;
}

.faq-title {
  margin-top: 34px !important;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.faq-item {
  border: 1px solid rgb(var(--border));
  border-radius: 12px;
  background: rgb(var(--card));
  padding: 0 14px;
}

.faq-item summary {
  padding: 12px 0;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 10px;
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item summary::before {
  content: '+';
  color: rgb(var(--primary));
  font-family: 'DM Mono', monospace;
  font-size: 1rem;
  line-height: 1;
}

.faq-item[open] summary::before {
  content: '−';
}

.faq-item p {
  margin: 0 0 14px;
  color: rgb(var(--foreground) / 0.68);
  font-size: 0.86rem;
  line-height: 1.7;
}
</style>
