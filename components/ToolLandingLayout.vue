<template>
  <main class="tool-landing">
    <section class="hero">
      <div class="hero-copy reveal" style="--rd: 40ms">
        <span class="badge">{{ badge }}</span>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
        <div class="cta-row">
          <a :href="primaryHref" class="button primary">{{ primaryText }}<span class="arrow" aria-hidden="true">→</span></a>
          <NuxtLinkLocale :to="secondaryHref" class="button secondary">{{ secondaryText }}</NuxtLinkLocale>
        </div>
        <div class="hero-foot">
          <span class="pulse" aria-hidden="true" />
          <span>No upload · No signup · Runs in your browser</span>
        </div>
      </div>

      <aside class="meta-card reveal" style="--rd: 160ms">
        <span class="meta-label">What you can do</span>
        <ul>
          <li v-for="item in points" :key="item">{{ item }}</li>
        </ul>
      </aside>
    </section>

    <section v-if="features.length" class="feature-grid">
      <article
        v-for="(feature, index) in features"
        :key="feature.title"
        class="feature-card lift reveal"
        :style="{ '--rd': `${220 + index * 80}ms` }"
      >
        <span class="feature-number">{{ String(index + 1).padStart(2, '0') }}</span>
        <h2>{{ feature.title }}</h2>
        <p>{{ feature.text }}</p>
      </article>
    </section>

    <div id="tool" class="tool-shell reveal" style="--rd: 340ms">
      <div class="tool-bar">
        <span class="tool-bar-dot" aria-hidden="true" />
        <span>Tool — runs locally in your browser</span>
        <span class="tool-bar-hint">↓ scroll &amp; try it</span>
      </div>
      <slot />
    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  badge: { type: String, default: 'Image Tool' },
  title: { type: String, default: 'Tool' },
  description: { type: String, default: '' },
  primaryHref: { type: String, default: '#tool' },
  primaryText: { type: String, default: 'Use the tool' },
  secondaryHref: { type: String, default: '/image-converter' },
  secondaryText: { type: String, default: 'Browse more image tools' },
  points: { type: Array, default: () => [] },
  features: { type: Array, default: () => [] },
  /** Optional <title> override; falls back to `title` plus a brand suffix. */
  seoTitle: { type: String, default: '' },
  /** Optional meta description override; falls back to `description`. */
  seoDescription: { type: String, default: '' },
  seoKeywords: { type: String, default: '' }
})

const resolvedSeoTitle = computed(() => {
  const value = (props.seoTitle || props.title || '').trim()
  if (!value) return 'OnliTool'
  return value.includes('OnliTool') ? value : `${value} | OnliTool`
})

useToolSeo({
  title: resolvedSeoTitle,
  description: computed(() => props.seoDescription || props.description),
  keywords: computed(() => props.seoKeywords),
  featureList: computed(() => props.points)
})
</script>

<style scoped>
.tool-landing {
  max-width: 1160px;
  margin: 0 auto;
  padding: 44px 24px 76px;
  color: rgb(var(--foreground));
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(280px, 0.85fr);
  gap: 20px;
  margin-bottom: 22px;
}

/* ---- ink console panel ---- */
.hero-copy {
  position: relative;
  overflow: hidden;
  padding: 38px 36px 32px;
  border-radius: 22px;
  background: #121614;
  color: #f4f7f5;
  box-shadow: 0 30px 60px -40px rgb(0 0 0 / 0.8);
}

.hero-copy::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(520px 300px at 8% 0%, rgb(15 163 125 / 0.45), transparent 65%),
    radial-gradient(460px 280px at 96% 108%, rgb(255 90 45 / 0.35), transparent 60%),
    radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.08) 1px, transparent 0);
  background-size: auto, auto, 24px 24px;
  pointer-events: none;
  animation: hero-glow 8s ease-in-out infinite alternate;
}

@keyframes hero-glow {
  0% {
    opacity: 0.95;
  }
  100% {
    opacity: 1;
  }
}

.hero-copy > * {
  position: relative;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 7px 13px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  color: #cfe4da;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.badge::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ff6b3d;
  box-shadow: 0 0 0 0 rgba(255, 107, 61, 0.55);
  animation: badge-pulse 2.2s ease-out infinite;
}

@keyframes badge-pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 107, 61, 0.55); }
  70% { box-shadow: 0 0 0 9px rgba(255, 107, 61, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 107, 61, 0); }
}

.hero-copy h1 {
  margin: 20px 0 0;
  font-size: clamp(2.3rem, 4.4vw, 3.5rem);
  line-height: 1.03;
  letter-spacing: -0.035em;
  font-weight: 700;
}

.hero-copy h1::after {
  content: '';
  display: block;
  width: 72px;
  height: 6px;
  margin-top: 18px;
  border-radius: 4px;
  background: #ff5a2d;
}

.hero-copy p {
  margin: 18px 0 0;
  max-width: 58ch;
  color: #aebbb4;
  font-size: 1.03rem;
  line-height: 1.7;
}

.cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 26px;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 46px;
  padding: 0 20px;
  border-radius: 13px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease,
    border-color 0.18s ease, color 0.18s ease;
}

.button.primary {
  background: #ff5a2d;
  color: #14181a;
  box-shadow: 0 12px 26px -16px rgba(255, 90, 45, 0.9);
}

.button.primary:hover {
  transform: translateY(-2px);
  background: #ff6d45;
  box-shadow: 0 18px 32px -16px rgba(255, 90, 45, 1);
}

.button.primary .arrow {
  transition: transform 0.18s ease;
}

.button.primary:hover .arrow {
  transform: translateX(4px);
}

.button.secondary {
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(255, 255, 255, 0.05);
  color: #e7ede9;
}

.button.secondary:hover {
  border-color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.hero-foot {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 24px;
  color: #7e8d85;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #57c09a;
  animation: badge-pulse 2.4s ease-out infinite;
}

/* ---- checklist card ---- */
.meta-card {
  padding: 26px 26px 28px;
  border: 1.5px solid rgb(var(--border));
  border-radius: 22px;
  background: rgb(var(--card));
  box-shadow: 0 24px 48px -40px rgb(0 0 0 / 0.6);
}

.meta-label {
  display: block;
  color: rgb(var(--primary));
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.meta-card ul {
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}

.meta-card li {
  position: relative;
  padding: 11px 0 11px 30px;
  border-top: 1px dashed rgb(var(--border));
  color: rgb(var(--foreground) / 0.85);
  line-height: 1.5;
  font-size: 0.95rem;
}

.meta-card li:first-child {
  border-top: 0;
  padding-top: 0;
}

.meta-card li::before {
  content: '→';
  position: absolute;
  left: 0;
  top: 11px;
  color: #ff5a2d;
  font-family: 'DM Mono', monospace;
  font-weight: 500;
}

.meta-card li:first-child::before {
  top: 0;
}

/* ---- feature cards ---- */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 22px;
}

.feature-card {
  padding: 22px 20px 24px;
  border: 1.5px solid rgb(var(--border));
  border-radius: 18px;
  background: rgb(var(--card));
}

.feature-number {
  display: inline-block;
  margin-bottom: 14px;
  color: rgb(var(--primary));
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.14em;
}

.feature-card h2 {
  margin: 0 0 8px;
  font-size: 1.1rem;
  letter-spacing: -0.015em;
}

.feature-card p {
  margin: 0;
  color: rgb(var(--foreground) / 0.68);
  line-height: 1.65;
  font-size: 0.94rem;
}

/* ---- tool workspace ---- */
.tool-shell {
  overflow: hidden;
  border: 1.5px solid rgb(var(--foreground) / 0.85);
  border-radius: 22px;
  background: rgb(var(--card));
  box-shadow: 7px 7px 0 rgb(var(--foreground) / 0.12);
}

.tool-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-bottom: 1.5px solid rgb(var(--border));
  background: rgb(var(--secondary));
  color: rgb(var(--foreground) / 0.62);
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.tool-bar-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(var(--primary));
  box-shadow: 0 0 0 3px rgb(var(--primary) / 0.18);
}

.tool-bar-hint {
  margin-left: auto;
  color: rgb(var(--foreground) / 0.42);
}

.tool-shell :deep(.image-tool),
.tool-shell :deep(main) {
  padding-top: 24px;
}

@media (max-width: 760px) {
  .tool-landing { padding: 28px 16px 56px; }
  .hero, .feature-grid { grid-template-columns: 1fr; }
  .hero-copy { padding: 28px 22px 26px; }
  .cta-row { flex-direction: column; }
  .button { width: 100%; }
  .tool-bar-hint { display: none; }
}
</style>
