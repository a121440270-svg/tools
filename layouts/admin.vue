<template>
  <div class="min-h-screen bg-[#f5f7fa]">
    <!-- 顶部导航栏 -->
    <nav class="bg-white shadow-sm border-b border-blue-200">
      <div class="flex items-center h-14 px-6">
        <h1 class="text-lg font-bold text-blue-700 tracking-wide">后台管理系统</h1>
        <div class="flex-1"></div>
        <NuxtLink to="/auth/login" class="text-blue-600 hover:text-blue-800 font-semibold">退出</NuxtLink>
      </div>
    </nav>
    <div class="flex">
      <!-- 侧边栏 -->
      <aside class="w-56 bg-[#eaf1fb] border-r border-blue-100 min-h-screen py-4 px-0">
        <div class="px-6 pb-2 text-blue-700 font-bold text-base">后台管理系统</div>
        <ul class="space-y-1 mt-2">
          <li>
            <NuxtLink to="/admin/userList" class="flex items-center gap-2 px-6 py-2 rounded text-blue-800 hover:bg-blue-100 font-medium" active-class="bg-white font-bold shadow">用户管理</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/admin/pageLang" class="flex items-center gap-2 px-6 py-2 rounded text-blue-800 hover:bg-blue-100 font-medium" active-class="bg-white font-bold shadow">多语言管理</NuxtLink>
          </li>
          <!-- 可继续添加更多菜单项 -->
        </ul>
      </aside>
      <!-- 主内容区 -->
      <main class="flex-1 px-8 py-8">
        <slot />
      </main>
    </div>
  </div>
</template>