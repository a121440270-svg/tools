<template>
  <div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm border dark:border-gray-700 mb-8">
      <div class="flex items-center mb-4">
        <div class="p-2 rounded-full bg-primary/10 text-primary dark:bg-primary/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h2 class="text-lg font-medium ml-3 dark:text-white">You like it-tools?</h2>
      </div>
      <p class="mb-2 dark:text-gray-300">
        Give us a star on
        <a href="https://github.com" class="text-primary hover:underline">GitHub</a>
        or follow us on
        <a href="#" class="text-primary hover:underline">X</a>.
        Thank...
      </p>
    </div>

    <h2 class="text-2xl font-medium mb-6 dark:text-white">All the tools</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <!-- Token Generator -->
      <NuxtLink to="/token-generator" class="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <button class="text-gray-300 hover:text-primary dark:text-gray-600 dark:hover:text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
        <h3 class="text-lg font-medium mb-1 dark:text-white">Token generator</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          Generate random string with the chars you want, uppercase or lowercase letters, numbers and/or symbols.
        </p>
      </NuxtLink>

      <!-- Hash Text -->
      <NuxtLink to="/hash-text" class="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="9" x2="20" y2="9" />
              <line x1="4" y1="15" x2="20" y2="15" />
              <line x1="10" y1="3" x2="8" y2="21" />
              <line x1="16" y1="3" x2="14" y2="21" />
            </svg>
          </div>
          <button class="text-gray-300 hover:text-primary dark:text-gray-600 dark:hover:text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
        <h3 class="text-lg font-medium mb-1 dark:text-white">Hash text</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          Hash a text string using the function you need: MD5, SHA1, SHA256, SHA224, SHA512, SHA384, SHA3 or RIPEMD160
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
