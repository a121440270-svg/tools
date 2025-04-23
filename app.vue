<script setup lang="ts">
const { data, status, refresh } = await useFetch('/api');
</script>

<template>
  <div>
    <!-- refresh -->
    <button @click="() => refresh()">
      refresh
    </button>

    <!-- status, data -->
    <table border="1">
      <tbody>
        <tr>
          <td>status</td>
          <td>{{ status }}</td>
        </tr>
        <tr>
          <td>data</td>
          <td><pre>{{ data }}</pre></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>