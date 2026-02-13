// ─────────────────────────────────────────────────────────
// React Templates — Clean, Feature-based, Layered
// ─────────────────────────────────────────────────────────

import { TemplateManifest } from '../types';

// ── Shared React files ──────────────────────────────────

const packageJson = {
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
    "lint": "eslint src --ext .ts,.tsx",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0"<% if (auth === 'jwt') { %>,
    "jwt-decode": "^4.0.0"<% } %><% if (database !== 'none') { %>,
    "axios": "^1.6.0"<% } %>
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.2.0",
    "eslint": "^8.56.0",
    "@typescript-eslint/parser": "^6.19.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0"
  }
}
`,
};

const tsconfig = {
  path: 'tsconfig.json',
  content: `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
`,
};

const viteConfig = {
  path: 'vite.config.ts',
  content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
`,
};

const indexHtml = {
  path: 'index.html',
  content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= projectName %></title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
};

const eslintConfig = {
  path: '.eslintrc.json',
  content: `{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off"
  }
}
`,
};

const envExample = {
  path: '.env.example',
  content: `VITE_API_BASE_URL=http://localhost:3000/api
<% if (auth === 'jwt') { %>VITE_AUTH_TOKEN_KEY=auth_token<% } %>
`,
};

const sharedFiles = [packageJson, tsconfig, viteConfig, indexHtml, eslintConfig, envExample];

// ── Clean Architecture ──────────────────────────────────

export const reactCleanManifest: TemplateManifest = {
  stack: 'react',
  architecture: 'clean',
  files: [
    ...sharedFiles,
    {
      path: 'src/main.tsx',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './presentation/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`,
    },
    // Domain layer
    {
      path: 'src/domain/entities/User.ts',
      content: `/**
 * Domain Entity: User
 * Pure business object — no framework dependencies.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}
`,
    },
    {
      path: 'src/domain/repositories/UserRepository.ts',
      content: `import { User } from '../entities/User';

/**
 * Repository interface — defines the contract for data access.
 * Implementations live in the infrastructure layer.
 */
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
`,
    },
    // Application layer
    {
      path: 'src/application/use-cases/GetUsersUseCase.ts',
      content: `import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

/**
 * Use Case: Get all users.
 * Orchestrates business logic without knowing about infrastructure.
 */
export class GetUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
`,
    },
    {
      path: 'src/application/services/AuthService.ts',
      content: `/**
 * Application service interface for authentication.
 */
export interface AuthService {
  login(email: string, password: string): Promise<string>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;
}
`,
    },
    // Infrastructure layer
    {
      path: 'src/infrastructure/api/ApiClient.ts',
      content: `<% if (database !== 'none') { %>import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

export { apiClient };<% } else { %>/**
 * API client placeholder.
 * Replace with your preferred HTTP client.
 */
export const apiClient = {
  async get<T>(url: string): Promise<T> {
    const res = await fetch(url);
    return res.json();
  },
  async post<T>(url: string, data: unknown): Promise<T> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};<% } %>
`,
    },
    {
      path: 'src/infrastructure/repositories/ApiUserRepository.ts',
      content: `import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { apiClient } from '../api/ApiClient';

/**
 * Concrete implementation of UserRepository using the API.
 */
export class ApiUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    try {
      const response = await apiClient.get<User>(\`/users/\${id}\`);
      return response<% if (database !== 'none') { %>.data<% } %>;
    } catch {
      return null;
    }
  }

  async findAll(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users');
    return response<% if (database !== 'none') { %>.data<% } %>;
  }

  async save(user: User): Promise<User> {
    const response = await apiClient.post<User>('/users', user);
    return response<% if (database !== 'none') { %>.data<% } %>;
  }

  async delete(id: string): Promise<void> {
    await apiClient.post(\`/users/\${id}/delete\`, {});
  }
}
`,
    },
    // Presentation layer
    {
      path: 'src/presentation/App.tsx',
      content: `import React from 'react';

export const App: React.FC = () => {
  return (
    <div>
      <h1><%= projectName %></h1>
      <p>Clean Architecture — Generated by ArchForge</p>
    </div>
  );
};
`,
    },
    {
      path: 'src/presentation/hooks/useUsers.ts',
      content: `import { useState, useEffect } from 'react';
import { User } from '../../domain/entities/User';
import { GetUsersUseCase } from '../../application/use-cases/GetUsersUseCase';
import { ApiUserRepository } from '../../infrastructure/repositories/ApiUserRepository';

const userRepository = new ApiUserRepository();
const getUsersUseCase = new GetUsersUseCase(userRepository);

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUsersUseCase
      .execute()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { users, loading, error };
}
`,
    },
    // Config
    {
      path: 'src/config/constants.ts',
      content: `export const APP_NAME = '<%= projectName %>';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
`,
    },
  ],
  postMessages: [
    'Run `npm install` to install dependencies',
    'Run `npm run dev` to start the development server',
    'Architecture: Clean Architecture (Domain → Application → Infrastructure → Presentation)',
  ],
};

// ── Feature-based Architecture ──────────────────────────

export const reactFeatureManifest: TemplateManifest = {
  stack: 'react',
  architecture: 'feature-based',
  files: [
    ...sharedFiles,
    {
      path: 'src/main.tsx',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`,
    },
    // App shell
    {
      path: 'src/app/App.tsx',
      content: `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '../features/home';
<% if (auth !== 'none') { %>import { LoginPage } from '../features/auth';<% } %>

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
<% if (auth !== 'none') { %>        <Route path="/login" element={<LoginPage />} /><% } %>
      </Routes>
    </BrowserRouter>
  );
};
`,
    },
    {
      path: 'src/app/providers.tsx',
      content: `import React, { PropsWithChildren } from 'react';

/**
 * Global providers wrapper (context, theme, etc.)
 */
export const AppProviders: React.FC<PropsWithChildren> = ({ children }) => {
  return <>{children}</>;
};
`,
    },
    // Shared module
    {
      path: 'src/shared/components/Button.tsx',
      content: `import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, ...props }) => {
  return (
    <button className={\`btn btn-\${variant}\`} {...props}>
      {children}
    </button>
  );
};
`,
    },
    {
      path: 'src/shared/hooks/useLocalStorage.ts',
      content: `import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue] as const;
}
`,
    },
    {
      path: 'src/shared/utils/formatDate.ts',
      content: `export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}
`,
    },
    // Feature: Home
    {
      path: 'src/features/home/index.ts',
      content: `export { HomePage } from './components/HomePage';
`,
    },
    {
      path: 'src/features/home/components/HomePage.tsx',
      content: `import React from 'react';

export const HomePage: React.FC = () => {
  return (
    <main>
      <h1>Welcome to <%= projectName %></h1>
      <p>Feature-based Architecture — Generated by ArchForge</p>
    </main>
  );
};
`,
    },
    // Feature: Auth
    {
      path: 'src/features/auth/index.ts',
      content: `export { LoginPage } from './components/LoginPage';
<% if (auth !== 'none') { %>export { useAuth } from './hooks/useAuth';<% } %>
`,
    },
    {
      path: 'src/features/auth/components/LoginPage.tsx',
      content: `import React, { useState } from 'react';
import { Button } from '../../../shared/components/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with auth service
    console.log('Login:', { email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <Button type="submit">Sign In</Button>
    </form>
  );
};
`,
    },
    {
      path: 'src/features/auth/hooks/useAuth.ts',
      content: `import { useState, useCallback } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    // TODO: replace with real auth call
    const fakeToken = btoa(\`\${email}:\${Date.now()}\`);
    setToken(fakeToken);
    setIsAuthenticated(true);
    localStorage.setItem('auth_token', fakeToken);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
  }, []);

  return { isAuthenticated, token, login, logout };
}
`,
    },
    {
      path: 'src/features/auth/services/authService.ts',
      content: `/**
 * Auth service — encapsulates authentication logic for this feature.
 */
export const authService = {
  async login(email: string, password: string): Promise<string> {
    // TODO: call real API
    return btoa(\`\${email}:\${Date.now()}\`);
  },
  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
  },
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },
};
`,
    },
    // Config
    {
      path: 'src/config/constants.ts',
      content: `export const APP_NAME = '<%= projectName %>';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
`,
    },
  ],
  postMessages: [
    'Run `npm install` to install dependencies',
    'Run `npm run dev` to start the development server',
    'Architecture: Feature-based (each feature is self-contained with its own components, hooks, and services)',
  ],
};

// ── Layered Architecture ────────────────────────────────

export const reactLayeredManifest: TemplateManifest = {
  stack: 'react',
  architecture: 'layered',
  files: [
    ...sharedFiles,
    {
      path: 'src/main.tsx',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`,
    },
    {
      path: 'src/components/App.tsx',
      content: `import React from 'react';

export const App: React.FC = () => {
  return (
    <div>
      <h1><%= projectName %></h1>
      <p>Layered Architecture — Generated by ArchForge</p>
    </div>
  );
};
`,
    },
    {
      path: 'src/components/UserList.tsx',
      content: `import React from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserListProps {
  users: User[];
}

export const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name} — {user.email}</li>
      ))}
    </ul>
  );
};
`,
    },
    {
      path: 'src/services/userService.ts',
      content: `export interface User {
  id: string;
  name: string;
  email: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const userService = {
  async getAll(): Promise<User[]> {
    const res = await fetch(\`\${API_URL}/users\`);
    return res.json();
  },
  async getById(id: string): Promise<User> {
    const res = await fetch(\`\${API_URL}/users/\${id}\`);
    return res.json();
  },
};
`,
    },
    {
      path: 'src/hooks/useUsers.ts',
      content: `import { useState, useEffect } from 'react';
import { User, userService } from '../services/userService';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getAll().then(setUsers).finally(() => setLoading(false));
  }, []);

  return { users, loading };
}
`,
    },
    {
      path: 'src/models/User.ts',
      content: `export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}
`,
    },
    {
      path: 'src/utils/formatDate.ts',
      content: `export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US').format(new Date(date));
}
`,
    },
    {
      path: 'src/config/constants.ts',
      content: `export const APP_NAME = '<%= projectName %>';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
`,
    },
  ],
  postMessages: [
    'Run `npm install` to install dependencies',
    'Run `npm run dev` to start the development server',
    'Architecture: Layered (components → hooks → services → models)',
  ],
};
