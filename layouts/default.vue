<template>
  <!-- 确保根div闭合 -->
  <div class="min-h-screen flex flex-col lg:flex-row" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- 移动端顶部导航栏 -->
    <header
      class="lg:hidden border-b border-slate-200 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85"
    >
      <div class="flex items-center justify-between h-16 px-3">
        <div class="flex items-center gap-1">
          <button
            class="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle sidebar"
            @click="toggleSidebar"
          >
            <MenuIcon class="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>
          <button
            class="flex items-center gap-2.5 rounded-full px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
            @click="navigateTo(localePath('/'))"
          >
            <span
              class="relative flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 font-display text-sm font-bold text-white dark:bg-white dark:text-slate-900"
            >
              O
              <span
                class="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#ff5a2d] ring-2 ring-white dark:ring-slate-900"
              />
            </span>
            <span class="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white"
              >OnliTool</span
            >
          </button>
        </div>

        <div class="flex items-center gap-1">
          <button
            type="button"
            class="flex h-10 items-center justify-center gap-1 rounded-full px-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            :aria-label="$t('menu.recent')"
            @click="openRecentMenu"
          >
            <RecentIcon class="h-4 w-4" />
            <span>{{ $t('menu.recent') }}</span>
          </button>
          <button
            class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            aria-label="Toggle theme"
            @click="toggleTheme"
          >
            <component
              :is="isDark ? SunIcon : MoonIcon"
              class="w-5 h-5"
            />
          </button>
        </div>
      </div>
    </header>

    <!-- 侧边栏   fixed left-0 top-0 h-screen w-64 bg-gray-100 -->
    <aside
      :class="[
        'sidebar-gradient fixed top-0 bottom-0 transition-all duration-300 z-30 overflow-y-auto border-r border-white/10',
        isDesktop
          ? isSidebarCollapsed
            ? 'w-0 left-0 overflow-hidden'
            : 'w-64 left-0'
          : isSidebarOpen
          ? 'w-64 left-0'
          : 'w-64 -left-64',
      ]"
    >
      <div
        class="sidebar-brand py-7 px-6 cursor-pointer"
        @click="navigateTo(localePath('/'))"
      >
        <div class="relative z-10 flex items-center gap-3">
          <span
            class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 font-display text-lg font-bold text-white ring-1 ring-white/15"
          >
            O
            <span class="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[#ff5a2d]" />
          </span>
          <span>
            <span class="block font-display text-xl font-bold leading-none text-white">OnliTool</span>
            <span class="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">{{ $t("menu.desc") }}</span>
          </span>
        </div>
      </div>

      <!-- 工具分类 -->
      <div class="mt-4 pb-10">
        <div v-for="(category, index) in categories" :key="index" class="mb-2">
          <div
            class="sidebar-nav-label"
            @click="toggleCategory(index)"
          >
            <ChevronIcon
              v-if="null == category.path"
              class="w-3.5 h-3.5 shrink-0 transition-transform"
              :class="category.expanded ? 'rotate-90' : ''"
            />
            <span
              v-if="null == category.path"
              class="truncate"
              :title="$t(category.name)"
              >{{ $t(category.name) }}</span
            >
            <NuxtLink
              v-if="null != category.path"
              :key="category.path"
              :to="localePath(category.path)"
              class="sidebar-nav-link"
              :class="{ 'is-active': $route.path === category.path }"
              @click="isDesktop ? null : closeSidebar()"
            >
              <component
                :is="category.icon"
                class="w-5 h-5 shrink-0 text-white/70"
              />
              <span class="truncate" :title="category.name">{{
                $t(category.name)
              }}</span>
            </NuxtLink>
          </div>

          <div
            v-if="category.expanded && null == category.path"
            class="mt-0.5"
          >
            <NuxtLink
              v-for="tool in category.tools"
              :key="tool.path"
              :to="localePath(tool.path)"
              class="sidebar-nav-link is-child"
              :class="{ 'is-active': $route.path === tool.path }"
              @click="isDesktop ? null : closeSidebar()"
            >
              <component :is="tool.icon" class="w-5 h-5 shrink-0 text-white/60" />
              <span class="truncate" :title="$t(tool.name)">{{
                $t(tool.name)
              }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </aside>

    <!-- 遮罩层 - 移动端侧边栏打开时显示 -->
    <div
      v-if="!isDesktop && isSidebarOpen"
      class="fixed inset-0 bg-black/50 z-20"
      @click="closeSidebar"
    ></div>

    <!-- 主内容区 flex-1 transition-all duration-300 lg:ml-64 -->
    <div
      class="flex-1 min-w-0 w-full flex flex-col transition-all duration-300"
      :style="{
        marginLeft:
          isDesktop && !isSidebarCollapsed ? '16rem' : '0',
      }"
    >
      <!-- 桌面端顶部导航栏 -->
      <header
        class="hidden lg:flex h-16 items-center gap-1 px-4 border-b border-slate-200 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85"
      >
        <button
          class="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Toggle sidebar"
          @click="toggleSidebar"
        >
          <MenuIcon class="w-5 h-5" />
        </button>
        <button
          class="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Home"
          @click="navigateTo(localePath('/'))"
        >
          <HomeIcon class="w-5 h-5" />
        </button>
        <button
          type="button"
          class="flex h-10 items-center justify-center gap-1 rounded-full px-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          :aria-label="$t('menu.recent')"
          @click="openRecentMenu"
        >
          <RecentIcon class="h-4 w-4" />
          <span>{{ $t('menu.recent') }}</span>
        </button>
        <form class="flex items-center ml-3 relative" @submit.prevent="submitSearch">
          <SearchIcon class="w-4 h-4 absolute left-3.5 text-slate-400" />
          <input
            v-model="navKeyword"
            type="search"
            :placeholder="$t('search.placeholder')"
            :aria-label="$t('search.placeholder')"
            class="rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 w-72 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />
          <kbd
            class="ml-2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
            >⌘K</kbd
          >
        </form>

        <div class="ml-auto flex items-center gap-2">
          <NuxtLink
            v-if="!user?.id"
            :to="localePath('/auth/login')"
            class="rounded-full px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
          >
            {{ $t("login.submit") }}
          </NuxtLink>

          <NuxtLink
            v-else
            :to="localePath('/profile')"
            class="flex items-center rounded-full px-3 py-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <img :src="user.avatar" class="w-6 h-6 rounded-full mr-2 ring-2 ring-primary/40" />
            <span class="text-sm font-medium text-primary">{{ user.name }}</span>
          </NuxtLink>
          <NuxtLink
            v-if="user?.id"
            @click.prevent="handleLogout"
            to="#"
            class="px-4 py-2 text-sm rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {{ $t("login.out") }}
          </NuxtLink>
          <div class="relative inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="pointer-events-none absolute left-2.5 h-4 w-4 text-slate-400 dark:text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <select
              @change="changeLanguage"
              :value="$i18n.locale"
              class="appearance-none rounded-full border border-slate-200 bg-white py-2 pl-8 pr-3 font-mono text-[11px] uppercase tracking-[0.1em] text-slate-700 outline-none transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option
                v-for="locale in locales"
                :key="locale.code"
                :value="locale.code"
              >
                {{ $t(`locale.${locale.code}`) }}
              </option>
            </select>
          </div>
          <button
            class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white"
            aria-label="Toggle theme"
            @click="toggleTheme"
          >
            <component
              :is="isDark() ? SunIcon : MoonIcon"
              class="w-4 h-4"
            />
          </button>

          <a
            href="#"
            @click="pay"
            class="ml-1 rounded-full bg-[#ff5a2d] px-4 py-2 text-sm font-semibold text-[#14181a] shadow-[0_10px_22px_-14px_rgba(255,90,45,1)] transition hover:-translate-y-0.5 hover:bg-[#ff6d45]"
          >
            {{ $t('layout.support') }} ❤️
          </a>
        </div>
      </header>

      <!-- 内容 -->
      <main
        class="flex-1 p-4 pt-0 md:p-6 md:pt-6"
        :dir="isRtl ? 'rtl' : 'ltr'"
      >
        <slot />
        <ToolContentSection />
      </main>

      <footer
        class="mt-auto border-t border-slate-200/80 bg-gradient-to-b from-white/70 to-slate-50/80 dark:border-slate-800 dark:from-slate-900/70 dark:to-slate-950/80"
        :dir="isRtl ? 'rtl' : 'ltr'"
      >
        <div class="px-4 py-8 md:px-8 md:py-10">
          <div class="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
            <div class="max-w-xs">
              <NuxtLink
                :to="localePath('/')"
                class="inline-flex items-center gap-2.5"
              >
                <span
                  class="relative flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 font-display text-sm font-bold text-white dark:bg-white dark:text-slate-900"
                >
                  O
                  <span
                    class="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#ff5a2d] ring-2 ring-white dark:ring-slate-900"
                  />
                </span>
                <span class="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">OnliTool</span>
              </NuxtLink>
              <p class="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {{ $t('footer.tagline') }}
              </p>
            </div>

            <nav
              class="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium lg:pt-1.5"
              :aria-label="$t('footer.navLabel')"
            >
              <NuxtLink :to="localePath('/about')" class="text-slate-600 transition hover:text-[#ff5a2d] dark:text-slate-300 dark:hover:text-[#ff7a52]">{{ $t('footer.about') }}</NuxtLink>
              <NuxtLink :to="localePath('/blog')" class="text-slate-600 transition hover:text-[#ff5a2d] dark:text-slate-300 dark:hover:text-[#ff7a52]">{{ $t('footer.blog') }}</NuxtLink>
              <NuxtLink :to="localePath('/alternatives')" class="text-slate-600 transition hover:text-[#ff5a2d] dark:text-slate-300 dark:hover:text-[#ff7a52]">{{ $t('menu.alternatives') }}</NuxtLink>
              <NuxtLink :to="localePath('/privacy')" class="text-slate-600 transition hover:text-[#ff5a2d] dark:text-slate-300 dark:hover:text-[#ff7a52]">{{ $t('footer.privacy') }}</NuxtLink>
              <NuxtLink :to="localePath('/terms')" class="text-slate-600 transition hover:text-[#ff5a2d] dark:text-slate-300 dark:hover:text-[#ff7a52]">{{ $t('footer.terms') }}</NuxtLink>
              <NuxtLink :to="localePath('/contact')" class="text-slate-600 transition hover:text-[#ff5a2d] dark:text-slate-300 dark:hover:text-[#ff7a52]">{{ $t('footer.contact') }}</NuxtLink>
            </nav>
          </div>

          <div class="mt-9 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-200/70 pt-5 text-[11px] text-slate-400 dark:border-slate-800/80 dark:text-slate-500 max-[500px]:pb-16">
            <p>© {{ currentYear }} OnliTool. {{ $t('footer.rights') }}</p>
            <span class="hidden h-3 w-px bg-slate-200 dark:bg-slate-700 sm:block" />
            <p class="hidden sm:block">{{ $t('footer.localFirst') }}</p>
          </div>
        </div>
      </footer>
    </div>
    <div
      v-if="recentPages.length && recentMenuMode !== 'closed' && (recentMenuMode !== 'edge-hidden' || recentMenuPeek)"
      class="fixed z-50 w-72 max-w-[calc(100vw-3.5rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      :style="{ left: `${recentMenuPosition.left}px`, top: `${recentMenuPosition.top}px` }"
      :aria-label="$t('menu.recent')"
      @pointerenter="handleRecentMenuPointerEnter"
      @pointerleave="handleRecentMenuPointerLeave"
    >
      <div
        class="flex cursor-move select-none items-center justify-between border-b border-slate-200 px-3 py-2.5 touch-none dark:border-slate-700"
        @pointerdown="startRecentMenuDrag"
        @pointermove="moveRecentMenu"
        @pointerup="stopRecentMenuDrag"
        @pointercancel="stopRecentMenuDrag"
      >
        <h2 class="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          <RecentIcon class="h-4 w-4" />
          {{ $t('menu.recent') }}
        </h2>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            :class="recentMenuEditing ? 'bg-slate-100 text-primary dark:bg-slate-800 dark:text-primary' : 'text-slate-500'"
            :aria-label="$t(recentMenuEditing ? 'menu.recentEditDone' : 'menu.recentEdit')"
            @pointerdown.stop
            @click="recentMenuEditing = !recentMenuEditing"
          >
            <svg aria-hidden="true" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="m16 4 4 4" />
              <path d="M4 20h4l11-11a2.83 2.83 0 0 0-4-4L4 16v4Z" />
            </svg>
          </button>
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            :aria-label="$t('menu.recentCollapse')"
            :title="$t('menu.recentCollapse')"
            @pointerdown.stop
            @click="toggleRecentMenuCollapse"
          >
            <span aria-hidden="true">{{ recentMenuMode === 'collapsed' ? '⌄' : '⌃' }}</span>
          </button>
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            :aria-label="$t('menu.recentEdgeHide')"
            :title="$t('menu.recentEdgeHide')"
            @pointerdown.stop
            @click="hideRecentMenuAtEdge"
          >
            <span aria-hidden="true">→</span>
          </button>
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            :aria-label="$t('menu.recentClose')"
            :title="$t('menu.recentClose')"
            @pointerdown.stop
            @click="closeRecentMenu"
          >
            &times;
          </button>
        </div>
      </div>
      <nav
        v-if="recentMenuMode !== 'collapsed'"
        class="max-h-[60vh] overflow-y-auto p-2"
        :aria-label="$t('menu.recent')"
      >
        <div
          v-for="page in recentPages"
          :key="page.path"
          class="group relative"
        >
          <NuxtLink
            :to="page.path"
            class="block rounded-xl px-3 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            :class="recentMenuEditing ? 'pr-10' : 'pr-3'"
          >
            <span class="block truncate text-sm font-medium text-slate-700 dark:text-slate-200">{{ page.title }}</span>
            <span class="mt-0.5 flex items-center justify-between gap-2 text-xs text-slate-400">
              <span class="min-w-0 truncate">{{ page.path }}</span>
              <span class="shrink-0">{{ $t('menu.recentFrequency', { count: page.count }) }}</span>
            </span>
          </NuxtLink>
          <button
            v-if="recentMenuEditing"
            type="button"
            class="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            :aria-label="$t('menu.recentDelete')"
            @click="removeRecentPage(page.path)"
          >
            <svg aria-hidden="true" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="m19 6-1 14H6L5 6" />
              <path d="M10 11v5m4-5v5" />
            </svg>
          </button>
        </div>
      </nav>
    </div>
    <button
      v-if="recentPages.length && recentMenuMode === 'edge-hidden'"
      type="button"
      class="fixed right-0 z-[51] flex h-12 w-9 items-center justify-center rounded-l-xl border border-r-0 border-slate-200 bg-white text-slate-600 shadow-lg transition hover:w-11 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
      :style="{ top: `${recentMenuPosition.top}px` }"
      :aria-label="$t('menu.recentOpen')"
      :title="$t('menu.recentOpen')"
      @pointerenter="recentMenuPeek = true"
      @pointerleave="handleRecentMenuPointerLeave"
      @click="openRecentMenu"
    >
      <RecentIcon class="h-5 w-5" />
    </button>
    <FeatureRequest />
  </div>
</template>

<script setup>
// Add user state initialization
import { useUser } from "~/composables/useAuth";
const user = useUser();
const { t, locales, setLocale, locale } = useI18n();
import {
  h,
  defineComponent,
  ref,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
} from "vue";
import { useTheme } from "~/composables/useTheme";
import { useLocaleHead, useLocalePath } from "#i18n";
import { markRaw } from "vue";

const localePath = useLocalePath();
const isRtl = computed(() => locale.value === "ar");
const route = useRoute();
const localeHead = useLocaleHead({ seo: { canonicalQueries: [] } });
// Route path without the locale prefix, e.g. `/de/privacy` -> `/privacy`.
const normalizeLocalePath = (path) => path.replace(/^\/(zh|ja|de|fr|ar)(?=\/|$)/, "") || "/";
const isNoIndexRoute = computed(() => {
  const path = normalizeLocalePath(route.path);
  return [
    "/admin",
    "/auth",
    "/profile",
    "/pay",
    "/blog/post",
    "/prompts/public",
    "/shares",
  ].some((prefix) => path === prefix || path.startsWith(`${prefix}/`)) ||
    /^\/prompts\/[^/]+$/.test(path);
});

// Legal pages (privacy/terms/about/contact) and alternatives pages are authored
// inline in English and Chinese only. Locales without real translations should
// not self-canonicalise or broadcast hreflang entries.
const isLegalRoute = computed(() =>
  /^\/(privacy|terms|about|contact)(\/|$)/.test(normalizeLocalePath(route.path))
);
const isAlternativesRoute = computed(() =>
  /^\/alternatives(\/|$)/.test(normalizeLocalePath(route.path))
);
// Fold the legal-page link cluster onto the EN canonical and keep hreflang only
// for the languages the copy actually exists in (EN + ZH).
const legalLinkCluster = (links) => {
  if (!Array.isArray(links) || links.length === 0) return links;
  const alt = (hreflang) =>
    links.find((link) => link.rel === "alternate" && link.hreflang === hreflang)?.href;
  const enHref = alt("en");
  const zhHref = alt("zh-CN") || alt("zh");
  if (!enHref || !zhHref) return links;
  const canonicalHref = locale.value === "zh" ? zhHref : enHref;
  return [
    { rel: "canonical", href: canonicalHref },
    { rel: "alternate", hreflang: "en", href: enHref },
    { rel: "alternate", hreflang: "zh-CN", href: zhHref },
    { rel: "alternate", hreflang: "zh", href: zhHref },
    { rel: "alternate", hreflang: "x-default", href: enHref },
  ];
};

const currentYear = new Date().getFullYear();
const navKeyword = ref("");
const recentPages = ref([]);
const recentMenuMode = ref("closed");
const recentMenuEditing = ref(false);
const recentMenuPeek = ref(false);
const recentMenuPosition = ref({ left: 0, top: 76 });
const recentMenuDrag = ref(null);
const recentPagesStorageKey = "onlitool-recent-pages";
const pageUsageStorageKey = "onlitool-page-usage-v1";
const recentMenuUiStorageKey = "onlitool-recent-menu-ui";
const PAGE_USAGE_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_RECENT_PAGES = 5;
let recentMenuPeekTimer;
let recentUsageRefreshTimer;
let pageUsage = {};
let recentPageOrder = [];

function openRecentMenu() {
  recentMenuMode.value = "open";
  recentMenuPeek.value = false;
  saveRecentMenuUi();
}

function closeRecentMenu() {
  recentMenuMode.value = "closed";
  recentMenuPeek.value = false;
  saveRecentMenuUi();
}

function toggleRecentMenuCollapse() {
  recentMenuMode.value = recentMenuMode.value === "collapsed" ? "open" : "collapsed";
  saveRecentMenuUi();
}

function hideRecentMenuAtEdge() {
  recentMenuMode.value = "edge-hidden";
  recentMenuPeek.value = false;
  saveRecentMenuUi();
}

function handleRecentMenuPointerEnter() {
  if (recentMenuMode.value !== "edge-hidden") return;
  clearTimeout(recentMenuPeekTimer);
  recentMenuPeek.value = true;
}

function handleRecentMenuPointerLeave() {
  if (recentMenuMode.value !== "edge-hidden") return;
  clearTimeout(recentMenuPeekTimer);
  recentMenuPeekTimer = window.setTimeout(() => {
    recentMenuPeek.value = false;
  }, 180);
}

function clampRecentMenuPosition(left, top) {
  const maxLeft = Math.max(8, window.innerWidth - 304);
  const maxTop = Math.max(72, window.innerHeight - 80);
  return {
    left: Math.min(Math.max(8, left), maxLeft),
    top: Math.min(Math.max(72, top), maxTop),
  };
}

function saveRecentMenuUi() {
  try {
    localStorage.setItem(recentMenuUiStorageKey, JSON.stringify({
      mode: recentMenuMode.value,
      position: recentMenuPosition.value,
    }));
  } catch (error) {
    console.warn("Unable to save recent menu settings to local storage.", error);
  }
}

function restoreRecentMenuUi() {
  recentMenuPosition.value = clampRecentMenuPosition(window.innerWidth - 304, 76);
  try {
    const stored = JSON.parse(localStorage.getItem(recentMenuUiStorageKey) || "null");
    if (!stored || typeof stored !== "object") return;
    if (["open", "collapsed", "closed", "edge-hidden"].includes(stored.mode)) {
      recentMenuMode.value = stored.mode;
    }
    if (
      Number.isFinite(stored.position?.left) &&
      Number.isFinite(stored.position?.top)
    ) {
      recentMenuPosition.value = clampRecentMenuPosition(
        stored.position.left,
        stored.position.top
      );
    } else {
      recentMenuPosition.value = clampRecentMenuPosition(
        window.innerWidth - 304,
        76
      );
    }
  } catch (error) {
    console.warn("Unable to restore recent menu settings from local storage.", error);
  }
}

function startRecentMenuDrag(event) {
  if (event.target.closest("button")) return;
  recentMenuDrag.value = {
    pointerId: event.pointerId,
    offsetX: event.clientX - recentMenuPosition.value.left,
    offsetY: event.clientY - recentMenuPosition.value.top,
  };
  event.currentTarget.setPointerCapture(event.pointerId);
}

function moveRecentMenu(event) {
  if (!recentMenuDrag.value || recentMenuDrag.value.pointerId !== event.pointerId) return;
  recentMenuPosition.value = clampRecentMenuPosition(
    event.clientX - recentMenuDrag.value.offsetX,
    event.clientY - recentMenuDrag.value.offsetY
  );
}

function stopRecentMenuDrag(event) {
  if (!recentMenuDrag.value || recentMenuDrag.value.pointerId !== event.pointerId) return;
  recentMenuDrag.value = null;
  saveRecentMenuUi();
}

function restoreRecentPages() {
  try {
    const storedPages = JSON.parse(localStorage.getItem(recentPagesStorageKey) || "[]");
    if (Array.isArray(storedPages)) {
      recentPageOrder = storedPages
        .filter((page) => isValidRecentPage(page))
        .slice(0, MAX_RECENT_PAGES)
        .map((page) => page.path);
    }
  } catch (error) {
    console.warn("Unable to restore recent pages from local storage.", error);
  }

  try {
    const storedUsage = JSON.parse(localStorage.getItem(pageUsageStorageKey) || "null");
    if (storedUsage && typeof storedUsage === "object" && storedUsage.pages && typeof storedUsage.pages === "object") {
      pageUsage = storedUsage.pages;
      if (Array.isArray(storedUsage.order)) {
        recentPageOrder = storedUsage.order.filter((path) => typeof path === "string");
      }
    } else {
      const now = Date.now();
      const legacyPages = JSON.parse(localStorage.getItem(recentPagesStorageKey) || "[]");
      if (Array.isArray(legacyPages)) {
        pageUsage = Object.fromEntries(
          legacyPages
            .filter((page) => isValidRecentPage(page))
            .map((page) => [page.path, { title: page.title, visits: [now] }])
        );
      }
    }
  } catch (error) {
    console.warn("Unable to restore page usage from local storage.", error);
  }
  refreshRecentPages(Date.now(), false);
}

function isValidRecentPage(page) {
  return Boolean(
    page &&
    typeof page.path === "string" &&
    page.path.startsWith("/") &&
    !page.path.startsWith("//") &&
    typeof page.title === "string"
  );
}

function refreshRecentPages(now, save = true) {
  const cutoff = now - PAGE_USAGE_WINDOW_MS;
  for (const [path, entry] of Object.entries(pageUsage)) {
    if (
      !path.startsWith("/") ||
      path.startsWith("//") ||
      !entry ||
      typeof entry !== "object" ||
      typeof entry.title !== "string" ||
      !Array.isArray(entry.visits)
    ) {
      delete pageUsage[path];
      continue;
    }
    entry.visits = entry.visits.filter((timestamp) =>
      Number.isFinite(timestamp) && timestamp > cutoff && timestamp <= now
    );
    if (!entry.visits.length) delete pageUsage[path];
  }

  const rankedPaths = Object.entries(pageUsage)
    .map(([path, entry]) => ({
      path,
      count: entry.visits.length,
      lastVisited: Math.max(...entry.visits),
    }))
    .sort((a, b) => b.count - a.count || b.lastVisited - a.lastVisited)
    .slice(0, MAX_RECENT_PAGES);
  const eligiblePaths = new Set(rankedPaths.map((page) => page.path));
  const retainedOrder = recentPageOrder.filter((path) => eligiblePaths.has(path));
  const entrants = rankedPaths
    .map((page) => page.path)
    .filter((path) => !retainedOrder.includes(path));
  recentPageOrder = [...retainedOrder, ...entrants];
  recentPages.value = recentPageOrder.map((path) => ({
    path,
    title: pageUsage[path].title || path,
    count: pageUsage[path].visits.length,
  }));

  if (!save) return;
  try {
    localStorage.setItem(pageUsageStorageKey, JSON.stringify({
      pages: pageUsage,
      order: recentPageOrder,
    }));
    localStorage.setItem(recentPagesStorageKey, JSON.stringify(recentPages.value));
  } catch (error) {
    console.warn("Unable to save page usage to local storage.", error);
  }
}

function removeRecentPage(path) {
  delete pageUsage[path];
  recentPageOrder = recentPageOrder.filter((recentPath) => recentPath !== path);
  refreshRecentPages(Date.now());
}

function recordRecentPage() {
  if (typeof window === "undefined" || isNoIndexRoute.value) return;
  const path = route.path;
  if (!path || path.startsWith("//")) return;
  const now = Date.now();
  const entry = pageUsage[path] || { title: path, visits: [] };
  entry.title = document.title.trim() || entry.title || path;
  entry.visits = Array.isArray(entry.visits) ? entry.visits : [];
  entry.visits.push(now);
  pageUsage[path] = entry;
  refreshRecentPages(now);
}

watch(
  () => route.path,
  async () => {
    if (typeof window === "undefined") return;
    await nextTick();
    window.setTimeout(recordRecentPage, 0);
  },
  { flush: "post" }
);

function submitSearch() {
  const q = navKeyword.value.trim();
  navigateTo({
    path: localePath("/"),
    query: q ? { q } : undefined,
  });
}

useHead(() => {
  let links = localeHead.value.link || [];
  if (isAlternativesRoute.value) {
    // The page's useToolSeo owns the whole canonical/hreflang cluster here.
    links = [];
  } else if (isLegalRoute.value) {
    links = legalLinkCluster(links);
  }
  const canonicalUrl = links.find((link) => link.rel === "canonical")?.href;

  return {
    htmlAttrs: {
      ...localeHead.value.htmlAttrs,
      dir: isRtl.value ? "rtl" : "ltr",
    },
    link: links,
    meta: [
      // localeHead also emits og:url (self URL); drop it so the canonical-based
      // og:url below is the only one on legal pages and tool pages.
      ...(localeHead.value.meta || []).filter((m) => m.property !== "og:url"),
      { property: "og:site_name", content: "OnliTool" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(canonicalUrl ? [{ property: "og:url", content: canonicalUrl }] : []),
      ...(isNoIndexRoute.value ? [{ name: "robots", content: "noindex, nofollow" }] : []),
    ],
  };
});
// 主题管理
const { theme, toggleTheme, isDark, isLight } = useTheme();

const themeClass = computed(() => (isDark.value ? "dark" : "light"));

// 在根元素上动态添加主题类
onMounted(() => {
  restoreRecentPages();
  restoreRecentMenuUi();
  recordRecentPage();
  recentUsageRefreshTimer = window.setInterval(() => {
    refreshRecentPages(Date.now());
  }, 60_000);
  document.documentElement.classList.add(themeClass.value);
});

watch(themeClass, (newClass, oldClass) => {
  document.documentElement.classList.remove(oldClass);
  document.documentElement.classList.add(newClass);
});
// 侧边栏状态
const isSidebarCollapsed = ref(false);
const isSidebarOpen = ref(false);
const isDesktop = ref(false);
const compactDesktopBreakpoint = 1280;
let viewportInitialized = false;

// 检查是否为桌面视图
const checkViewport = () => {
  const desktop = window.innerWidth >= 1024;
  const wasDesktop = isDesktop.value;
  isDesktop.value = desktop;
  if (desktop) {
    isSidebarOpen.value = false;
    if (!viewportInitialized || !wasDesktop) {
      isSidebarCollapsed.value = window.innerWidth <= compactDesktopBreakpoint;
    }
  }
  viewportInitialized = true;
};

// 切换侧边栏
const toggleSidebar = () => {
  if (isDesktop.value) {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
  } else {
    isSidebarOpen.value = !isSidebarOpen.value;
  }
};

// 关闭侧边栏（移动视图）
const closeSidebar = () => {
  isSidebarOpen.value = false;
};
const changeLanguage = ($event) => {
  setLocale($event.target.value);
};
// 购买咖啡
const pay = ($event) => {
  $fetch("/api/pay").then((res) => {
    if (null != res || null != res.checkout_url) {
      window.location.href = res.checkout_url;
    } else {
      ElMessage.error(
        res.msg ||
          "Unable to initiate the payment at this time. Please try again later."
      );
    }
  });
};

// 初始化时也调用一次
onMounted(() => {
  if (process.env.NODE_ENV === "development") {
    console.log("development");
  } else {
    // let targetProtocol = "https:";
    // let url = window.location.href;
    // let protocol = window.location.protocol;
    // let changed = false;
    // if (protocol != targetProtocol) {
    //   url = targetProtocol + url.substring(protocol.length);
    //   changed = true;
    // }
    // if (url.indexOf("www.onlitools.com") > 0) {
    //   url = url.replace("www.onlitools.com", "onlitools.com");
    //   changed = true;
    // }
    // console.log(url);
    // if (changed) {
    //   window.location.href = url;
    // }
  }
  checkViewport();
  window.addEventListener("resize", checkViewport);
});

onUnmounted(() => {
  window.clearInterval(recentUsageRefreshTimer);
  window.removeEventListener("resize", checkViewport);
});

// 图标组件
const ChevronIcon = defineComponent({
  name: "ChevronIcon",
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        class: this.$attrs.class,
      },
      [h("polyline", { points: "9 18 15 12 9 6" })]
    );
  },
});

const MenuIcon = defineComponent({
  name: "MenuIcon",
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        class: this.$attrs.class,
      },
      [
        h("line", { x1: "3", y1: "12", x2: "21", y2: "12" }),
        h("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
        h("line", { x1: "3", y1: "18", x2: "21", y2: "18" }),
      ]
    );
  },
});

const SearchIcon = defineComponent({
  name: "SearchIcon",
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        class: this.$attrs.class,
      },
      [
        h("circle", { cx: "11", cy: "11", r: "8" }),
        h("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" }),
      ]
    );
  },
});

const SunIcon = defineComponent({
  name: "SunIcon",
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        class: this.$attrs.class,
      },
      [
        h("circle", { cx: "12", cy: "12", r: "5" }),
        h("line", { x1: "12", y1: "1", x2: "12", y2: "3" }),
        h("line", { x1: "12", y1: "21", x2: "12", y2: "23" }),
        h("line", { x1: "4.22", y1: "4.22", x2: "5.64", y2: "5.64" }),
        h("line", { x1: "18.36", y1: "18.36", x2: "19.78", y2: "19.78" }),
        h("line", { x1: "1", y1: "12", x2: "3", y2: "12" }),
        h("line", { x1: "21", y1: "12", x2: "23", y2: "12" }),
        h("line", { x1: "4.22", y1: "19.78", x2: "5.64", y2: "18.36" }),
        h("line", { x1: "18.36", y1: "5.64", x2: "19.78", y2: "4.22" }),
      ]
    );
  },
});
const MoonIcon = defineComponent({
  name: "MoonIcon",
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        class: this.$attrs.class,
      },
      [
        // 更清晰的半月形状
        h("path", { d: "M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" }),
      ]
    );
  },
});

const GithubIcon = defineComponent({
  name: "GithubIcon",
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        class: this.$attrs.class,
      },
      [
        h("path", {
          d: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22",
        }),
      ]
    );
  },
});

const XIcon = defineComponent({
  name: "XIcon",
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        class: this.$attrs.class,
      },
      [h("path", { d: "M18 6L6 18" }), h("path", { d: "M6 6L18 18" })]
    );
  },
});

// 工具图标
const TokenIcon = defineComponent({
  name: "TokenIcon",
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        class: this.$attrs.class,
      },
      [h("polygon", { points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2" })]
    );
  },
});

const HashIcon = defineComponent({
  name: "HashIcon",
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        class: this.$attrs.class,
      },
      [
        h("line", { x1: "4", y1: "9", x2: "20", y2: "9" }),
        h("line", { x1: "4", y1: "15", x2: "20", y2: "15" }),
        h("line", { x1: "10", y1: "3", x2: "8", y2: "21" }),
        h("line", { x1: "16", y1: "3", x2: "14", y2: "21" }),
      ]
    );
  },
});

const DateIcon = defineComponent({
  name: "DateIcon",
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        class: this.$attrs.class,
      },
      [
        h("rect", {
          x: "3",
          y: "4",
          width: "18",
          height: "18",
          rx: "2",
          ry: "2",
        }),
        h("line", { x1: "16", y1: "2", x2: "16", y2: "6" }),
        h("line", { x1: "8", y1: "2", x2: "8", y2: "6" }),
        h("line", { x1: "3", y1: "10", x2: "21", y2: "10" }),
      ]
    );
  },
});
const HomeIcon = defineComponent({
  name: "HomeIcon",
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        class: this.$attrs.class,
      },
      [
        // 房子屋顶
        h("path", { d: "M3 9L12 2L21 9" }),
        // 房子边框
        h("path", { d: "M5 10V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" }),
        // 窗户竖线
        h("line", { x1: "12", y1: "14", x2: "12", y2: "18" }),
        // 窗户横线
        h("line", { x1: "10", y1: "16", x2: "14", y2: "16" }),
      ]
    );
  },
});

const RecentIcon = defineComponent({
  name: "RecentIcon",
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        class: this.$attrs.class,
      },
      [
        h("circle", { cx: "12", cy: "12", r: "9" }),
        h("path", { d: "M12 7v5l3 2" }),
      ]
    );
  },
});

// 新增 FontIcon 组件
const FontIcon = defineComponent({
  name: "FontIcon",
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        class: this.$attrs.class,
      },
      [
        h("path", {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "2",
          d: "M9 17v-2a4 4 0 014-4h4m0 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10a4 4 0 004 4h6a4 4 0 004-4v-4z",
        }),
      ]
    );
  },
});

// 新增 BlogIcon 组件
const BlogIcon = defineComponent({
  name: "BlogIcon",
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        class: this.$attrs.class,
      },
      [
        // 书本/文章样式
        h("path", { d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20" }),
        h("path", { d: "M4 4.5A2.5 2.5 0 0 1 6.5 7H20" }),
        h("rect", { x: "4", y: "2", width: "16", height: "20", rx: "2" }),
        h("line", { x1: "8", y1: "6", x2: "16", y2: "6" }),
        h("line", { x1: "8", y1: "10", x2: "16", y2: "10" }),
        h("line", { x1: "8", y1: "14", x2: "16", y2: "14" }),
      ]
    );
  },
});

// 新增 WebpIcon 组件（与首页一致）
const WebpIcon = defineComponent({
  name: "WebpIcon",
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        class: this.$attrs.class,
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: "2"
      },
      [
        h("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", stroke: "currentColor", fill: "none" }),
        h("circle", { cx: "8.5", cy: "8.5", r: "2.5", stroke: "currentColor", fill: "none" }),
        h("path", { d: "M21 15l-5-5-4 4-7-7", stroke: "currentColor", fill: "none" })
      ]
    );
  }
});

const categories = ref([
      {
    name: "blog.name",
    expanded: true,
    // Make blog a parent group so we can add sub-items like prompts
    path: null,
    icon: markRaw(BlogIcon),
    tools: [
      { name: 'blog.name', path: '/blog', icon: markRaw(BlogIcon) },
      // point the menu to the new frontend prompts page
  { name: 'prompts.name', path: '/prompts', icon: markRaw(TokenIcon) }
    ]
  },
  {
    name: "menu.filetype",
    expanded: true,
    tools: [
      { name: "menu.ttf", path: "/font-compress", icon: markRaw(FontIcon) },
      { name: "menu.ttfToWoff2", path: "/ttf-to-woff2", icon: markRaw(FontIcon) },
      { name: "menu.fontSubsetter", path: "/font-subsetter", icon: markRaw(FontIcon) },
      { name: "menu.compressWoff2", path: "/compress-woff2", icon: markRaw(FontIcon) },
      { name: "menu.fontInspector", path: "/font-inspector", icon: markRaw(FontIcon) },
      { name: "menu.fontUnicodeChecker", path: "/font-unicode-checker", icon: markRaw(FontIcon) },
      { name: "menu.fontSizeAnalyzer", path: "/font-size-analyzer", icon: markRaw(FontIcon) },
      { name: "menu.fontValidator", path: "/font-validator", icon: markRaw(FontIcon) },
      { name: "menu.fontCssGenerator", path: "/font-css-generator", icon: markRaw(FontIcon) },
      { name: "menu.jsoncsv", path: "/json-csv-convert", icon: markRaw(FontIcon) },
      { name: "home.tools.jsonFormatter.name", path: "/json-formatter", icon: markRaw(FontIcon) },
      { name: "jsonCompare.title", path: "/json-compare", icon: markRaw(FontIcon) },
      { name: "home.tools.dateFormat.name", path: "/date-format", icon: markRaw(DateIcon) },
    ],
  },
  {
    name: "menu.image",
    expanded: true,
    icon: markRaw(WebpIcon),
    tools: [
      { name: "menu.webp", path: "/image-to-webp", icon: markRaw(WebpIcon) },
      { name: "imageTools.converter.title", path: "/image-converter", icon: markRaw(WebpIcon) },
      { name: "imageTools.heic.title", path: "/heic-to-jpg", icon: markRaw(WebpIcon) },
      { name: "imageTools.resizer.title", path: "/image-resizer", icon: markRaw(WebpIcon) },
      { name: "imageTools.cropper.title", path: "/image-cropper", icon: markRaw(WebpIcon) },
      { name: "mergeTool.navTitle", path: "/merge-images", icon: markRaw(WebpIcon) },
      { name: "imageTools.base64.toTitle", path: "/image-to-base64", icon: markRaw(WebpIcon) },
      { name: "imageTools.base64.fromTitle", path: "/base64-to-image", icon: markRaw(WebpIcon) },
      { name: "imageTools.info.title", path: "/image-info", icon: markRaw(WebpIcon) },
      { name: "imageTools.exif.title", path: "/remove-exif", icon: markRaw(WebpIcon) },
      { name: "imageTools.colorPicker.title", path: "/image-color-picker", icon: markRaw(WebpIcon) },
      { name: "imageTools.svg.title", path: "/svg-converter", icon: markRaw(WebpIcon) },
      { name: "menu.webpToJpg", path: "/webp-to-jpg", icon: markRaw(WebpIcon) },
      { name: "menu.webpToPng", path: "/webp-to-png", icon: markRaw(WebpIcon) },
      { name: "menu.imageCompress", path: "/image-compress", icon: markRaw(WebpIcon) },
      { name: "menu.idPhoto", path: "/id-photo", icon: markRaw(WebpIcon) },
      { name: "menu.agnes_image", path: "/image-generator", icon: markRaw(WebpIcon) },
      { name: "menu.agnes_video", path: "/video-generator", icon: markRaw(WebpIcon) },
    ],
  },
  {
    name: "menu.crypto",
    expanded: true,
    tools: [
      { name: "menu.token", path: "/token-generator", icon: markRaw(TokenIcon) },
      { name: "menu.hash", path: "/hash-text", icon: markRaw(HashIcon) },
      { name: "menu.uppercase", path: "/case-converter", icon: markRaw(TokenIcon) },
      { name: "textDedup.title", path: "/text-dedup", icon: markRaw(TokenIcon) },
    ],
  },
  {
    name: "home.categories.utility",
    expanded: true,
    tools: [
      { name: "home.tools.shareNote.name", path: "/send-script-to-remote-user", icon: markRaw(BlogIcon) },
    ],
  },
  {
    name: "menu.alternatives",
    expanded: false,
    path: "/alternatives",
    icon: markRaw(BlogIcon)
  },
  {
    name: "menu.about",
    expanded: false,
    path: "/about",
    icon: markRaw(BlogIcon)
  }
]);

const toggleCategory = (index) => {
  categories.value[index].expanded = !categories.value[index].expanded;
};
const handleLogout = () => {
  user.value = { id: null, name: "", email: "", avatar: "" };
  navigateTo(localePath("/"));
};
</script>
