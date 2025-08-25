<template>
  <!-- 确保根div闭合 -->
  <div class="min-h-screen flex">
    <!-- 移动端顶部导航栏 -->
    <header
      class="lg:hidden border-b bg-white dark:bg-gray-800 dark:border-gray-700"
    >
      <div class="flex items-center justify-between h-16 px-4">
        <div class="flex items-center">
          <button
            class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            @click="toggleSidebar"
          >
            <MenuIcon class="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
          <span class="ml-3 font-bold text-gray-800 dark:text-white"
            >OnliTool</span
          >
        </div>

        <button
          class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="toggleTheme"
        >
          <component
            :is="isDark ? SunIcon : MoonIcon"
            class="w-5 h-5 text-gray-700 dark:text-gray-200"
          />
        </button>
      </div>
    </header>

    <!-- 侧边栏   fixed left-0 top-0 h-screen w-64 bg-gray-100 -->
    <aside
      :class="[
        'sidebar-gradient fixed top-0 left-0 bottom-0 transition-all duration-300 z-30 overflow-y-auto',
        isDesktop
          ? isSidebarCollapsed
            ? 'w-0 overflow-hidden'
            : 'w-64'
          : isSidebarOpen
          ? 'w-64'
          : 'w-64 -left-64',
      ]"
    >
      <div
        class="py-8 px-6 cursor-pointer"
        @click="navigateTo(localePath('/'))"
      >
        <h1 class="text-2xl font-bold text-white">OnliTool</h1>
        <p class="text-sm text-white/80">{{ $t("menu.desc") }}</p>
      </div>

      <!-- 工具分类 -->
      <div class="mt-6">
        <div v-for="(category, index) in categories" :key="index" class="mb-1">
          <div
            class="flex items-center px-6 py-2 text-white cursor-pointer"
            @click="toggleCategory(index)"
          >
            <ChevronIcon
              v-if="null == category.path"
              class="w-4 h-4 mr-2 transition-transform"
              :class="category.expanded ? 'rotate-90' : ''"
            />
            <span
              v-if="null == category.path"
              class="truncate max-w-[140px]"
              :title="$t(category.name)"
              >{{ $t(category.name) }}</span
            >
            <NuxtLink
              v-if="null != category.path"
              :key="category.path"
              :to="localePath(category.path)"
              class="block py-2 px-6 hover:bg-white/10 rounded transition-colors flex items-center text-white"
              :class="{ 'bg-white/10': $route.path === category.path }"
              @click="isDesktop ? null : closeSidebar()"
            >
              <component
                :is="category.icon"
                class="w-5 h-5 mr-3 text-white/90"
              />
              <span class="truncate max-w-[140px]" :title="category.name">{{
                $t(category.name)
              }}</span>
            </NuxtLink>
          </div>

          <div
            v-if="category.expanded && null == category.path"
            class="pl-4 mt-1"
          >
            <NuxtLink
              v-for="tool in category.tools"
              :key="tool.path"
              :to="localePath(tool.path)"
              class="block py-2 px-6 hover:bg-white/10 rounded transition-colors flex items-center text-white"
              :class="{ 'bg-white/10': $route.path === tool.path }"
              @click="isDesktop ? null : closeSidebar()"
            >
              <component :is="tool.icon" class="w-5 h-5 mr-3 text-white/90" />
              <span class="truncate max-w-[140px]" :title="$t(tool.name)">{{
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
      class="flex-1 min-w-0 transition-all duration-300"
      :style="isDesktop && !isSidebarCollapsed ? 'ml-64' : ''"
    >
      <!-- 桌面端顶部导航栏 -->
      <header
        class="hidden lg:flex h-16 items-center px-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700"
      >
        <button
          class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="toggleSidebar"
        >
          <MenuIcon class="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
        <button
          class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="navigateTo('/')"
        >
          <HomeIcon class="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
        <div class="flex items-center ml-4 relative">
          <SearchIcon class="w-5 h-5 absolute left-3 text-gray-400" />
          <input
            type="text"
            :placeholder="$t('search.placeholder')"
            class="bg-gray-100 py-2 pl-10 pr-4 rounded-md w-64 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          <span class="ml-2 text-xs text-gray-500 dark:text-gray-400"
            >Cmd + K</span
          >
        </div>

        <div class="ml-auto flex items-center gap-4">
          <NuxtLink
            v-if="!user?.id"
            :to="localePath('/auth/login')"
            class="px-4 py-2 text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            {{ $t("login.submit") }}
          </NuxtLink>

          <NuxtLink
            v-else
            to="localePath('/profile')"
            class="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <img :src="user.avatar" class="w-6 h-6 rounded-full mr-2" />
            <span class="text-primary">{{ user.name }}</span>
          </NuxtLink>
          <NuxtLink
            v-if="user?.id"
            @click.prevent="handleLogout"
            to="#"
            class="ml-2 px-4 py-2 text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            {{ $t("login.out") }}
          </NuxtLink>
          <select
            @change="changeLanguage"
            :value="$i18n.locale"
            class="bg-transparent py-1 px-2 rounded border text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option
              v-for="locale in locales"
              :key="locale.code"
              :value="locale.code"
            >
              {{ $t(`locale.${locale.code}`) }}
            </option>
          </select>
          <button
            class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            @click="toggleTheme"
          >
            <component :is="isDark() ? SunIcon : MoonIcon" class="w-5 h-5" />
          </button>

          <a
            href="#"
            @click="pay"
            class="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm hover:bg-primary/90 transition-colors"
          >
            Buy me a coffee ❤️
          </a>
        </div>
      </header>

      <!-- 内容 -->
      <main class="p-4 md:p-6 bg-background dark:bg-gray-900">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
// Add user state initialization
import { useUser } from "~/composables/useAuth";
const user = useUser();
const { t, locales, setLocale } = useI18n();
import {
  h,
  defineComponent,
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
} from "vue";
import { useTheme } from "~/composables/useTheme";
import { useLocalePath } from "#i18n";
import { markRaw } from "vue";

const localePath = useLocalePath();
// 主题管理
const { theme, toggleTheme, isDark, isLight } = useTheme();

const themeClass = computed(() => (isDark.value ? "dark" : "light"));

// 在根元素上动态添加主题类
onMounted(() => {
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

// 检查是否为桌面视图
const checkViewport = () => {
  isDesktop.value = window.innerWidth >= 1024;
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
    let targetProtocol = "https:";
    let url = window.location.href;
    let protocol = window.location.protocol;
    let changed = false;
    if (protocol != targetProtocol) {
      url = targetProtocol + url.substring(protocol.length);
      changed = true;
    }
    if (url.indexOf("www.onlitools.com") > 0) {
      url = url.replace("www.onlitools.com", "onlitools.com");
      changed = true;
    }
    console.log(url);
    if (changed) {
      window.location.href = url;
    }
  }
  checkViewport();
  window.addEventListener("resize", checkViewport);
});

onUnmounted(() => {
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
    path: "/blog",
    icon: markRaw(BlogIcon),
  },
  {
    name: "menu.filetype",
    expanded: true,
    tools: [
      { name: "menu.ttf", path: "/font-compress", icon: markRaw(FontIcon) },
      { name: "menu.webp", path: "/image-to-webp", icon: markRaw(WebpIcon) },
      { name: "menu.jsoncsv", path: "/json-csv-convert", icon: markRaw(FontIcon) },
    ],
  },
  {
    name: "menu.crypto",
    expanded: true,
    tools: [
      { name: "menu.token", path: "/token-generator", icon: markRaw(TokenIcon) },
      { name: "menu.hash", path: "/hash-text", icon: markRaw(HashIcon) },
    ],
  },
]);

const toggleCategory = (index) => {
  categories.value[index].expanded = !categories.value[index].expanded;
};
const handleLogout = () => {
  user.value = { id: null, name: "", email: "", avatar: "" };
  navigateTo("/"); // 修改这里从 '/auth/login' 改为 '/'
};
</script>
