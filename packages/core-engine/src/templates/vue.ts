// ─────────────────────────────────────────────────────────
// Vue.js Template — Feature-Based
// Vue 3 + Vite + TypeScript + Composition API
// ─────────────────────────────────────────────────────────

import { TemplateManifest } from '../types';

export const vueFeatureBasedManifest: TemplateManifest = {
  stack: 'vue',
  architecture: 'feature-based',
  files: [
    {
      path: 'package.json',
      content: `{
  "name": "<%= projectName %>",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port <%= port %>",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint ."
  },
  "dependencies": {
    "vue": "^3.5.13",
    "vue-router": "^4.5.1"<% if (stateManagement === 'pinia') { %>,
    "pinia": "^3.0.2"<% } %><% if (validation === 'zod') { %>,
    "zod": "^4.0.0"<% } %><% if (cssFramework === 'tailwind') { %>,
    "tailwindcss": "^4.1.8",
    "@tailwindcss/vite": "^4.1.8"<% } %>
  },
  "devDependencies": {
    "typescript": "^5.9.0-beta",
    "vite": "^7.0.0",
    "@vitejs/plugin-vue": "^5.2.4",
    "vue-tsc": "^2.2.10",
    "vitest": "^3.1.4",
    "@vue/test-utils": "^2.4.6",
    "eslint": "^9.28.0"
  }
}
`,
    },
    {
      path: 'tsconfig.json',
      content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
`,
    },
    {
      path: 'vite.config.ts',
      content: `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
<% if (cssFramework === 'tailwind') { %>import tailwindcss from '@tailwindcss/vite';
<% } %>import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()<% if (cssFramework === 'tailwind') { %>, tailwindcss()<% } %>],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  server: { port: <%= port %> },
});
`,
    },
    {
      path: 'index.html',
      content: `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><%= projectName %></title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
`,
    },
    {
      path: 'src/main.ts',
      content: `import { createApp } from 'vue';
<% if (stateManagement === 'pinia') { %>import { createPinia } from 'pinia';
<% } %>import { router } from './router';
import App from './App.vue';
<% if (cssFramework === 'tailwind') { %>import './style.css';
<% } %>
const app = createApp(App);
<% if (stateManagement === 'pinia') { %>app.use(createPinia());
<% } %>app.use(router);
app.mount('#app');
`,
    },
    {
      path: 'src/style.css',
      content: `<% if (cssFramework === 'tailwind') { %>@import "tailwindcss";
<% } else { %>* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; }
<% } %>`,
    },
    {
      path: 'src/App.vue',
      content: `<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <h1><%= projectName %></h1>
  <RouterView />
</template>
`,
    },
    {
      path: 'src/router/index.ts',
      content: `import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/users',
    },
    {
      path: '/users',
      component: () => import('@/features/users/pages/UserListPage.vue'),
    },
  ],
});
`,
    },
    // ── Feature: Users ──────────────────────────────────
    {
      path: 'src/features/users/types.ts',
      content: `export interface User {
  id: string;
  name: string;
  email: string;
}
`,
    },
    {
      path: 'src/features/users/composables/useUsers.ts',
      content: `import { ref, onMounted } from 'vue';
import type { User } from '../types';

export function useUsers() {
  const users = ref<User[]>([]);
  const isLoading = ref(true);

  const fetchUsers = async () => {
    isLoading.value = true;
    const res = await fetch('/api/users');
    users.value = await res.json();
    isLoading.value = false;
  };

  onMounted(fetchUsers);

  return { users, isLoading, refetch: fetchUsers };
}
`,
    },
    {
      path: 'src/features/users/pages/UserListPage.vue',
      content: `<script setup lang="ts">
import { useUsers } from '../composables/useUsers';
import UserCard from '../components/UserCard.vue';

const { users, isLoading } = useUsers();
</script>

<template>
  <div>
    <h2>Users</h2>
    <p v-if="isLoading">Loading...</p>
    <ul v-else>
      <UserCard v-for="user in users" :key="user.id" :user="user" />
    </ul>
  </div>
</template>
`,
    },
    {
      path: 'src/features/users/components/UserCard.vue',
      content: `<script setup lang="ts">
import type { User } from '../types';

defineProps<{ user: User }>();
</script>

<template>
  <li>{{ user.name }} — {{ user.email }}</li>
</template>
`,
    },
    // ── Shared ──────────────────────────────────────────
    {
      path: 'src/shared/components/AppButton.vue',
      content: `<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'primary' | 'secondary' }>(), {
  variant: 'primary',
});
</script>

<template>
  <button :data-variant="variant">
    <slot />
  </button>
</template>
`,
    },
    {
      path: '.gitignore',
      content: `node_modules/
dist/
.env
*.local
`,
    },
  ],
  postMessages: [
    'Run `<%= packageManager %> install`',
    'Run `<%= packageManager %> run dev` to start on port <%= port %>',
    'Architecture: Feature-Based (features/ contain pages, composables, components)',
  ],
};
