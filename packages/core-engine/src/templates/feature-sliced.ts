// ─────────────────────────────────────────────────────────
// Feature-Sliced Design Templates
// React (TypeScript + Vite)
// ─────────────────────────────────────────────────────────

import { TemplateManifest } from '../types';

export const reactFeatureSlicedManifest: TemplateManifest = {
  stack: 'react',
  architecture: 'feature-sliced',
  files: [
    // ── Root config ─────────────────────────────────────
    {
      path: 'package.json',
      content: `{
  "name": "<%= projectName %>",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .ts,.tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.47",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.11",
    "eslint": "^8.56.0"
  }
}
`,
    },
    {
      path: 'tsconfig.json',
      content: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/app/*"],
      "@processes/*": ["src/processes/*"],
      "@pages/*": ["src/pages/*"],
      "@widgets/*": ["src/widgets/*"],
      "@features/*": ["src/features/*"],
      "@entities/*": ["src/entities/*"],
      "@shared/*": ["src/shared/*"]
    }
  },
  "include": ["src"]
}
`,
    },
    {
      path: 'vite.config.ts',
      content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src/app'),
      '@processes': path.resolve(__dirname, 'src/processes'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@widgets': path.resolve(__dirname, 'src/widgets'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@entities': path.resolve(__dirname, 'src/entities'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
});
`,
    },
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title><%= projectName %></title></head>
  <body><div id="root"></div><script type="module" src="/src/app/main.tsx"></script></body>
</html>
`,
    },
    // ── Layer 1: app ────────────────────────────────────
    {
      path: 'src/app/main.tsx',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);
`,
    },
    {
      path: 'src/app/App.tsx',
      content: `import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router';

export function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
`,
    },
    {
      path: 'src/app/router.tsx',
      content: `import { Routes, Route } from 'react-router-dom';
import { HomePage } from '@pages/home';
import { UserListPage } from '@pages/user-list';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/users" element={<UserListPage />} />
    </Routes>
  );
}
`,
    },
    {
      path: 'src/app/styles/global.css',
      content: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a2e; }
`,
    },
    // ── Layer 2: processes (cross-page flows) ───────────
    {
      path: 'src/processes/README.md',
      content: `# Processes Layer
Business processes that span multiple pages.
Examples: auth flow, onboarding wizard, checkout pipeline.
`,
    },
    // ── Layer 3: pages ──────────────────────────────────
    {
      path: 'src/pages/home/index.ts',
      content: `export { HomePage } from './ui/HomePage';
`,
    },
    {
      path: 'src/pages/home/ui/HomePage.tsx',
      content: `import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1><%= projectName %></h1>
      <p>Feature-Sliced Design Architecture</p>
      <nav><Link to="/users">View Users &rarr;</Link></nav>
    </main>
  );
}
`,
    },
    {
      path: 'src/pages/user-list/index.ts',
      content: `export { UserListPage } from './ui/UserListPage';
`,
    },
    {
      path: 'src/pages/user-list/ui/UserListPage.tsx',
      content: `import { UserCard } from '@entities/user';
import { CreateUserForm } from '@features/create-user';

const MOCK_USERS = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
];

export function UserListPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Users</h1>
      <CreateUserForm />
      <section style={{ marginTop: '1.5rem' }}>
        {MOCK_USERS.map(u => <UserCard key={u.id} user={u} />)}
      </section>
    </main>
  );
}
`,
    },
    // ── Layer 4: widgets (composite UI blocks) ──────────
    {
      path: 'src/widgets/README.md',
      content: `# Widgets Layer
Compositional blocks that combine entities + features.
Examples: Header, Sidebar, UserProfileCard.
`,
    },
    // ── Layer 5: features (user interactions) ───────────
    {
      path: 'src/features/create-user/index.ts',
      content: `export { CreateUserForm } from './ui/CreateUserForm';
`,
    },
    {
      path: 'src/features/create-user/ui/CreateUserForm.tsx',
      content: `import { useState } from 'react';

export function CreateUserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Create user:', { name, email });
    setName(''); setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
      <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <button type="submit">Add User</button>
    </form>
  );
}
`,
    },
    // ── Layer 6: entities (business entities) ───────────
    {
      path: 'src/entities/user/index.ts',
      content: `export { UserCard } from './ui/UserCard';
export type { User } from './model/types';
`,
    },
    {
      path: 'src/entities/user/model/types.ts',
      content: `export interface User {
  id: string;
  name: string;
  email: string;
}
`,
    },
    {
      path: 'src/entities/user/ui/UserCard.tsx',
      content: `import type { User } from '../model/types';

interface Props { user: User; }

export function UserCard({ user }: Props) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '0.5rem' }}>
      <strong>{user.name}</strong>
      <span style={{ marginLeft: '0.5rem', color: '#666' }}>{user.email}</span>
    </div>
  );
}
`,
    },
    // ── Layer 7: shared (reusable foundations) ───────────
    {
      path: 'src/shared/ui/Button.tsx',
      content: `import { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'primary', children, ...rest }: Props) {
  const bg = variant === 'primary' ? '#4361ee' : '#6c757d';
  return (
    <button style={{ background: bg, color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }} {...rest}>
      {children}
    </button>
  );
}
`,
    },
    {
      path: 'src/shared/lib/cn.ts',
      content: `/** Tiny className combiner */
export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
`,
    },
    {
      path: 'src/shared/api/client.ts',
      content: `const BASE = import.meta.env.VITE_API_URL ?? '/api';

export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(\`\${BASE}\${path}\`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(\`API error: \${res.status}\`);
  return res.json();
}
`,
    },
    {
      path: 'src/shared/config/index.ts',
      content: `export const APP_CONFIG = {
  appName: '<%= projectName %>',
  apiUrl: import.meta.env.VITE_API_URL ?? '/api',
} as const;
`,
    },
  ],
  postMessages: [
    'Run `npm install && npm run dev`',
    'Architecture: Feature-Sliced Design — app/processes/pages/widgets/features/entities/shared',
    'Import rule: lower layers NEVER import from upper layers',
  ],
};
