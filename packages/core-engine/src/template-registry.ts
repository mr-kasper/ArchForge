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

type RegistryKey = `${Stack}:${ArchitectureStyle}`;

const registry: Record<string, TemplateManifest> = {
  // ── Original templates ──────────────────────────────
  'react:clean': reactCleanManifest,
  'react:feature-based': reactFeatureManifest,
  'react:layered': reactLayeredManifest,
  'java:clean': javaCleanManifest,
  'java:layered': javaLayeredManifest,
  'dotnet:clean': dotnetCleanManifest,
  'dotnet:layered': dotnetLayeredManifest,

  // ── Hexagonal (Ports & Adapters) ────────────────────
  'java:hexagonal': javaHexagonalManifest,
  'dotnet:hexagonal': dotnetHexagonalManifest,

  // ── Domain-Driven Design ────────────────────────────
  'java:ddd': javaDDDManifest,
  'dotnet:ddd': dotnetDDDManifest,

  // ── Feature-Sliced Design ───────────────────────────
  'react:feature-sliced': reactFeatureSlicedManifest,

  // ── MVC ─────────────────────────────────────────────
  'java:mvc': javaMVCManifest,
  'dotnet:mvc': dotnetMVCManifest,

  // ── CQRS ────────────────────────────────────────────
  'java:cqrs': javaCQRSManifest,
  'dotnet:cqrs': dotnetCQRSManifest,

  // ── Microservices ───────────────────────────────────
  'java:microservices': javaMicroservicesManifest,
  'dotnet:microservices': dotnetMicroservicesManifest,

  // ── Modular Monolith ────────────────────────────────
  'java:modular-monolith': javaModularMonolithManifest,
  'dotnet:modular-monolith': dotnetModularMonolithManifest,
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
