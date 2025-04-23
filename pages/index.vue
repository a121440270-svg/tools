<template>
    <div>
      <h1>工具列表</h1>
      <ul>
        <li v-for="tool in tools" :key="tool.id">
          <NuxtLink :to="tool.route">{{ tool.name }}</NuxtLink>
          <p>{{ tool.description }}</p>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  const { data: tools } = await useFetch('/api/tools');
  </script>
  