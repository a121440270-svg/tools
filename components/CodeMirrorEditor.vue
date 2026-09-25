<template>
  <div ref="editorHost" class="codemirror-host" :class="{ 'is-readonly': readonly }" />
</template>

<script setup lang="ts">
import { basicSetup } from 'codemirror'
import { EditorState, Compartment, RangeSetBuilder } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, rectangularSelection, crosshairCursor, Decoration } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { indentOnInput, bracketMatching, syntaxHighlighting, defaultHighlightStyle, LanguageSupport } from '@codemirror/language'
import { search, searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'
import { yaml } from '@codemirror/lang-yaml'
import { oneDark } from '@codemirror/theme-one-dark'

interface DiffRange {
  startLine: number
  endLine: number
  type: 'added' | 'removed' | 'modified'
}

const props = withDefaults(defineProps<{ modelValue: string; language?: string; readonly?: boolean; theme?: 'dark' | 'light'; diffRanges?: DiffRange[] }>(), {
  language: 'text',
  readonly: false,
  theme: 'dark',
  diffRanges: () => []
})
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const editorHost = ref<HTMLElement | null>(null)
let view: EditorView | null = null
const languageCompartment = new Compartment()
const readonlyCompartment = new Compartment()
const themeCompartment = new Compartment()
const diffCompartment = new Compartment()

const editorTheme = EditorView.theme({
  '&': { height: '100%', backgroundColor: '#202a27', color: '#e4f0d5' },
  '.cm-scroller': { overflow: 'auto', fontFamily: 'DM Mono, monospace', fontSize: '13px', lineHeight: '1.7' },
  '.cm-content': { padding: '24px 0', minHeight: '100%' },
  '.cm-line': { padding: '0' },
  '.cm-gutters': { backgroundColor: '#202a27', color: '#68766f', border: 'none', paddingLeft: '4px', minWidth: '36px' },
  '.cm-gutterElement': { padding: '0 6px' },
  '.cm-activeLineGutter': { backgroundColor: '#2c3934', color: '#d6f25f' },
  '.cm-activeLine': { backgroundColor: '#25312d' },
  '.cm-selectionBackground, ::selection': { backgroundColor: '#536b4b !important' },
  '.cm-cursor': { borderLeftColor: '#d6f25f' }
}, { dark: true })

const lightEditorTheme = EditorView.theme({
  '&': { height: '100%', backgroundColor: '#ffffff', color: '#17211f' },
  '.cm-scroller': { overflow: 'auto', fontFamily: 'DM Mono, monospace', fontSize: '13px', lineHeight: '1.7' },
  '.cm-content': { padding: '24px 0', minHeight: '100%' },
  '.cm-line': { padding: '0' },
  '.cm-gutters': { backgroundColor: '#f1f5f2', color: '#71807b', border: 'none', paddingLeft: '4px', minWidth: '36px' },
  '.cm-gutterElement': { padding: '0 6px' },
  '.cm-activeLineGutter': { backgroundColor: '#dfe8d3', color: '#17211f' },
  '.cm-activeLine': { backgroundColor: '#f3f7f1' },
  '.cm-selectionBackground, ::selection': { backgroundColor: '#c8dcaa !important' },
  '.cm-cursor': { borderLeftColor: '#17211f' }
})

const diffTheme = EditorView.baseTheme({
  '.cm-diff-added': { backgroundColor: 'rgba(34, 197, 94, 0.18)', boxShadow: 'inset 0 0 0 1px rgba(34, 197, 94, 0.45)' },
  '.cm-diff-removed': { backgroundColor: 'rgba(239, 68, 68, 0.14)', boxShadow: 'inset 0 0 0 1px rgba(239, 68, 68, 0.42)' },
  '.cm-diff-modified': { backgroundColor: 'rgba(59, 130, 246, 0.14)', boxShadow: 'inset 0 0 0 1px rgba(59, 130, 246, 0.42)' }
})

function getLanguageSupport(language: string): LanguageSupport | [] {
  if (language === 'json') return json()
  if (language === 'yaml') return yaml()
  if (language === 'markdown') return markdown()
  if (language === 'javascript' || language === 'typescript') return javascript({ typescript: language === 'typescript' })
  return []
}

function createDiffDecorations() {
  return EditorView.decorations.of((view) => {
    const builder = new RangeSetBuilder<ReturnType<typeof Decoration.mark>>()
    const doc = view.state.doc

    const decorations = props.diffRanges.map(range => {
      const startLine = Math.max(1, Math.min(range.startLine + 1, doc.lines))
      const endLine = Math.max(startLine, Math.min(range.endLine + 1, doc.lines))
      return {
        range,
        start: doc.line(startLine).from,
        end: doc.line(endLine).to
      }
    }).sort((left, right) => left.start - right.start || left.end - right.end)

    for (const { range, start, end } of decorations) {
      builder.add(start, end, Decoration.mark({ class: `cm-diff-${range.type}` }))
    }

    return builder.finish()
  })
}

function editorExtensions() {
  return [
    basicSetup,
    lineNumbers(),
    history(),
    drawSelection(),
    rectangularSelection(),
    crosshairCursor(),
    indentOnInput(),
    bracketMatching(),
    highlightActiveLine(),
    highlightActiveLineGutter(),
    highlightSelectionMatches(),
    search({ top: true }),
    autocompletion(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap, ...completionKeymap, indentWithTab]),
    diffTheme,
    themeCompartment.of(props.theme === 'dark' ? [oneDark, editorTheme] : lightEditorTheme),
    languageCompartment.of(getLanguageSupport(props.language)),
    diffCompartment.of(createDiffDecorations()),
    readonlyCompartment.of(EditorState.readOnly.of(props.readonly)),
    EditorView.updateListener.of(update => {
      if (update.docChanged) emit('update:modelValue', update.state.doc.toString())
    })
  ]
}

watch(() => props.language, language => {
  if (view) view.dispatch({ effects: languageCompartment.reconfigure(getLanguageSupport(language)) })
})
watch(() => props.readonly, readonly => {
  if (view) view.dispatch({ effects: readonlyCompartment.reconfigure(EditorState.readOnly.of(readonly)) })
})
watch(() => props.theme, theme => {
  if (view) view.dispatch({ effects: themeCompartment.reconfigure(theme === 'dark' ? [oneDark, editorTheme] : lightEditorTheme) })
})
watch(() => props.diffRanges, () => {
  if (view) view.dispatch({ effects: diffCompartment.reconfigure(createDiffDecorations()) })
}, { deep: true })
watch(() => props.modelValue, value => {
  if (!view || value === view.state.doc.toString()) return
  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } })
})

onMounted(() => {
  if (!editorHost.value) return
  view = new EditorView({ state: EditorState.create({ doc: props.modelValue, extensions: editorExtensions() }), parent: editorHost.value })
})
onBeforeUnmount(() => {
  view?.destroy()
  view = null
})
</script>
