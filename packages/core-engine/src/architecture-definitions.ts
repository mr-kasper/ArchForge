// ─────────────────────────────────────────────────────────
// Architecture Definitions — declarative architecture configs
// Maps each architecture style to its layers, constraints, and rules
// ─────────────────────────────────────────────────────────

import { ArchitectureDefinition, ArchitectureStyle } from './types';

export const ARCHITECTURE_DEFINITIONS: Record<string, ArchitectureDefinition> = {
  clean: {
    id: 'clean',
    name: 'Clean Architecture',
    description:
      'Dependency inversion with Domain at the core, surrounded by Application, Infrastructure, and Presentation',
    layers: [
      {
        name: 'domain',
        description: 'Entities, value objects, repository interfaces',
        directory: 'domain',
      },
      {
        name: 'application',
        description: 'Use cases, application services, DTOs',
        directory: 'application',
      },
      {
        name: 'infrastructure',
        description: 'Database, external services, framework implementations',
        directory: 'infrastructure',
      },
      {
        name: 'presentation',
        description: 'Controllers, views, API endpoints',
        directory: 'presentation',
      },
    ],
    importConstraints: [
      { from: 'domain', forbidden: ['infrastructure', 'presentation', 'application'] },
      { from: 'application', forbidden: ['infrastructure', 'presentation'] },
      { from: 'infrastructure', forbidden: ['presentation'] },
    ],
    defaultModules: {
      domain: ['entities', 'repositories', 'value-objects'],
      application: ['use-cases', 'services', 'dtos'],
      infrastructure: ['persistence', 'api', 'config'],
      presentation: ['controllers', 'middleware'],
    },
    rules: [],
    supportedStacks: ['react', 'java', 'dotnet', 'nodejs', 'django', 'react-native'],
  },

  layered: {
    id: 'layered',
    name: 'Layered Architecture',
    description: 'Traditional layers: Presentation → Business Logic → Data Access',
    layers: [
      { name: 'models', description: 'Data models and entities', directory: 'models' },
      { name: 'repositories', description: 'Data access layer', directory: 'repositories' },
      { name: 'services', description: 'Business logic layer', directory: 'services' },
      { name: 'controllers', description: 'Presentation / API layer', directory: 'controllers' },
    ],
    importConstraints: [
      { from: 'models', forbidden: ['repositories', 'services', 'controllers'] },
      { from: 'repositories', forbidden: ['services', 'controllers'] },
      { from: 'services', forbidden: ['controllers'] },
    ],
    defaultModules: {
      models: ['User'],
      repositories: ['UserRepository'],
      services: ['UserService'],
      controllers: ['UserController'],
    },
    rules: [],
    supportedStacks: [
      'react',
      'java',
      'dotnet',
      'nodejs',
      'django',
      'laravel',
      'angular',
      'flutter',
    ],
  },

  'feature-based': {
    id: 'feature-based',
    name: 'Feature-based Architecture',
    description: 'Self-contained feature modules with shared utilities',
    layers: [
      {
        name: 'shared',
        description: 'Shared components, hooks, and utilities',
        directory: 'shared',
      },
      { name: 'features', description: 'Self-contained feature modules', directory: 'features' },
      { name: 'app', description: 'Application shell, routing, providers', directory: 'app' },
    ],
    importConstraints: [{ from: 'features/*', forbidden: ['features/*'] }],
    defaultModules: {
      shared: ['components', 'hooks', 'utils'],
      features: ['auth', 'home'],
      app: ['App', 'providers'],
    },
    rules: [],
    supportedStacks: ['react', 'nextjs', 'angular', 'vue', 'react-native'],
  },

  hexagonal: {
    id: 'hexagonal',
    name: 'Hexagonal Architecture (Ports & Adapters)',
    description:
      'Business logic at the core with ports (interfaces) and adapters (implementations)',
    layers: [
      { name: 'domain', description: 'Core business logic, entities', directory: 'domain' },
      { name: 'ports', description: 'Inbound and outbound port interfaces', directory: 'ports' },
      {
        name: 'application',
        description: 'Application services orchestrating ports',
        directory: 'application',
      },
      {
        name: 'adapters',
        description: 'Inbound (API) and outbound (DB, messaging) adapters',
        directory: 'adapters',
      },
    ],
    importConstraints: [
      { from: 'domain', forbidden: ['adapters', 'application'] },
      { from: 'ports', forbidden: ['adapters', 'application'] },
      { from: 'application', forbidden: ['adapters'] },
    ],
    defaultModules: {
      domain: ['entities', 'value-objects', 'exceptions'],
      ports: ['inbound', 'outbound'],
      application: ['services'],
      adapters: ['inbound/rest', 'outbound/persistence', 'outbound/messaging'],
    },
    rules: [],
    supportedStacks: ['java', 'dotnet', 'nodejs'],
  },

  ddd: {
    id: 'ddd',
    name: 'Domain-Driven Design (Tactical)',
    description:
      'Rich domain model with Aggregates, Value Objects, Repositories, and Bounded Contexts',
    layers: [
      {
        name: 'domain',
        description: 'Aggregates, entities, value objects, domain services, domain events',
        directory: 'domain',
      },
      {
        name: 'application',
        description: 'Application services, command/query handlers, DTOs',
        directory: 'application',
      },
      {
        name: 'infrastructure',
        description: 'Persistence, messaging, external integrations',
        directory: 'infrastructure',
      },
      {
        name: 'presentation',
        description: 'API controllers, GraphQL resolvers',
        directory: 'presentation',
      },
    ],
    importConstraints: [
      { from: 'domain', forbidden: ['infrastructure', 'presentation', 'application'] },
      { from: 'application', forbidden: ['presentation'] },
    ],
    defaultModules: {
      domain: [
        'model/aggregates',
        'model/entities',
        'model/value-objects',
        'service',
        'repository',
        'event',
      ],
      application: ['service', 'dto', 'command', 'query'],
      infrastructure: ['persistence', 'messaging', 'config'],
      presentation: ['controller', 'dto'],
    },
    rules: [],
    supportedStacks: ['java', 'dotnet'],
  },

  'feature-sliced': {
    id: 'feature-sliced',
    name: 'Feature-Sliced Design',
    description:
      'Modern scalable frontend architecture with app, processes, pages, features, entities, shared layers',
    layers: [
      { name: 'shared', description: 'Shared UI kit, utilities, configs', directory: 'shared' },
      {
        name: 'entities',
        description: 'Business entities (user, product, etc.)',
        directory: 'entities',
      },
      {
        name: 'features',
        description: 'User interactions (auth, comments, etc.)',
        directory: 'features',
      },
      {
        name: 'widgets',
        description: 'Composite UI blocks combining entities + features',
        directory: 'widgets',
      },
      { name: 'pages', description: 'Routing pages composing widgets', directory: 'pages' },
      {
        name: 'app',
        description: 'App initialization, providers, global styles',
        directory: 'app',
      },
    ],
    importConstraints: [
      { from: 'shared', forbidden: ['entities', 'features', 'widgets', 'pages', 'app'] },
      { from: 'entities', forbidden: ['features', 'widgets', 'pages', 'app'] },
      { from: 'features', forbidden: ['widgets', 'pages', 'app'] },
      { from: 'widgets', forbidden: ['pages', 'app'] },
      { from: 'pages', forbidden: ['app'] },
    ],
    defaultModules: {
      shared: ['ui', 'lib', 'config'],
      entities: ['user', 'product'],
      features: ['auth', 'search'],
      widgets: ['header', 'sidebar'],
      pages: ['home', 'profile'],
      app: ['providers', 'styles'],
    },
    rules: [],
    supportedStacks: ['react', 'nextjs'],
  },

  mvc: {
    id: 'mvc',
    name: 'MVC (Model-View-Controller)',
    description:
      'Classic pattern — Controllers handle requests, Services contain logic, Models define data',
    layers: [
      { name: 'models', description: 'Data models and entities', directory: 'models' },
      { name: 'services', description: 'Business logic', directory: 'services' },
      { name: 'controllers', description: 'Request handlers', directory: 'controllers' },
      { name: 'views', description: 'Response templates / serializers', directory: 'views' },
    ],
    importConstraints: [
      { from: 'models', forbidden: ['controllers', 'views'] },
      { from: 'services', forbidden: ['controllers', 'views'] },
    ],
    defaultModules: {
      models: ['User'],
      services: ['UserService'],
      controllers: ['UserController'],
      views: ['templates'],
    },
    rules: [],
    supportedStacks: ['java', 'dotnet', 'nodejs', 'django', 'laravel'],
  },

  cqrs: {
    id: 'cqrs',
    name: 'CQRS (Command Query Responsibility Segregation)',
    description: 'Separate read and write models with dedicated command/query handlers',
    layers: [
      { name: 'domain', description: 'Domain entities and write model', directory: 'domain' },
      {
        name: 'commands',
        description: 'Command definitions and handlers (write side)',
        directory: 'commands',
      },
      {
        name: 'queries',
        description: 'Query definitions and handlers (read side)',
        directory: 'queries',
      },
      { name: 'read-model', description: 'Read-optimized projections', directory: 'read-model' },
      {
        name: 'infrastructure',
        description: 'Persistence, messaging, event bus',
        directory: 'infrastructure',
      },
      {
        name: 'presentation',
        description: 'API endpoints dispatching commands/queries',
        directory: 'presentation',
      },
    ],
    importConstraints: [
      {
        from: 'domain',
        forbidden: ['commands', 'queries', 'read-model', 'infrastructure', 'presentation'],
      },
      { from: 'commands', forbidden: ['queries', 'read-model', 'presentation'] },
      { from: 'queries', forbidden: ['commands', 'presentation'] },
      { from: 'read-model', forbidden: ['commands', 'presentation'] },
    ],
    defaultModules: {
      domain: ['entities', 'events', 'value-objects'],
      commands: ['handlers', 'definitions'],
      queries: ['handlers', 'definitions'],
      'read-model': ['projections'],
      infrastructure: ['persistence', 'event-bus'],
      presentation: ['controllers'],
    },
    rules: [],
    supportedStacks: ['java', 'dotnet'],
  },

  microservices: {
    id: 'microservices',
    name: 'Microservices Architecture',
    description:
      'Distributed services with API gateway, service communication, and independent deployments',
    layers: [
      { name: 'gateway', description: 'API gateway / reverse proxy', directory: 'gateway' },
      { name: 'services', description: 'Independent microservices', directory: 'services' },
      { name: 'shared', description: 'Shared contracts, DTOs, events', directory: 'shared' },
    ],
    importConstraints: [{ from: 'services/*', forbidden: ['services/*'] }],
    defaultModules: {
      gateway: ['config', 'routes'],
      services: ['auth-service', 'user-service', 'order-service'],
      shared: ['contracts', 'events', 'dto'],
    },
    rules: [],
    supportedStacks: ['java', 'dotnet'],
  },

  'modular-monolith': {
    id: 'modular-monolith',
    name: 'Modular Monolith',
    description: 'Clear module boundaries without the complexity of distributed systems',
    layers: [
      { name: 'shared', description: 'Cross-cutting concerns, shared kernel', directory: 'shared' },
      {
        name: 'modules',
        description: 'Self-contained business modules with internal layering',
        directory: 'modules',
      },
      {
        name: 'host',
        description: 'Application host, composition root, startup',
        directory: 'host',
      },
    ],
    importConstraints: [{ from: 'modules/*', forbidden: ['modules/*'] }],
    defaultModules: {
      shared: ['kernel', 'contracts', 'events'],
      modules: ['users', 'billing', 'notifications'],
      host: ['startup', 'config'],
    },
    rules: [],
    supportedStacks: ['java', 'dotnet', 'nodejs', 'laravel'],
  },
};

/**
 * Get the architecture definition for a given style.
 */
export function getArchitectureDefinition(
  style: ArchitectureStyle,
): ArchitectureDefinition | undefined {
  return ARCHITECTURE_DEFINITIONS[style];
}

/**
 * List all architecture definitions.
 */
export function listArchitectureDefinitions(): ArchitectureDefinition[] {
  return Object.values(ARCHITECTURE_DEFINITIONS);
}

/**
 * Get architectures available for a given stack.
 */
export function getArchitecturesForStack(stack: string): ArchitectureDefinition[] {
  return Object.values(ARCHITECTURE_DEFINITIONS).filter((def) =>
    def.supportedStacks.includes(stack as any),
  );
}
