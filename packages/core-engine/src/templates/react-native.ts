// ─────────────────────────────────────────────────────────
// React Native Templates — Feature-Based, Clean
// React Native + TypeScript (Expo)
// ─────────────────────────────────────────────────────────

import { TemplateManifest } from '../types';

// ── Shared files ────────────────────────────────────────

const packageJson = {
  path: 'package.json',
  content: `{
  "name": "<%= projectName %>",
  "version": "0.1.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "test": "jest",
    "lint": "eslint ."
  },
  "dependencies": {
    "expo": "~53.0.0",
    "expo-router": "~5.0.0",
    "expo-status-bar": "~2.2.0",
    "react": "^19.1.0",
    "react-native": "~0.79.2",
    "react-native-safe-area-context": "~5.4.0",
    "react-native-screens": "~4.10.0"<% if (stateManagement === 'zustand') { %>,
    "zustand": "^5.0.5"<% } else if (stateManagement === 'redux') { %>,
    "@reduxjs/toolkit": "^2.8.2",
    "react-redux": "^9.2.0"<% } %><% if (validation === 'zod') { %>,
    "zod": "^4.0.0"<% } %>
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "@types/react": "^19.1.4",
    "jest": "^29.7.0",
    "@testing-library/react-native": "^13.2.0",
    "eslint": "^9.28.0"
  }
}
`,
};

const tsconfig = {
  path: 'tsconfig.json',
  content: `{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
`,
};

const appJson = {
  path: 'app.json',
  content: `{
  "expo": {
    "name": "<%= projectName %>",
    "slug": "<%= projectName %>",
    "version": "1.1.0",
    "scheme": "<%= projectName %>",
    "platforms": ["ios", "android"],
    "newArchEnabled": true
  }
}
`,
};

const gitignore = {
  path: '.gitignore',
  content: `node_modules/
dist/
.expo/
*.jks
*.keystore
*.p12
*.mobileprovision
.env
`,
};

// ── Feature-Based Architecture ──────────────────────────

export const reactNativeFeatureBasedManifest: TemplateManifest = {
  stack: 'react-native',
  architecture: 'feature-based',
  files: [
    packageJson,
    tsconfig,
    appJson,
    gitignore,
    {
      path: 'app/_layout.tsx',
      content: `import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: '<%= projectName %>' }} />
    </Stack>
  );
}
`,
    },
    {
      path: 'app/index.tsx',
      content: `import { View, Text, StyleSheet } from 'react-native';
import { UserList } from '@/features/users/components/UserList';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}><%= projectName %></Text>
      <UserList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
});
`,
    },
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
      path: 'src/features/users/hooks/useUsers.ts',
      content: `import { useState, useEffect } from 'react';
import type { User } from '../types';
import { userApi } from '../api/userApi';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    userApi.getAll().then((data) => {
      setUsers(data);
      setIsLoading(false);
    });
  }, []);

  return { users, isLoading };
}
`,
    },
    {
      path: 'src/features/users/api/userApi.ts',
      content: `import type { User } from '../types';

const API_URL = 'https://jsonplaceholder.typicode.com';

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const res = await fetch(\`\${API_URL}/users\`);
    return res.json();
  },
  getById: async (id: string): Promise<User> => {
    const res = await fetch(\`\${API_URL}/users/\${id}\`);
    return res.json();
  },
};
`,
    },
    {
      path: 'src/features/users/components/UserList.tsx',
      content: `import { FlatList, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useUsers } from '../hooks/useUsers';
import type { User } from '../types';

export function UserList() {
  const { users, isLoading } = useUsers();

  if (isLoading) return <ActivityIndicator size="large" />;

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={({ item }: { item: User }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text>{item.email}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  name: { fontWeight: '600', fontSize: 16 },
});
`,
    },
    {
      path: 'src/shared/components/AppButton.tsx',
      content: `import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function AppButton({ title, onPress, variant = 'primary' }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, variant === 'secondary' && styles.secondary]}
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  secondary: { backgroundColor: '#8E8E93' },
  text: { color: '#fff', fontWeight: '600' },
});
`,
    },
  ],
  postMessages: [
    'Run `npm install`',
    'Run `npx expo start` to launch the dev server',
    'Architecture: Feature-Based (features/ contain components, hooks, api, types)',
  ],
};

// ── Clean Architecture ──────────────────────────────────

export const reactNativeCleanManifest: TemplateManifest = {
  stack: 'react-native',
  architecture: 'clean',
  files: [
    packageJson,
    tsconfig,
    appJson,
    gitignore,
    {
      path: 'app/_layout.tsx',
      content: `import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: '<%= projectName %>' }} />
    </Stack>
  );
}
`,
    },
    {
      path: 'app/index.tsx',
      content: `import { View, Text, StyleSheet } from 'react-native';
import { UserListScreen } from '@/presentation/screens/UserListScreen';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}><%= projectName %></Text>
      <UserListScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
});
`,
    },
    // ── Domain layer
    {
      path: 'src/domain/entities/User.ts',
      content: `export interface User {
  id: string;
  name: string;
  email: string;
}
`,
    },
    {
      path: 'src/domain/repositories/UserRepository.ts',
      content: `import type { User } from '../entities/User';

export interface UserRepository {
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User>;
}
`,
    },
    {
      path: 'src/domain/usecases/GetUsersUseCase.ts',
      content: `import type { User } from '../entities/User';
import type { UserRepository } from '../repositories/UserRepository';

export class GetUsersUseCase {
  constructor(private readonly repo: UserRepository) {}

  async execute(): Promise<User[]> {
    return this.repo.getAll();
  }
}
`,
    },
    // ── Data layer
    {
      path: 'src/data/repositories/UserRepositoryImpl.ts',
      content: `import type { User } from '../../domain/entities/User';
import type { UserRepository } from '../../domain/repositories/UserRepository';

const API_URL = 'https://jsonplaceholder.typicode.com';

export class UserRepositoryImpl implements UserRepository {
  async getAll(): Promise<User[]> {
    const res = await fetch(\`\${API_URL}/users\`);
    return res.json();
  }

  async getById(id: string): Promise<User> {
    const res = await fetch(\`\${API_URL}/users/\${id}\`);
    return res.json();
  }
}
`,
    },
    // ── Presentation layer
    {
      path: 'src/presentation/hooks/useUsers.ts',
      content: `import { useState, useEffect } from 'react';
import type { User } from '../../domain/entities/User';
import { GetUsersUseCase } from '../../domain/usecases/GetUsersUseCase';
import { UserRepositoryImpl } from '../../data/repositories/UserRepositoryImpl';

const useCase = new GetUsersUseCase(new UserRepositoryImpl());

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    useCase.execute().then((data) => {
      setUsers(data);
      setIsLoading(false);
    });
  }, []);

  return { users, isLoading };
}
`,
    },
    {
      path: 'src/presentation/screens/UserListScreen.tsx',
      content: `import { FlatList, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useUsers } from '../hooks/useUsers';
import type { User } from '../../domain/entities/User';

export function UserListScreen() {
  const { users, isLoading } = useUsers();

  if (isLoading) return <ActivityIndicator size="large" />;

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={({ item }: { item: User }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text>{item.email}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  name: { fontWeight: '600', fontSize: 16 },
});
`,
    },
  ],
  postMessages: [
    'Run `npm install`',
    'Run `npx expo start` to launch the dev server',
    'Architecture: Clean (Domain → Data → Presentation)',
  ],
};
