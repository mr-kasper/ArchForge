// ─────────────────────────────────────────────────────────
// Template Engine — renders EJS templates into files
// ─────────────────────────────────────────────────────────

import * as ejs from 'ejs';
import * as path from 'path';
import * as fs from 'fs-extra';
import { ProjectConfig, TemplateFile } from './types';

export interface RenderContext {
  projectName: string;
  stack: string;
  architecture: string;
  database: string;
  auth: string;
  tooling: string[];
  packageManager: string;
  apiStyle: string;
  cssFramework: string;
  stateManagement: string;
  orm: string;
  logging: string;
  validation: string;
  port: number;
  year: number;
  [key: string]: unknown;
}

function buildContext(config: ProjectConfig): RenderContext {
  return {
    projectName: config.projectName,
    stack: config.stack,
    architecture: config.architecture,
    database: config.database,
    auth: config.auth,
    tooling: config.tooling,
    packageManager: config.packageManager || 'npm',
    apiStyle: config.apiStyle || 'rest',
    cssFramework: config.cssFramework || 'none',
    stateManagement: config.stateManagement || 'none',
    orm: config.orm || 'none',
    logging: config.logging || 'none',
    validation: config.validation || 'none',
    port: config.port || 8080,
    year: new Date().getFullYear(),
  };
}

/**
 * Render a single template file's content using EJS.
 */
export function renderTemplate(template: string, context: RenderContext): string {
  return ejs.render(template, context, { async: false });
}

/**
 * Render the file path (supports EJS interpolation in paths).
 */
export function renderPath(templatePath: string, context: RenderContext): string {
  return ejs.render(templatePath, context, { async: false });
}

/**
 * Render all template files and write them to the output directory.
 * Returns the list of created file paths (relative to outputDir).
 */
export async function renderAllTemplates(
  templates: TemplateFile[],
  config: ProjectConfig,
): Promise<string[]> {
  const context = buildContext(config);
  const created: string[] = [];

  for (const tpl of templates) {
    const relativePath = renderPath(tpl.path, context);
    const absolutePath = path.join(config.outputDir, relativePath);

    await fs.ensureDir(path.dirname(absolutePath));

    const content = renderTemplate(tpl.content, context);
    await fs.writeFile(absolutePath, content, 'utf-8');

    created.push(relativePath);
  }

  return created;
}

export { buildContext };
