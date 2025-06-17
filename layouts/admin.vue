<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-bold">多语言管理后台</h1>
          <NuxtLink to="/auth/login" class="text-red-600 hover:text-red-700">退出</NuxtLink>
        </div>
      </div>
    </nav>
    
    <div class="max-w-7xl mx-auto px-4 py-6">
      <slot />
    </div>
  </div>
</template>