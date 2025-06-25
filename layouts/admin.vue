<template>
  <div class="admin-layout h-screen bg-[#f5f7fa] flex">
    <!-- 侧边栏 -->
    <aside class="w-60 sidebar-bg border-r dark:border-gray-800 flex flex-col h-full">
      <div class="h-16 flex items-center justify-center font-bold text-lg border-b dark:border-gray-800 sidebar-header-bg">
        OnlinTool 后台
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical-demo menu-bg"
        background-color="#eaf3fb"
        text-color="#333"
        active-text-color="#409EFF"
        unique-opened
        router
      >
        <el-menu-item index="/admin/userList">用户管理</el-menu-item>
        <el-menu-item index="/admin/articleList">文章管理</el-menu-item>
        <el-menu-item index="/admin/pageLang">多语言</el-menu-item>
        <!-- 可继续添加其他一级菜单项 -->
      </el-menu>
      <div class="mt-auto p-4 text-xs text-gray-400 dark:text-gray-600">
        &copy; 2024 管理系统
      </div>
    </aside>
    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col h-full min-w-0">
      <!-- 顶部 Banner -->
      <header class="admin-header h-16 flex items-center px-8 banner-bg border-b dark:bg-gray-900 dark:border-gray-800 shadow-sm z-10 header-bg">
        <div class="ml-auto flex items-center gap-4 w-full justify-end">
          <span class="text-gray-500 dark:text-gray-300 text-sm">管理员</span>
          <el-button type="text" size="small" @click="$router.push('/admin/logout')">
            <i class="el-icon-switch-button"></i> 退出
          </el-button>
        </div>
      </header>
      <main class="flex-1 overflow-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.admin-layout {
  min-width: 100vw;
  min-height: 100vh;
}
.el-menu-vertical-demo {
  border-right: none;
}
.menu-bg {
  background: #eaf3fb !important;
}
.sidebar-bg {
  background: #f0f4fa;
}
.sidebar-header-bg {
  background: #e3eaf6;
}
.banner-bg {
  background: #f8fafc;
}
.header-bg {
  background: #f3f7fd !important;
}
.admin-header {
  min-width: 0;
  border-bottom: 1px solid #e5e7eb;
  z-index: 20;
}
</style>