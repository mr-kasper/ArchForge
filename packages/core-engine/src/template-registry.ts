// ─────────────────────────────────────────────────────────
// Template Registry — maps (stack, architecture) → manifest
// ─────────────────────────────────────────────────────────

import { TemplateManifest, Stack, ArchitectureStyle } from './types';
import { reactCleanManifest, reactFeatureManifest, reactLayeredManifest } from './templates/react';
import { javaCleanManifest, javaLayeredManifest } from './templates/java';
import { dotnetCleanManifest, dotnetLayeredManifest } from './templates/dotnet';

type RegistryKey = `${Stack}:${ArchitectureStyle}`;

const registry: Record<string, TemplateManifest> = {
  'react:clean': reactCleanManifest,
  'react:feature-based': reactFeatureManifest,
  'react:layered': reactLayeredManifest,
  'java:clean': javaCleanManifest,
  'java:layered': javaLayeredManifest,
  'dotnet:clean': dotnetCleanManifest,
  'dotnet:layered': dotnetLayeredManifest,
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
