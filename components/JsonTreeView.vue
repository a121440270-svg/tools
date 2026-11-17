<template>
  <aside
    class="json-tree-pane relative flex w-full shrink-0 flex-col border-b border-[#dde5e0] bg-[#f6f8f5] md:border-b-0 md:border-r dark:border-[#2e3d35] dark:bg-[#18211d]"
    :style="{ '--tree-width': `${paneWidth}px` }"
  >
    <header class="json-tree-header flex items-center gap-2 border-b border-[#dde5e0] px-3 py-2 dark:border-[#2e3d35]">
      <span class="json-tree-live" aria-hidden="true"></span>
      <span class="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-[#9fb0a6]">{{ t('jsonFormatter.treeView') }}</span>
      <span v-if="tree" class="json-tree-count">{{ t('jsonFormatter.treeNodes', { count: nodeCount }) }}</span>

      <div class="ml-auto flex items-center gap-0.5">
        <button type="button" class="json-tree-tool" :title="t('jsonFormatter.expandAll')" :aria-label="t('jsonFormatter.expandAll')" @click="setAll(true)">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 4.5 7 8l-3.5 3.5M8.5 4.5 12 8l-3.5 3.5" /></svg>
        </button>
        <button type="button" class="json-tree-tool" :title="t('jsonFormatter.collapseAll')" :aria-label="t('jsonFormatter.collapseAll')" @click="setAll(false)">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 11.5 7 8 3.5 4.5M8.5 11.5 12 8 8.5 4.5" /></svg>
        </button>
        <button type="button" class="json-tree-tool" :title="t('jsonFormatter.copyAll')" :aria-label="t('jsonFormatter.copyAll')" @click="copyAll">
          <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="4.5" width="7" height="9" rx="1.5" /><path d="M6.5 4.5V3h4v1.5" /></svg>
        </button>
        <span class="json-tree-divider" aria-hidden="true"></span>
        <button type="button" class="json-tree-tool json-tree-tool--close" :title="t('jsonFormatter.hideTree')" :aria-label="t('jsonFormatter.hideTree')" @click="emit('hide')">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>
        </button>
      </div>
    </header>

    <div class="json-tree-body min-h-0 max-h-[300px] flex-1 overflow-auto px-2 py-2.5 md:max-h-none">
      <JsonTreeNode v-if="tree" :node="tree.root" :depth="0" />

      <div v-else-if="isEmpty" class="json-tree-state">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 6h7l3 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" /><path d="M10 15h12M10 20h8" /></svg>
        <p>{{ t('jsonFormatter.treeEmpty') }}</p>
      </div>

      <div v-else class="json-tree-state json-tree-state--invalid">
        <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11" /><path d="M16 10v7M16 21h.01" /></svg>
        <p>{{ t('jsonFormatter.treeInvalid') }}</p>
      </div>
    </div>

    <div
      class="tree-resizer hidden md:block"
      :class="{ 'is-resizing': isResizing }"
      role="separator"
      aria-orientation="vertical"
      :aria-valuenow="paneWidth"
      aria-valuemin="240"
      aria-valuemax="640"
      :aria-label="t('jsonFormatter.resizeTree')"
      tabindex="0"
      @pointerdown="startResize"
      @keydown.left.prevent="nudge(-16)"
      @keydown.right.prevent="nudge(16)"
    >
      <span class="tree-resizer-grip" aria-hidden="true"></span>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, provide, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{ text: string }>()
const emit = defineEmits<{ hide: []; 'update:width': [value: number] }>()
const { t } = useI18n()

const widthKey = 'opsdrop-json-formatter-tree-width'
const MIN_WIDTH = 240
const MAX_WIDTH = 640
const paneWidth = ref(360)

if (import.meta.client) {
  const saved = Number(localStorage.getItem(widthKey))
  if (Number.isFinite(saved) && saved >= MIN_WIDTH && saved <= MAX_WIDTH) paneWidth.value = saved
}

watch(paneWidth, (value) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(widthKey, String(value))
  emit('update:width', value)
})

const isResizing = ref(false)
let startX = 0
let startWidth = 0
const onMove = (event: PointerEvent) => {
  paneWidth.value = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + event.clientX - startX))
}
const onUp = () => {
  isResizing.value = false
  document.removeEventListener('pointermove', onMove)
  document.removeEventListener('pointerup', onUp)
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}
const startResize = (event: PointerEvent) => {
  event.preventDefault()
  isResizing.value = true
  startX = event.clientX
  startWidth = paneWidth.value
  document.addEventListener('pointermove', onMove)
  document.addEventListener('pointerup', onUp)
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'
}
const nudge = (delta: number) => {
  paneWidth.value = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, paneWidth.value + delta))
}
onBeforeUnmount(onUp)

function buildModel(value) {
  const nodes = []
  let id = 0

  function walk(key, val, depth, parentPath, isIndex = false) {
    const type = val === null ? 'null' : Array.isArray(val) ? 'array' : typeof val
    const container = type === 'object' || type === 'array'
    const path = parentPath ? `${parentPath}.${key}` : 'root'
    const node = { id: id++, key, value: val, type, container, depth, path, isIndex, count: 0, children: [] }

    if (container) {
      const entries = type === 'array' ? val.map((item, index) => [String(index), item]) : Object.entries(val)
      node.count = entries.length
      node.children = entries.map(([childKey, childValue], index) => walk(childKey, childValue, depth + 1, path, type === 'array' || /^\d+$/.test(childKey)))
    }

    nodes.push(node)
    return node
  }

  const root = walk(undefined, value, 0, '')
  return { root, nodes }
}

const isEmpty = computed(() => !props.text || !props.text.trim())

const parsed = computed(() => {
  if (isEmpty.value) return { ok: false, value: undefined }
  try {
    return { ok: true, value: JSON.parse(props.text) }
  } catch {
    return { ok: false, value: undefined }
  }
})

const tree = computed(() => parsed.value.ok ? buildModel(parsed.value.value) : null)
const nodeCount = computed(() => tree.value?.nodes.length ?? 0)

const expanded = reactive({})
const isExpanded = (path, depth) => expanded[path] ?? depth < 2
const toggle = (path, depth) => { expanded[path] = !isExpanded(path, depth) }

const setAll = (open) => {
  if (!tree.value) return
  for (const node of tree.value.nodes) {
    if (node.container) expanded[node.path] = open
  }
}

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(t('jsonFormatter.nodeCopied'))
  } catch {
    ElMessage.error(t('jsonFormatter.messages.copyFailed'))
  }
}

const copyValue = (value) => {
  const container = value !== null && typeof value === 'object'
  const text = container ? JSON.stringify(value, null, 2) : typeof value === 'string' ? value : String(value)
  return copyText(text)
}

const copyAll = () => {
  if (!parsed.value.ok) return
  return copyText(JSON.stringify(parsed.value.value, null, 2))
}

provide('jsonTreeState', { isExpanded, toggle, copyValue })
</script>

<style scoped>
.json-tree-pane { animation: tree-in .22s ease both; }
@keyframes tree-in { from { opacity: 0; } to { opacity: 1; } }

@media (min-width: 768px) {
  .json-tree-pane { width: var(--tree-width, 360px); }
}

.json-tree-header { background: linear-gradient(180deg, #fff, transparent); }
:global(.dark) .json-tree-header { background: linear-gradient(180deg, #202e27, transparent); }

.json-tree-live {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #65a30d;
  box-shadow: 0 0 0 3px rgb(101 163 13 / .16);
}
:global(.dark) .json-tree-live { background: #d6f25f; box-shadow: 0 0 0 3px rgb(214 242 95 / .16), 0 0 8px rgb(214 242 95 / .5); }

.json-tree-count {
  border: 1px solid #dfe6e2;
  border-radius: 999px;
  padding: 1px 7px;
  background: #fff;
  color: #64748b;
  font: 9px 'DM Mono', monospace;
  letter-spacing: .04em;
}
:global(.dark) .json-tree-count { border-color: #3d4f45; background: #202d27; color: #9fb0a6; }

.json-tree-divider { width: 1px; height: 14px; margin: 0 4px; background: #dde5e0; }
:global(.dark) .json-tree-divider { background: #3d4f45; }

.json-tree-tool {
  display: grid;
  place-items: center;
  width: 25px;
  height: 25px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: background-color .15s ease, color .15s ease;
}
.json-tree-tool:hover { background: #e6ece8; color: #0f766e; }
:global(.dark) .json-tree-tool { color: #93a69b; }
:global(.dark) .json-tree-tool:hover { background: #2a3a32; color: #d6f25f; }
.json-tree-tool svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.json-tree-tool--close:hover { background: rgb(225 29 72 / .12); color: #be123c; }
:global(.dark) .json-tree-tool--close:hover { background: rgb(248 113 113 / .14); color: #f78ba4; }

.json-tree-body { scrollbar-width: thin; scrollbar-color: #cbd5d0 transparent; }
:global(.dark) .json-tree-body { scrollbar-color: #3d4f45 transparent; }

.json-tree-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; min-height: 180px; padding: 24px 16px; text-align: center; color: #94a3b8; }
:global(.dark) .json-tree-state { color: #8a9d93; }
.json-tree-state svg { width: 34px; height: 34px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; opacity: .7; }
.json-tree-state p { font-family: 'DM Mono', monospace; font-size: 11px; line-height: 1.6; }
.json-tree-state--invalid { color: #e11d48; }
:global(.dark) .json-tree-state--invalid { color: #f78ba4; }

/* ---- draggable width handle ---- */
.tree-resizer {
  position: absolute;
  top: 0;
  right: -3px;
  bottom: 0;
  z-index: 5;
  width: 7px;
  cursor: col-resize;
  touch-action: none;
  outline: none;
}
.tree-resizer::before {
  content: '';
  position: absolute;
  inset: 0 3px;
  background: transparent;
  transition: background-color .15s ease;
}
.tree-resizer:hover::before,
.tree-resizer:focus-visible::before,
.tree-resizer.is-resizing::before { background: rgb(15 118 110 / .45); }
:global(.dark) .tree-resizer:hover::before,
:global(.dark) .tree-resizer:focus-visible::before,
:global(.dark) .tree-resizer.is-resizing::before { background: rgb(214 242 95 / .5); }

.tree-resizer-grip {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3px;
  height: 26px;
  border-radius: 3px;
  background: #b9c7c1;
  transform: translate(-50%, -50%);
  transition: background-color .15s ease, height .15s ease;
}
.tree-resizer:hover .tree-resizer-grip,
.tree-resizer:focus-visible .tree-resizer-grip { height: 40px; background: #0f766e; }
:global(.dark) .tree-resizer-grip { background: #465b4f; }
:global(.dark) .tree-resizer:hover .tree-resizer-grip,
:global(.dark) .tree-resizer:focus-visible .tree-resizer-grip { background: #d6f25f; }
</style>
