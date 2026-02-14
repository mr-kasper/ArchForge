// ─────────────────────────────────────────────────────────
// Node.js Templates — Clean, Layered, MVC, Modular Monolith, Hexagonal
// Express + TypeScript
// ─────────────────────────────────────────────────────────

import { TemplateManifest } from '../types';

// ── Shared files ────────────────────────────────────────

const packageJson = {
  path: 'package.json',
  content: `{
  "name": "<%= projectName %>",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src/",
    "test": "vitest run"
  },
  "dependencies": {
    "express": "^5.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.5.0"<% if (database === 'postgresql') { %>,
    "pg": "^8.13.0"<% } else if (database === 'mysql') { %>,
    "mysql2": "^3.12.0"<% } else if (database === 'mongodb') { %>,
    "mongoose": "^8.10.0"<% } %><% if (orm === 'prisma') { %>,
    "@prisma/client": "^6.5.0"<% } else if (orm === 'typeorm') { %>,
    "typeorm": "^0.3.21",
    "reflect-metadata": "^0.2.2"<% } %><% if (auth === 'jwt') { %>,
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^3.0.2"<% } %><% if (validation === 'zod') { %>,
    "zod": "^4.3.0"<% } else if (validation === 'class-validator') { %>,
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1"<% } %><% if (logging === 'winston') { %>,
    "winston": "^3.17.0"<% } %>
  },
  "devDependencies": {
    "@types/express": "^5.0.2",
    "@types/cors": "^2.8.17",
    "@types/node": "^22.15.0",
    "typescript": "^5.9.0",
    "tsx": "^4.19.0",
    "vitest": "^3.1.0",
    "eslint": "^9.25.0"<% if (orm === 'prisma') { %>,
    "prisma": "^6.5.0"<% } %><% if (auth === 'jwt') { %>,
    "@types/jsonwebtoken": "^9.0.9",
    "@types/bcryptjs": "^2.4.6"<% } %>
  }
}
`,
};

const tsconfig = {
  path: 'tsconfig.json',
  content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true<% if (orm === 'typeorm') { %>,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true<% } %>
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
`,
};

const envFile = {
  path: '.env',
  content: `PORT=<%= port %>
NODE_ENV=development
<% if (database === 'postgresql') { %>DATABASE_URL=postgresql://postgres:postgres@localhost:5432/<%= projectName %>
<% } else if (database === 'mysql') { %>DATABASE_URL=mysql://root:root@localhost:3306/<%= projectName %>
<% } else if (database === 'mongodb') { %>DATABASE_URL=mongodb://localhost:27017/<%= projectName %>
<% } %><% if (auth === 'jwt') { %>JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
<% } %>`,
};

const gitignore = {
  path: '.gitignore',
  content: `node_modules/
dist/
.env
*.log
coverage/
`,
};

// ── Clean Architecture ──────────────────────────────────

export const nodejsCleanManifest: TemplateManifest = {
  stack: 'nodejs',
  architecture: 'clean',
  files: [
    packageJson,
    tsconfig,
    envFile,
    gitignore,
    {
      path: 'src/index.ts',
      content: `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { userRouter } from './presentation/routes/userRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || <%= port %>;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(\`Server running on http://localhost:\${port}\`);
});

export default app;
`,
    },
    {
      path: 'src/domain/entities/User.ts',
      content: `export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
`,
    },
    {
      path: 'src/domain/repositories/UserRepository.ts',
      content: `import { User } from '../entities/User.js';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}
`,
    },
    {
      path: 'src/application/use-cases/GetUsersUseCase.ts',
      content: `import { User } from '../../domain/entities/User.js';
import { UserRepository } from '../../domain/repositories/UserRepository.js';

export class GetUsersUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepo.findAll();
  }
}
`,
    },
    {
      path: 'src/application/use-cases/CreateUserUseCase.ts',
      content: `import { User } from '../../domain/entities/User.js';
import { UserRepository } from '../../domain/repositories/UserRepository.js';

interface CreateUserDTO {
  email: string;
  name: string;
}

export class CreateUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(dto: CreateUserDTO): Promise<User> {
    return this.userRepo.create(dto);
  }
}
`,
    },
    {
      path: 'src/infrastructure/repositories/InMemoryUserRepository.ts',
      content: `import { User } from '../../domain/entities/User.js';
import { UserRepository } from '../../domain/repositories/UserRepository.js';
import crypto from 'crypto';

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) ?? null;
  }

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    this.users[idx] = { ...this.users[idx], ...data, updatedAt: new Date() };
    return this.users[idx];
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter(u => u.id !== id);
  }
}
`,
    },
    {
      path: 'src/presentation/routes/userRoutes.ts',
      content: `import { Router } from 'express';
import { GetUsersUseCase } from '../../application/use-cases/GetUsersUseCase.js';
import { CreateUserUseCase } from '../../application/use-cases/CreateUserUseCase.js';
import { InMemoryUserRepository } from '../../infrastructure/repositories/InMemoryUserRepository.js';

const router = Router();
const userRepo = new InMemoryUserRepository();

router.get('/', async (_req, res) => {
  const useCase = new GetUsersUseCase(userRepo);
  const users = await useCase.execute();
  res.json(users);
});

router.post('/', async (req, res) => {
  const useCase = new CreateUserUseCase(userRepo);
  const user = await useCase.execute(req.body);
  res.status(201).json(user);
});

export { router as userRouter };
`,
    },
  ],
  postMessages: [
    'Run `npm install` to install dependencies',
    'Run `npm run dev` to start in development mode',
    'Architecture: Clean Architecture (Domain → Application → Infrastructure → Presentation)',
  ],
};

// ── Layered Architecture ────────────────────────────────

export const nodejsLayeredManifest: TemplateManifest = {
  stack: 'nodejs',
  architecture: 'layered',
  files: [
    packageJson,
    tsconfig,
    envFile,
    gitignore,
    {
      path: 'src/index.ts',
      content: `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { userRouter } from './controllers/userController.js';

dotenv.config();

const app = express();
const port = process.env.PORT || <%= port %>;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(\`Server running on http://localhost:\${port}\`);
});

export default app;
`,
    },
    {
      path: 'src/models/User.ts',
      content: `export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}
`,
    },
    {
      path: 'src/repositories/userRepository.ts',
      content: `import { User } from '../models/User.js';
import crypto from 'crypto';

const users: User[] = [];

export const userRepository = {
  findAll: async (): Promise<User[]> => [...users],

  findById: async (id: string): Promise<User | undefined> =>
    users.find(u => u.id === id),

  create: async (data: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const user: User = { ...data, id: crypto.randomUUID(), createdAt: new Date() };
    users.push(user);
    return user;
  },
};
`,
    },
    {
      path: 'src/services/userService.ts',
      content: `import { userRepository } from '../repositories/userRepository.js';

export const userService = {
  getAll: () => userRepository.findAll(),
  getById: (id: string) => userRepository.findById(id),
  create: (data: { email: string; name: string }) => userRepository.create(data),
};
`,
    },
    {
      path: 'src/controllers/userController.ts',
      content: `import { Router } from 'express';
import { userService } from '../services/userService.js';

const router = Router();

router.get('/', async (_req, res) => {
  const users = await userService.getAll();
  res.json(users);
});

router.post('/', async (req, res) => {
  const user = await userService.create(req.body);
  res.status(201).json(user);
});

export { router as userRouter };
`,
    },
  ],
  postMessages: [
    'Run `npm install` then `npm run dev`',
    'Architecture: Layered (Controllers → Services → Repositories → Models)',
  ],
};

// ── MVC ─────────────────────────────────────────────────

export const nodejsMVCManifest: TemplateManifest = {
  stack: 'nodejs',
  architecture: 'mvc',
  files: [
    packageJson,
    tsconfig,
    envFile,
    gitignore,
    {
      path: 'src/index.ts',
      content: `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { userRouter } from './controllers/UserController.js';

dotenv.config();

const app = express();
const port = process.env.PORT || <%= port %>;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(\`Server running on http://localhost:\${port}\`);
});

export default app;
`,
    },
    {
      path: 'src/models/User.ts',
      content: `export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}
`,
    },
    {
      path: 'src/services/UserService.ts',
      content: `import { User } from '../models/User.js';
import crypto from 'crypto';

const users: User[] = [];

export class UserService {
  async findAll(): Promise<User[]> {
    return [...users];
  }

  async create(data: { email: string; name: string }): Promise<User> {
    const user: User = { ...data, id: crypto.randomUUID(), createdAt: new Date() };
    users.push(user);
    return user;
  }
}
`,
    },
    {
      path: 'src/controllers/UserController.ts',
      content: `import { Router, Request, Response } from 'express';
import { UserService } from '../services/UserService.js';

const router = Router();
const userService = new UserService();

router.get('/', async (_req: Request, res: Response) => {
  const users = await userService.findAll();
  res.json(users);
});

router.post('/', async (req: Request, res: Response) => {
  const user = await userService.create(req.body);
  res.status(201).json(user);
});

export { router as userRouter };
`,
    },
    {
      path: 'src/views/README.md',
      content: `# Views

This directory contains response templates and serializers.
For API-only projects, views are JSON responses handled by controllers.
`,
    },
  ],
  postMessages: [
    'Run `npm install` then `npm run dev`',
    'Architecture: MVC (Models → Views → Controllers + Services)',
  ],
};

// ── Modular Monolith ────────────────────────────────────

export const nodejsModularMonolithManifest: TemplateManifest = {
  stack: 'nodejs',
  architecture: 'modular-monolith',
  files: [
    packageJson,
    tsconfig,
    envFile,
    gitignore,
    {
      path: 'src/index.ts',
      content: `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { usersModule } from './modules/users/api/routes.js';
import { ordersModule } from './modules/orders/api/routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || <%= port %>;

app.use(cors());
app.use(express.json());

// Mount modules
app.use('/api/users', usersModule);
app.use('/api/orders', ordersModule);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(\`Server running on http://localhost:\${port}\`);
});

export default app;
`,
    },
    {
      path: 'src/modules/users/api/routes.ts',
      content: `import { Router } from 'express';
import { UserService } from '../internal/UserService.js';

const router = Router();
const userService = new UserService();

router.get('/', async (_req, res) => {
  const users = await userService.findAll();
  res.json(users);
});

router.post('/', async (req, res) => {
  const user = await userService.create(req.body);
  res.status(201).json(user);
});

export { router as usersModule };
`,
    },
    {
      path: 'src/modules/users/internal/UserService.ts',
      content: `import crypto from 'crypto';

interface User {
  id: string;
  email: string;
  name: string;
}

const users: User[] = [];

export class UserService {
  async findAll(): Promise<User[]> { return [...users]; }

  async create(data: { email: string; name: string }): Promise<User> {
    const user: User = { ...data, id: crypto.randomUUID() };
    users.push(user);
    return user;
  }
}
`,
    },
    {
      path: 'src/modules/orders/api/routes.ts',
      content: `import { Router } from 'express';
import { OrderService } from '../internal/OrderService.js';

const router = Router();
const orderService = new OrderService();

router.get('/', async (_req, res) => {
  const orders = await orderService.findAll();
  res.json(orders);
});

export { router as ordersModule };
`,
    },
    {
      path: 'src/modules/orders/internal/OrderService.ts',
      content: `interface Order {
  id: string;
  userId: string;
  total: number;
}

const orders: Order[] = [];

export class OrderService {
  async findAll(): Promise<Order[]> { return [...orders]; }
}
`,
    },
    {
      path: 'src/shared/events/EventBus.ts',
      content: `type Handler = (payload: unknown) => void;

class EventBus {
  private handlers = new Map<string, Handler[]>();

  on(event: string, handler: Handler): void {
    const list = this.handlers.get(event) || [];
    list.push(handler);
    this.handlers.set(event, list);
  }

  emit(event: string, payload: unknown): void {
    const list = this.handlers.get(event) || [];
    list.forEach(h => h(payload));
  }
}

export const eventBus = new EventBus();
`,
    },
  ],
  postMessages: [
    'Run `npm install` then `npm run dev`',
    'Architecture: Modular Monolith (isolated modules with public APIs)',
  ],
};

// ── Hexagonal ───────────────────────────────────────────

export const nodejsHexagonalManifest: TemplateManifest = {
  stack: 'nodejs',
  architecture: 'hexagonal',
  files: [
    packageJson,
    tsconfig,
    envFile,
    gitignore,
    {
      path: 'src/index.ts',
      content: `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { userRouter } from './adapters/inbound/rest/userRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || <%= port %>;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(\`Server running on http://localhost:\${port}\`);
});

export default app;
`,
    },
    {
      path: 'src/domain/entities/User.ts',
      content: `export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}
`,
    },
    {
      path: 'src/ports/inbound/UserUseCase.ts',
      content: `import { User } from '../../domain/entities/User.js';

export interface UserUseCase {
  findAll(): Promise<User[]>;
  create(data: { email: string; name: string }): Promise<User>;
}
`,
    },
    {
      path: 'src/ports/outbound/UserPersistence.ts',
      content: `import { User } from '../../domain/entities/User.js';

export interface UserPersistence {
  findAll(): Promise<User[]>;
  save(user: User): Promise<User>;
}
`,
    },
    {
      path: 'src/application/services/UserApplicationService.ts',
      content: `import { User } from '../../domain/entities/User.js';
import { UserUseCase } from '../../ports/inbound/UserUseCase.js';
import { UserPersistence } from '../../ports/outbound/UserPersistence.js';
import crypto from 'crypto';

export class UserApplicationService implements UserUseCase {
  constructor(private readonly persistence: UserPersistence) {}

  async findAll(): Promise<User[]> {
    return this.persistence.findAll();
  }

  async create(data: { email: string; name: string }): Promise<User> {
    const user: User = { ...data, id: crypto.randomUUID(), createdAt: new Date() };
    return this.persistence.save(user);
  }
}
`,
    },
    {
      path: 'src/adapters/outbound/persistence/InMemoryUserPersistence.ts',
      content: `import { User } from '../../../domain/entities/User.js';
import { UserPersistence } from '../../../ports/outbound/UserPersistence.js';

export class InMemoryUserPersistence implements UserPersistence {
  private users: User[] = [];

  async findAll(): Promise<User[]> { return [...this.users]; }

  async save(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }
}
`,
    },
    {
      path: 'src/adapters/inbound/rest/userRoutes.ts',
      content: `import { Router } from 'express';
import { UserApplicationService } from '../../../application/services/UserApplicationService.js';
import { InMemoryUserPersistence } from '../../outbound/persistence/InMemoryUserPersistence.js';

const router = Router();
const persistence = new InMemoryUserPersistence();
const userService = new UserApplicationService(persistence);

router.get('/', async (_req, res) => {
  const users = await userService.findAll();
  res.json(users);
});

router.post('/', async (req, res) => {
  const user = await userService.create(req.body);
  res.status(201).json(user);
});

export { router as userRouter };
`,
    },
  ],
  postMessages: [
    'Run `npm install` then `npm run dev`',
    'Architecture: Hexagonal (Domain ↔ Ports ↔ Adapters)',
  ],
};
