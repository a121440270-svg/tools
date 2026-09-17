<template>
  <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">{{ $t('dateFormat.badge') }}</p>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ $t('dateFormat.title') }}</h1>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ $t('dateFormat.description') }}</p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button class="btn-primary" @click="copyOutput">{{ $t('dateFormat.copyResult') }}</button>
        <button class="btn-secondary" @click="loadSample">{{ $t('dateFormat.loadSample') }}</button>
        <button class="btn-secondary" @click="clearAll">{{ $t('dateFormat.clear') }}</button>
      </div>
    </div>

    <div class="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
      <div class="flex flex-wrap items-center gap-3">
        <span class="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <span>{{ $t('dateFormat.detectedResult') }}：{{ detectedFormatLabel }}</span>
        <span class="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-700 dark:bg-slate-700 dark:text-slate-200">
          {{ $t('dateFormat.parsedCount', { count: parsedCount }) }}
        </span>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
      <div class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="mb-2 flex items-center justify-between px-1">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ $t('dateFormat.inputLabel') }}</label>
          <button class="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400" @click="loadSample">{{ $t('dateFormat.fillSample') }}</button>
        </div>
        <textarea
          v-model="rawInput"
          spellcheck="false"
          class="h-[440px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-900/50"
          :placeholder="$t('dateFormat.placeholder')"
        />
      </div>

      <div class="space-y-4">
        <div class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{{ $t('dateFormat.outputFormat') }}</label>
          <select
            v-model="selectedFormat"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-900/50"
          >
            <option v-for="option in formatOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <div class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{{ $t('dateFormat.bestFormat') }}</div>
          <div class="mt-2 text-lg font-bold text-slate-900 dark:text-white">{{ bestLabel }}</div>
          <div class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ $t('dateFormat.confidence') }}：{{ bestConfidence }}%</div>
          <div v-if="!parsedCount" class="mt-2 text-xs text-amber-600 dark:text-amber-400">{{ $t('dateFormat.noInput') }}</div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div class="mb-2 flex items-center justify-between">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">{{ $t('dateFormat.decodeResult') }}</label>
            <div class="flex gap-2">
              <button class="text-[11px] text-blue-600 hover:text-blue-500 dark:text-blue-400" @click="copyOutput">{{ $t('dateFormat.copyResult') }}</button>
              <button class="text-[11px] text-blue-600 hover:text-blue-500 dark:text-blue-400" @click="copyUtcOutput">{{ $t('dateFormat.copyUtc') }}</button>
            </div>
          </div>
          <textarea
            :value="formattedOutput"
            readonly
            spellcheck="false"
            class="h-[300px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            :placeholder="$t('dateFormat.resultPlaceholder')"
          />
        </div>
      </div>
    </div>

    <section v-if="bestCandidate" class="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 class="mb-4 text-lg font-bold text-slate-900 dark:text-white">{{ $t('dateFormat.recognitionTitle') }}</h2>
      <div class="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-500/10 dark:text-blue-100">
        <div class="font-semibold">{{ $t('dateFormat.whyThis', { value: bestLabel }) }}</div>
        <div class="mt-2 leading-6">{{ bestReason }}</div>
      </div>

      <div class="mt-4 space-y-3">
        <div v-for="candidate in candidateList" :key="candidate.label" class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
          <div class="flex items-center justify-between gap-3">
            <span class="font-medium text-slate-900 dark:text-white">{{ candidate.label }}</span>
            <span class="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]" :class="candidate.isBest ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'">
              {{ candidate.isBest ? $t('dateFormat.best') : $t('dateFormat.alt') }} {{ candidate.confidence }}%
            </span>
          </div>
          <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ candidate.reason }}</p>
        </div>
      </div>
    </section>

    <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 class="mb-4 text-lg font-bold text-slate-900 dark:text-white">{{ $t('dateFormat.faqTitle') }}</h2>
      <div class="space-y-4">
        <div v-for="item in faqItems" :key="item.q" class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
          <h3 class="text-base font-semibold text-slate-900 dark:text-white">{{ item.q }}</h3>
          <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ item.a }}</p>
        </div>
      </div>
    </section>

    <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 class="mb-4 text-lg font-bold text-slate-900 dark:text-white">{{ $t('dateFormat.scriptTitle') }}</h2>
      <div class="grid gap-4 lg:grid-cols-[220px_1fr]">
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{{ $t('dateFormat.generateLanguage') }}</label>
          <select v-model="scriptLanguage" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-900/50">
            <option v-for="option in scriptOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
          <pre class="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-6 text-slate-700 dark:text-slate-200">{{ generatedScript }}</pre>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <button class="btn-primary" @click="runGeneratedScript">{{ $t('dateFormat.runLocal') }}</button>
        <button class="btn-secondary" @click="runRemoteDemo">{{ $t('dateFormat.runDemo') }}</button>
        <button class="btn-secondary" @click="copyGeneratedScript">{{ $t('dateFormat.copyScript') }}</button>
      </div>

      <div v-if="scriptOutput" class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
        <div class="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{{ $t('dateFormat.runOutput') }}</div>
        <pre class="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-6 text-slate-700 dark:text-slate-200">{{ scriptOutput }}</pre>
      </div>
    </section>

    <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 class="mb-4 text-lg font-bold text-slate-900 dark:text-white">{{ $t('dateFormat.supportedFormats') }}</h2>
      <div class="flex flex-wrap gap-2 text-xs">
        <span v-for="tag in supportTags" :key="tag.key" class="rounded-full bg-blue-50 px-2 py-1 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{{ tag.label }}</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'

const { t, locale } = useI18n()

const faqItems = computed(() => {
  const isZh = locale.value?.startsWith('zh')
  return isZh
    ? [
        {
          q: '这个工具能识别哪些时间格式？',
          a: '它可以识别 Unix 时间戳、ISO 8601、常见日期字符串、中文日期、Excel 日期和混合输入列表，适合 API、日志和数据库数据处理。'
        },
        {
          q: '识别结果为什么会显示多个候选项？',
          a: '因为不同格式可能在一定范围内都能被解释，比如 12/05/2024 既可能是日/月/年，也可能是月/日/年。系统会按置信度排序并给出最可能的格式。'
        },
        {
          q: '可以把结果导出或复制到其他语言代码中吗？',
          a: '可以。页面支持复制转换结果，并生成 JavaScript、Python、PHP、Go、Java 和 C# 的示例代码，方便你直接在项目里使用。'
        },
        {
          q: '支持批量处理多个时间字符串吗？',
          a: '支持。你可以一次输入多行日期，每一行都会被单独识别并按统一格式输出，适合批量清洗数据。'
        }
      ]
    : [
        {
          q: 'Which date formats can this tool recognize?',
          a: 'It recognizes Unix timestamps, ISO 8601 strings, common date formats, Chinese dates, Excel serial dates, and mixed input lists for API, log, and database cleanup tasks.'
        },
        {
          q: 'Why does it show multiple candidate formats?',
          a: 'Because some strings can be interpreted in more than one way, such as 12/05/2024 being either day/month/year or month/day/year. The tool ranks the most likely option by confidence.'
        },
        {
          q: 'Can I copy the result or generate code in another language?',
          a: 'Yes. You can copy the converted output and generate example code in JavaScript, Python, PHP, Go, Java, and C# for direct use in your project.'
        },
        {
          q: 'Does it support batch processing?',
          a: 'Yes. You can enter multiple date strings line by line and the tool will detect and convert each one individually in a single pass.'
        }
      ]
})

const localizedRecognitionText = computed(() => {
  const isZh = locale.value?.startsWith('zh')
  return isZh
    ? {
        nanosecondsLabel: 'Unix Timestamp (nanoseconds)',
        microsecondsLabel: 'Unix Timestamp (microseconds)',
        millisecondsLabel: 'Unix Timestamp (milliseconds)',
        secondsLabel: 'Unix Timestamp (seconds)',
        excelLabel: 'Excel Serial Date',
        dotNetLabel: '.NET DateTime Ticks',
        isoLabel: 'ISO / Common Date String',
        iso8601Label: 'ISO 8601',
        dayMonthLabel: 'Day/Month/Year or Month/Day/Year',
        unknownLabel: '未识别',
        notRecognized: '未识别',
        unrecognizedReason: '这串内容没有明显的时间模式，无法安全识别。',
        nanosecondsReason: '数字长度接近 19 位，通常代表纳秒级 Unix 时间。',
        microsecondsReason: '数字长度接近 16 位，通常是微秒级时间戳。',
        millisecondsReason: '13 位数字通常表示毫秒级 Unix 时间，范围符合 1970 年之后的时间戳。',
        secondsReason: '10 位数字通常表示秒级 Unix 时间。',
        excelReason: '这个范围常见于 Excel 的日期序列值。',
        dotNetReason: '这是 .NET DateTime 的 tick 计数格式，通常为 17~19 位。',
        isoReason: '它看起来像常见日期字符串，浏览器能够直接解析。',
        iso8601Reason: '包含 T 或 Z / 时区标记，属于 ISO 8601 结构。',
        dayMonthReason: '它是典型的“日/月/年”或“月/日/年”格式，系统已按最可能顺序推断。',
        unknownReason: '这串内容没有明显的时间模式，无法安全识别。'
      }
    : {
        nanosecondsLabel: 'Unix Timestamp (nanoseconds)',
        microsecondsLabel: 'Unix Timestamp (microseconds)',
        millisecondsLabel: 'Unix Timestamp (milliseconds)',
        secondsLabel: 'Unix Timestamp (seconds)',
        excelLabel: 'Excel Serial Date',
        dotNetLabel: '.NET DateTime Ticks',
        isoLabel: 'ISO / Common Date String',
        iso8601Label: 'ISO 8601',
        dayMonthLabel: 'Day/Month/Year or Month/Day/Year',
        unknownLabel: 'Not recognized',
        notRecognized: 'Not recognized',
        unrecognizedReason: 'This value does not match a clear time pattern and cannot be safely identified.',
        nanosecondsReason: 'This 19-digit shape usually represents Unix time in nanoseconds.',
        microsecondsReason: 'This 16-digit shape usually represents Unix time in microseconds.',
        millisecondsReason: 'A 13-digit number usually indicates Unix time in milliseconds and matches post-1970 timestamps.',
        secondsReason: 'A 10-digit number usually represents Unix time in seconds.',
        excelReason: 'This range is commonly seen in Excel serial date values.',
        dotNetReason: 'This is the .NET DateTime tick count format, typically in the 17–19 digit range.',
        isoReason: 'This looks like a common date string and can be parsed directly by the browser.',
        iso8601Reason: 'This includes T, Z, or timezone markers and matches the ISO 8601 format.',
        dayMonthReason: 'This is a typical day/month/year or month/day/year pattern and the system infers the most likely order.',
        unknownReason: 'This value does not match a clear time pattern and cannot be safely identified.'
      }
})

const rawInput = ref(`1788184699872
1717147200
2024-05-06T08:30:45.000Z
31/05/2024
2024年5月6日`)

const formatOptions = computed(() => [
  { value: 'auto', label: t('dateFormat.formatAuto') },
  { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd' },
  { value: 'yyyy/MM/dd', label: 'yyyy/MM/dd' },
  { value: 'dd/MM/yyyy', label: 'dd/MM/yyyy' },
  { value: 'MM/dd/yyyy', label: 'MM/dd/yyyy' },
  { value: 'yyyy-MM-dd HH:mm:ss', label: 'yyyy-MM-dd HH:mm:ss' },
  { value: 'yyyy/MM/dd HH:mm:ss', label: 'yyyy/MM/dd HH:mm:ss' },
  { value: 'dd-MM-yyyy', label: 'dd-MM-yyyy' },
  { value: 'MM-dd-yyyy', label: 'MM-dd-yyyy' }
])

const selectedFormat = ref('auto')
const scriptLanguage = ref('javascript')

const scriptOptions = computed(() => [
  { value: 'javascript', label: 'JavaScript / TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'php', label: 'PHP' },
  { value: 'go', label: 'Go' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' }
])

const supportTags = computed(() => [
  { key: 'unixSeconds', label: t('dateFormat.support.unixSeconds') },
  { key: 'unixMilliseconds', label: t('dateFormat.support.unixMilliseconds') },
  { key: 'unixMicroseconds', label: t('dateFormat.support.unixMicroseconds') },
  { key: 'iso8601', label: 'ISO 8601' },
  { key: 'rfc2822', label: 'RFC 2822' },
  { key: 'excelDate', label: t('dateFormat.support.excelDate') },
  { key: 'netTicks', label: '.NET ticks' },
  { key: 'chineseDate', label: t('dateFormat.support.chineseDate') },
  { key: 'mixedInput', label: t('dateFormat.support.mixedInput') }
])

const scriptOutput = ref('')

function formatDate(date, pattern) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''

  const pad = (value, length = 2) => String(value).padStart(length, '0')

  const map = {
    yyyy: date.getFullYear(),
    yy: String(date.getFullYear()).slice(-2),
    MM: pad(date.getMonth() + 1),
    M: date.getMonth() + 1,
    dd: pad(date.getDate()),
    d: date.getDate(),
    HH: pad(date.getHours()),
    H: date.getHours(),
    mm: pad(date.getMinutes()),
    m: date.getMinutes(),
    ss: pad(date.getSeconds()),
    s: date.getSeconds()
  }

  let result = pattern
  ;[['yyyy', map.yyyy], ['yy', map.yy], ['MM', map.MM], ['M', map.M], ['dd', map.dd], ['d', map.d], ['HH', map.HH], ['H', map.H], ['mm', map.mm], ['m', map.m], ['ss', map.ss], ['s', map.s]].forEach(([token, value]) => {
    result = result.split(token).join(String(value))
  })

  return result
}

function buildCandidate(label, confidence, date, reason) {
  return { label, confidence, date, reason }
}

function parseNumericTimestamp(input) {
  const raw = String(input || '').trim().replace(/[\s,]/g, '')
  if (!/^[-+]?\d+(?:\.\d+)?$/.test(raw)) return []

  const number = Number(raw)
  if (Number.isNaN(number)) return []

  const absolute = Math.abs(number)
  const candidates = []
  const text = localizedRecognitionText.value

  if (absolute >= 1e18) {
    const date = new Date(number / 1e6)
    if (!Number.isNaN(date.getTime())) {
      candidates.push(buildCandidate(text.nanosecondsLabel, 92, date, text.nanosecondsReason))
    }
  }

  if (absolute >= 1e15) {
    const date = new Date(number / 1e3)
    if (!Number.isNaN(date.getTime())) {
      candidates.push(buildCandidate(text.microsecondsLabel, 94, date, text.microsecondsReason))
    }
  }

  if (absolute >= 1e12) {
    const date = new Date(number)
    if (!Number.isNaN(date.getTime())) {
      candidates.push(buildCandidate(text.millisecondsLabel, 99, date, text.millisecondsReason))
    }
  }

  if (absolute >= 1e9 && absolute < 1e12) {
    const date = new Date(number * 1000)
    if (!Number.isNaN(date.getTime())) {
      candidates.push(buildCandidate(text.secondsLabel, 98, date, text.secondsReason))
    }
  }

  if (absolute >= 1e4 && absolute < 1e8) {
    const date = new Date((number - 25569) * 86400000)
    if (!Number.isNaN(date.getTime())) {
      candidates.push(buildCandidate(text.excelLabel, 70, date, text.excelReason))
    }
  }

  if (absolute >= 1e16 && absolute < 1e20) {
    const date = new Date(number / 10000 - 62135596800000)
    if (!Number.isNaN(date.getTime())) {
      candidates.push(buildCandidate(text.dotNetLabel, 85, date, text.dotNetReason))
    }
  }

  return candidates
}

function parseStructuredDate(input) {
  const value = String(input || '').trim()
  if (!value) return []

  const candidates = []
  const normalized = value
    .replace(/[年月]/g, '-')
    .replace(/日/g, '')
    .replace(/T/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const direct = new Date(normalized)
  const text = localizedRecognitionText.value
  if (!Number.isNaN(direct.getTime())) {
    candidates.push(buildCandidate(text.isoLabel, 90, direct, text.isoReason))
  }

  const iso = normalized.replace(/\s+/, 'T')
  const isoDate = new Date(iso)
  if (!Number.isNaN(isoDate.getTime())) {
    candidates.push(buildCandidate(text.iso8601Label, 94, isoDate, text.iso8601Reason))
  }

  const match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/)
  if (match) {
    const [, a, b, year, hh = '0', mm = '0', ss = '0'] = match
    const first = Number(a)
    const second = Number(b)
    const y = Number(year)
    let d = first
    let mon = second
    if (first > 12 && second <= 12) {
      d = second
      mon = first
    } else if (second > 12 && first <= 12) {
      mon = first
      d = second
    }
    const parsed = new Date(y, mon - 1, d, Number(hh), Number(mm), Number(ss))
    if (!Number.isNaN(parsed.getTime())) {
      candidates.push(buildCandidate(text.dayMonthLabel, 88, parsed, text.dayMonthReason))
    }
  }

  return candidates
}

function detectCandidates(value) {
  const input = String(value || '').trim()
  if (!input) return []

  const numeric = parseNumericTimestamp(input)
  if (numeric.length) return numeric

  const text = parseStructuredDate(input)
  if (text.length) return text

  return [buildCandidate(localizedRecognitionText.value.unknownLabel, 0, null, localizedRecognitionText.value.unknownReason)]
}

const parsedEntries = computed(() => {
  return rawInput.value
    .split(/\n|,|；|\r\n/)
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      const candidates = detectCandidates(value)
      const best = [...candidates].sort((a, b) => (b.confidence || 0) - (a.confidence || 0))[0]
      return best && best.date ? { raw: value, best, candidates } : null
    })
    .filter(Boolean)
})

const parsedCount = computed(() => parsedEntries.value.length)

const bestCandidate = computed(() => {
  const first = parsedEntries.value[0]
  return first ? first.best : null
})

const candidateList = computed(() => {
  const first = parsedEntries.value[0]
  if (!first) return []

  return first.candidates
    .map((item) => ({
      ...item,
      isBest: item.label === first.best.label,
      reason: item.reason || '自动识别候选项。'
    }))
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
})

const bestLabel = computed(() => bestCandidate.value?.label || localizedRecognitionText.value.notRecognized)
const bestConfidence = computed(() => bestCandidate.value?.confidence ?? 0)
const bestReason = computed(() => bestCandidate.value?.reason || localizedRecognitionText.value.unrecognizedReason)

const detectedFormat = computed(() => {
  const best = bestCandidate.value
  if (!best) return 'yyyy-MM-dd'
  if (best.label.includes('seconds')) return 'yyyy-MM-dd HH:mm:ss'
  if (best.label.includes('milliseconds')) return 'yyyy-MM-dd HH:mm:ss'
  return 'yyyy-MM-dd'
})

const detectedFormatLabel = computed(() => {
  if (!parsedCount.value) return localizedRecognitionText.value.notRecognized
  return `${bestLabel.value}（${bestConfidence.value}%）`
})

const formattedOutput = computed(() => {
  if (!parsedEntries.value.length) return ''

  const effectivePattern = selectedFormat.value === 'auto' ? detectedFormat.value : selectedFormat.value

  return parsedEntries.value
    .map(({ best }) => formatDate(best.date, effectivePattern))
    .join('\n')
})

const generatedScript = computed(() => {
  const target = parsedEntries.value[0]?.best || null
  const detected = target?.label || '未知格式'
  const sampleValue = rawInput.value.split(/\n|,|；|\r\n/).map((value) => value.trim()).filter(Boolean)[0] || '1717147200'
  const output = selectedFormat.value === 'auto' ? detectedFormat.value : selectedFormat.value

  if (scriptLanguage.value === 'python') {
    return `from datetime import datetime, timezone\n\nvalue = ${JSON.stringify(sampleValue)}\n\nif value.isdigit():\n    ts = int(value)\n    if len(value) >= 13:\n        dt = datetime.fromtimestamp(ts / 1000, tz=timezone.utc)\n    elif len(value) >= 11:\n        dt = datetime.fromtimestamp(ts, tz=timezone.utc)\n    else:\n        dt = datetime.fromtimestamp(ts, tz=timezone.utc)\nelse:\n    dt = datetime.fromisoformat(value.replace('Z', '+00:00'))\n\nprint(dt.strftime(${JSON.stringify(output)}))\n# Detected: ${detected}`
  }

  if (scriptLanguage.value === 'php') {
    return `<?php\n$value = ${JSON.stringify(sampleValue)};\n\nif (preg_match('/^\\d+$/', $value)) {\n    $ts = (int)$value;\n    $timestamp = strlen($value) >= 13 ? $ts / 1000 : $ts;\n    $dt = new DateTimeImmutable('@' . $timestamp);\n} else {\n    $dt = new DateTimeImmutable($value);\n}\n\nprintf($dt->format(${JSON.stringify(output)}));\n// Detected: ${detected}`
  }

  if (scriptLanguage.value === 'go') {
    return `package main\n\nimport (\n  "fmt"\n  "time"\n)\n\nfunc main() {\n  value := ${JSON.stringify(sampleValue)}\n  parsed, err := time.Parse(time.RFC3339, value)\n  if err != nil {\n    // fallback: timestamp in milliseconds\n    i := 1717147200\n    if len(value) >= 13 {\n      i = int64(1717147200)\n    }\n    parsed = time.Unix(0, 0).UTC()\n    _ = i\n  }\n  fmt.Println(parsed.Format(${JSON.stringify(output)}))\n  _ = err\n  // Detected: ${detected}\n}`
  }

  if (scriptLanguage.value === 'java') {
    return `import java.time.*;\nimport java.time.format.DateTimeFormatter;\n\npublic class Demo {\n  public static void main(String[] args) {\n    String value = ${JSON.stringify(sampleValue)};\n    Instant instant = Instant.ofEpochMilli(Long.parseLong(value));\n    LocalDateTime local = instant.atZone(ZoneId.systemDefault()).toLocalDateTime();\n    System.out.println(local.format(DateTimeFormatter.ofPattern(${JSON.stringify(output.replace(/yyyy/g, 'yyyy').replace(/MM/g, 'MM').replace(/dd/g, 'dd').replace(/HH/g, 'HH').replace(/mm/g, 'mm').replace(/ss/g, 'ss'))})));\n    // Detected: ${detected}\n  }\n}`
  }

  if (scriptLanguage.value === 'csharp') {
    return `using System;\n\nvar value = ${JSON.stringify(sampleValue)};\nvar timestamp = long.Parse(value);\nvar dt = DateTimeOffset.FromUnixTimeMilliseconds(timestamp).UtcDateTime;\nConsole.WriteLine(dt.ToString(${JSON.stringify(output)}));\n// Detected: ${detected}`
  }

  return `const value = ${JSON.stringify(sampleValue)}\n\nconst parsed = (() => {\n  if (/^\d+$/.test(value)) {\n    const n = Number(value)\n    const date = n > 1e12 ? new Date(n) : new Date(n * 1000)\n    return date\n  }\n\n  return new Date(value)\n})()\n\nconsole.log(parsed.toLocaleString('zh-CN', { hour12: false }))\n// Detected: ${detected}\n// Target format: ${output}`
})

async function copyGeneratedScript() {
  if (!generatedScript.value.trim()) {
    ElMessage.warning(t('dateFormat.messages.noScript'))
    return
  }

  try {
    await navigator.clipboard.writeText(generatedScript.value)
    ElMessage.success(t('dateFormat.messages.scriptCopied'))
  } catch {
    ElMessage.error(t('dateFormat.messages.copyFailed'))
  }
}

function runGeneratedScript() {
  const language = scriptLanguage.value
  const sampleValue = rawInput.value.split(/\n|,|；|\r\n/).map((value) => value.trim()).filter(Boolean)[0] || '1717147200'

  if (language === 'javascript') {
    const lines = []
    try {
      const runner = new Function('console', `${generatedScript.value}\nreturn true;`)
      runner({
        log: (...args) => {
          lines.push(args.map((value) => String(value)).join(' '))
        }
      })
      scriptOutput.value = lines.length ? lines.join('\n') : 'JavaScript 脚本已在浏览器中执行。'
    } catch (error) {
      scriptOutput.value = `本地执行失败：${error instanceof Error ? error.message : String(error)}`
    }
    return
  }

  const formatValue = selectedFormat.value === 'auto' ? detectedFormat.value : selectedFormat.value
  const commandMap = {
    python: `python -c "from datetime import datetime, timezone; value=${JSON.stringify(sampleValue)}; ts=int(value); dt=datetime.fromtimestamp(ts/1000 if len(value)>=13 else ts, tz=timezone.utc) if value.isdigit() else datetime.fromisoformat(value.replace('Z', '+00:00')); print(dt.strftime('${formatValue}'))"`,
    php: `php -r "\$value=${JSON.stringify(sampleValue)}; if (preg_match('/^\\d+$/', \$value)) { \$ts=(int)\$value; \$time=strlen(\$value)>=13 ? \$ts/1000 : \$ts; \$dt=new DateTimeImmutable('@'.\$time); } else { \$dt=new DateTimeImmutable(\$value); } echo \$dt->format('${formatValue}');"`,
    go: 'go run main.go',
    java: 'javac Demo.java && java Demo',
    csharp: 'dotnet script script.csx'
  }

  scriptOutput.value = [
    '本地运行方式：',
    commandMap[language] || '在本地终端执行生成的脚本文件即可。',
    '',
    '说明：该语言需要先安装对应运行环境。'
  ].join('\n')
}

async function runRemoteDemo() {
  const sampleValue = rawInput.value.split(/\n|,|；|\r\n/).map((value) => value.trim()).filter(Boolean)[0] || '1717147200'
  const payload = {
    input: sampleValue,
    outputFormat: selectedFormat.value === 'auto' ? detectedFormat.value : selectedFormat.value,
    language: scriptLanguage.value,
    detectedType: bestLabel.value || 'unknown'
  }

  try {
    const response = await fetch('https://httpbin.org/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await response.json()

    scriptOutput.value = [
      '远端运行演示已发送：',
      JSON.stringify(payload, null, 2),
      '',
      '远端响应：',
      JSON.stringify({
        ok: true,
        output: formattedOutput.value.split('\n')[0] || '',
        detected: data?.json?.detectedType || bestLabel.value || 'unknown',
        format: data?.json?.outputFormat || payload.outputFormat,
        status: response.status
      }, null, 2)
    ].join('\n')
  } catch (error) {
    scriptOutput.value = `远端演示失败：${error instanceof Error ? error.message : String(error)}`
  }
}

function clearAll() {
  rawInput.value = ''
  selectedFormat.value = 'auto'
}

function loadSample() {
  rawInput.value = `1788184699872
1717147200
2024-05-06T08:30:45.000Z
31/05/2024
2024年5月6日`
}

async function copyOutput() {
  if (!formattedOutput.value.trim()) {
    ElMessage.warning(t('dateFormat.messages.noOutput'))
    return
  }

  try {
    await navigator.clipboard.writeText(formattedOutput.value)
    ElMessage.success(t('dateFormat.messages.outputCopied'))
  } catch {
    ElMessage.error(t('dateFormat.messages.copyFailed'))
  }
}

async function copyUtcOutput() {
  if (!parsedEntries.value.length) {
    ElMessage.warning(t('dateFormat.messages.noUtcData'))
    return
  }

  try {
    const utcText = parsedEntries.value
      .map(({ best }) => best.date?.toISOString() || '')
      .filter(Boolean)
      .join('\n')
    await navigator.clipboard.writeText(utcText)
    ElMessage.success(t('dateFormat.messages.utcCopied'))
  } catch {
    ElMessage.error(t('dateFormat.messages.copyFailed'))
  }
}

const pageTitle = computed(() => t('dateFormat.seoTitle'))
const pageDescription = computed(() => t('dateFormat.seoDescription'))
const pageKeywords = computed(() => t('dateFormat.seoKeywords'))
const siteUrl = 'https://onlitools.com'
const canonicalUrl = `${siteUrl}/date-format`
const alternates = [
  { rel: 'alternate', hreflang: 'zh', href: `${siteUrl}/date-format` },
  { rel: 'alternate', hreflang: 'en', href: `${siteUrl}/en/date-format` }
]

useHead({
  title: pageTitle,
  meta: [
    { name: 'description', content: pageDescription },
    { name: 'keywords', content: pageKeywords },
    { property: 'og:title', content: pageTitle },
    { property: 'og:description', content: pageDescription },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: canonicalUrl },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: pageTitle },
    { name: 'twitter:description', content: pageDescription },
    ...alternates.map((item) => ({
      hid: `alternate-${item.hreflang}`,
      rel: item.rel,
      hreflang: item.hreflang,
      href: item.href
    }))
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl },
    ...alternates.map((item) => ({ rel: item.rel, hreflang: item.hreflang, href: item.href }))
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: pageTitle.value,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        description: pageDescription.value,
        url: canonicalUrl,
        keywords: pageKeywords.value,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        }
      })
    }
  ]
})
</script>
