// ─────────────────────────────────────────────────────────
// Plugin Loader — discovers and loads ArchForge plugins
// ─────────────────────────────────────────────────────────

import * as path from 'path';
import * as fs from 'fs-extra';
import { PluginDefinition, TemplateFile, ArchitectureRule } from './types';

const PLUGIN_PREFIX = 'archforge-plugin-';

/**
 * Load a plugin by name from node_modules or a local path.
 */
export async function loadPlugin(nameOrPath: string, basePath: string): Promise<PluginDefinition> {
  // Try local path first
  const localPath = path.resolve(basePath, nameOrPath);
  if (await fs.pathExists(path.join(localPath, 'archforge-plugin.json'))) {
    return loadPluginFromDir(localPath);
  }

  // Try node_modules
  const modulePath = path.resolve(basePath, 'node_modules', `${PLUGIN_PREFIX}${nameOrPath}`);
  if (await fs.pathExists(path.join(modulePath, 'archforge-plugin.json'))) {
    return loadPluginFromDir(modulePath);
  }

  throw new Error(
    `Plugin "${nameOrPath}" not found. Looked in:\n  - ${localPath}\n  - ${modulePath}`,
  );
}

async function loadPluginFromDir(dir: string): Promise<PluginDefinition> {
  const manifestPath = path.join(dir, 'archforge-plugin.json');
  const manifest = await fs.readJSON(manifestPath);

  const files: TemplateFile[] = [];
  const templateDir = path.join(dir, 'templates');

  if (await fs.pathExists(templateDir)) {
    const templateFiles = await collectFiles(templateDir, templateDir);
    files.push(...templateFiles);
  }

  return {
    name: manifest.name,
    version: manifest.version || '1.0.0',
    description: manifest.description || '',
    files,
    dependencies: manifest.dependencies || {},
    devDependencies: manifest.devDependencies || {},
  };
}

async function collectFiles(dir: string, baseDir: string): Promise<TemplateFile[]> {
  const results: TemplateFile[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await collectFiles(fullPath, baseDir);
      results.push(...nested);
    } else {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      const content = await fs.readFile(fullPath, 'utf-8');
      results.push({ path: relativePath, content });
    }
  }

  return results;
}

export { PLUGIN_PREFIX };
