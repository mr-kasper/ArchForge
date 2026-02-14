// ─────────────────────────────────────────────────────────
// Template Registry — maps (stack, architecture) → manifest
// ─────────────────────────────────────────────────────────

import { TemplateManifest, Stack, ArchitectureStyle } from './types';
import { reactCleanManifest, reactFeatureManifest, reactLayeredManifest } from './templates/react';
import { javaCleanManifest, javaLayeredManifest } from './templates/java';
import { dotnetCleanManifest, dotnetLayeredManifest } from './templates/dotnet';
import { javaHexagonalManifest, dotnetHexagonalManifest } from './templates/hexagonal';
import { javaDDDManifest, dotnetDDDManifest } from './templates/ddd';
import { reactFeatureSlicedManifest } from './templates/feature-sliced';
import { javaMVCManifest, dotnetMVCManifest } from './templates/mvc';
import { javaCQRSManifest, dotnetCQRSManifest } from './templates/cqrs';
import { javaMicroservicesManifest, dotnetMicroservicesManifest } from './templates/microservices';
import {
  javaModularMonolithManifest,
  dotnetModularMonolithManifest,
} from './templates/modular-monolith';
import {
  nodejsCleanManifest,
  nodejsLayeredManifest,
  nodejsMVCManifest,
  nodejsModularMonolithManifest,
  nodejsHexagonalManifest,
} from './templates/nodejs';
import { djangoLayeredManifest, djangoMVCManifest, djangoCleanManifest } from './templates/django';
import {
  laravelMVCManifest,
  laravelLayeredManifest,
  laravelModularMonolithManifest,
} from './templates/laravel';
import { nextjsFeatureBasedManifest, nextjsFeatureSlicedManifest } from './templates/nextjs';
import { angularFeatureBasedManifest, angularLayeredManifest } from './templates/angular';
import { vueFeatureBasedManifest } from './templates/vue';
import {
  reactNativeFeatureBasedManifest,
  reactNativeCleanManifest,
} from './templates/react-native';
import { flutterCleanManifest, flutterLayeredManifest } from './templates/flutter';

type RegistryKey = `${Stack}:${ArchitectureStyle}`;

const registry: Record<string, TemplateManifest> = {
  // ── React ───────────────────────────────────────────
  'react:clean': reactCleanManifest,
  'react:feature-based': reactFeatureManifest,
  'react:layered': reactLayeredManifest,
  'react:feature-sliced': reactFeatureSlicedManifest,

  // ── Java (Spring Boot) ──────────────────────────────
  'java:clean': javaCleanManifest,
  'java:layered': javaLayeredManifest,
  'java:hexagonal': javaHexagonalManifest,
  'java:ddd': javaDDDManifest,
  'java:mvc': javaMVCManifest,
  'java:cqrs': javaCQRSManifest,
  'java:microservices': javaMicroservicesManifest,
  'java:modular-monolith': javaModularMonolithManifest,

  // ── .NET (ASP.NET Core) ─────────────────────────────
  'dotnet:clean': dotnetCleanManifest,
  'dotnet:layered': dotnetLayeredManifest,
  'dotnet:hexagonal': dotnetHexagonalManifest,
  'dotnet:ddd': dotnetDDDManifest,
  'dotnet:mvc': dotnetMVCManifest,
  'dotnet:cqrs': dotnetCQRSManifest,
  'dotnet:microservices': dotnetMicroservicesManifest,
  'dotnet:modular-monolith': dotnetModularMonolithManifest,

  // ── Node.js (Express) ──────────────────────────────
  'nodejs:clean': nodejsCleanManifest,
  'nodejs:layered': nodejsLayeredManifest,
  'nodejs:mvc': nodejsMVCManifest,
  'nodejs:modular-monolith': nodejsModularMonolithManifest,
  'nodejs:hexagonal': nodejsHexagonalManifest,

  // ── Django (Python) ─────────────────────────────────
  'django:layered': djangoLayeredManifest,
  'django:mvc': djangoMVCManifest,
  'django:clean': djangoCleanManifest,

  // ── Laravel (PHP) ───────────────────────────────────
  'laravel:mvc': laravelMVCManifest,
  'laravel:layered': laravelLayeredManifest,
  'laravel:modular-monolith': laravelModularMonolithManifest,

  // ── Next.js ─────────────────────────────────────────
  'nextjs:feature-based': nextjsFeatureBasedManifest,
  'nextjs:feature-sliced': nextjsFeatureSlicedManifest,

  // ── Angular ─────────────────────────────────────────
  'angular:feature-based': angularFeatureBasedManifest,
  'angular:layered': angularLayeredManifest,

  // ── Vue.js ──────────────────────────────────────────
  'vue:feature-based': vueFeatureBasedManifest,

  // ── React Native ────────────────────────────────────
  'react-native:feature-based': reactNativeFeatureBasedManifest,
  'react-native:clean': reactNativeCleanManifest,

  // ── Flutter ─────────────────────────────────────────
  'flutter:clean': flutterCleanManifest,
  'flutter:layered': flutterLayeredManifest,
};

/**
 * Retrieve a template manifest by stack + architecture style.
 */
export function getTemplateManifest(
  stack: Stack,
  architecture: ArchitectureStyle,
): TemplateManifest | undefined {
  const key: RegistryKey = `${stack}:${architecture}`;
  return registry[key];
}

/**
 * List all available (stack, architecture) combinations.
 */
export function listAvailableTemplates(): Array<{ stack: Stack; architecture: ArchitectureStyle }> {
  return Object.keys(registry).map((key) => {
    const [stack, architecture] = key.split(':') as [Stack, ArchitectureStyle];
    return { stack, architecture };
  });
}
