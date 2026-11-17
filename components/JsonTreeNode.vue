<template>
  <div class="json-node">
    <div class="json-node-row">
      <button
        v-if="node.container"
        type="button"
        class="json-toggle"
        :class="{ 'is-open': open }"
        :title="open ? t('jsonFormatter.collapse') : t('jsonFormatter.expand')"
        :aria-label="open ? t('jsonFormatter.collapse') : t('jsonFormatter.expand')"
        :aria-expanded="open"
        @click="toggle"
      >
        <svg v-if="open" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 8h7" /></svg>
        <svg v-else viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 8h7M8 4.5v7" /></svg>
      </button>
      <span v-else class="json-toggle-space" aria-hidden="true"></span>

      <span class="json-key" :class="{ 'json-key--index': node.isIndex || node.key === undefined }">{{ keyLabel }}</span>
      <span v-if="node.key !== undefined" class="json-colon">:</span>

      <template v-if="node.container">
        <span class="json-brace">{{ node.type === 'array' ? '[' : '{' }}</span>
        <span class="json-shape">{{ node.type === 'array' ? t('jsonFormatter.items', { count: node.count }) : t('jsonFormatter.keys', { count: node.count }) }}</span>
        <span class="json-brace">{{ node.type === 'array' ? ']' : '}' }}</span>
      </template>
      <span v-else class="json-value" :class="`json-value--${node.type}`" :title="String(node.value)">{{ valueLabel }}</span>

      <button type="button" class="json-copy" :title="t('jsonFormatter.copyValue')" :aria-label="t('jsonFormatter.copyValue')" @click="copy">
        <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="4.5" width="7" height="9" rx="1.5" /><path d="M6.5 4.5V3h4v1.5" /></svg>
      </button>
    </div>

    <div v-if="node.container && open && node.children.length" class="json-children">
      <JsonTreeNode v-for="child in node.children" :key="child.path" :node="child" :depth="depth + 1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

const props = defineProps<{ node: any; depth: number }>()
const { t } = useI18n()

const state = inject('jsonTreeState', {
  isExpanded: (path, depth) => depth < 2,
  toggle: () => {},
  copyValue: () => {}
})

const open = computed(() => state.isExpanded(props.node.path, props.depth))
const toggle = () => state.toggle(props.node.path, props.depth)
const copy = () => state.copyValue(props.node.value)

const keyLabel = computed(() => props.node.key === undefined ? 'root' : String(props.node.key))
const valueLabel = computed(() => {
  const value = props.node.value
  if (props.node.type === 'string') return `"${value}"`
  if (props.node.type === 'null') return 'null'
  return String(value)
})
</script>

<style scoped>
.json-node-row {
  display: flex;
  align-items: center;
  gap: 5px;
  min-height: 27px;
  padding: 1px 5px 1px 2px;
  border-radius: 6px;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: nowrap;
  transition: background-color .14s ease;
}
.json-node-row:hover { background: rgb(226 232 228 / .7); }
:global(.dark) .json-node-row:hover { background: #29382f; }

/* ---- fold / unfold buttons: deliberately different glyphs ---- */
.json-toggle,
.json-toggle-space { flex: 0 0 16px; width: 16px; height: 16px; }
.json-toggle {
  display: grid;
  place-items: center;
  border: 1px solid #d5ddd9;
  border-radius: 4px;
  background: #eef2ef;
  color: #64748b;
  cursor: pointer;
  transition: background-color .15s ease, border-color .15s ease, color .15s ease, transform .15s ease;
}
.json-toggle:hover { background: #dfe9e4; border-color: #0f766e; color: #0f766e; transform: translateY(-1px); }
.json-toggle.is-open { background: rgb(15 118 110 / .12); border-color: rgb(15 118 110 / .4); color: #0f766e; }
.json-toggle svg { width: 11px; height: 11px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; }
:global(.dark) .json-toggle { border-color: #3d4f45; background: #25342c; color: #93a69b; }
:global(.dark) .json-toggle:hover { border-color: #c2e65c; background: #2d4033; color: #d6f25f; }
:global(.dark) .json-toggle.is-open { border-color: rgb(194 230 92 / .5); background: rgb(194 230 92 / .13); color: #d6f25f; }

/* ---- keys and values ---- */
.json-key { overflow: hidden; max-width: 150px; text-overflow: ellipsis; color: #0f766e; font-weight: 500; }
.json-key--index { color: #94a3b8; font-weight: 400; }
:global(.dark) .json-key { color: #c2e65c; }
:global(.dark) .json-key--index { color: #7f938a; }

.json-colon { color: #94a3b8; }
:global(.dark) .json-colon { color: #6f8177; }
.json-brace { color: #64748b; }
:global(.dark) .json-brace { color: #8a9d93; }

.json-shape {
  border: 1px solid #d8e0dc;
  border-radius: 999px;
  padding: 0 6px;
  background: rgb(255 255 255 / .7);
  color: #64748b;
  font-size: 9px;
  letter-spacing: .02em;
}
:global(.dark) .json-shape { border-color: #3d4f45; background: #202d27; color: #9fb0a6; }

.json-value { overflow: hidden; max-width: 180px; text-overflow: ellipsis; }
.json-value--string { color: #b45309; }
.json-value--number { color: #7c3aed; }
.json-value--boolean { color: #be123c; }
.json-value--null { color: #94a3b8; font-style: italic; }
:global(.dark) .json-value--string { color: #f5c96b; }
:global(.dark) .json-value--number { color: #b7a3f5; }
:global(.dark) .json-value--boolean { color: #f78ba4; }
:global(.dark) .json-value--null { color: #7f938a; }

/* ---- per-node copy ---- */
.json-copy {
  display: grid;
  place-items: center;
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  margin-left: auto;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #64748b;
  opacity: 0;
  cursor: pointer;
  transition: opacity .14s ease, background-color .14s ease, color .14s ease;
}
.json-copy svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.json-node-row:hover .json-copy,
.json-copy:focus-visible { opacity: 1; }
.json-copy:hover { background: rgb(15 118 110 / .12); color: #0f766e; }
:global(.dark) .json-copy { color: #93a69b; }
:global(.dark) .json-copy:hover { background: rgb(194 230 92 / .14); color: #d6f25f; }

/* ---- level guides ---- */
.json-children {
  margin-left: 8px;
  padding-left: 12px;
  border-left: 1px solid #dfe6e2;
}
:global(.dark) .json-children { border-left-color: #34463b; }

@media (hover: none) {
  .json-copy { opacity: .7; }
}
</style>
