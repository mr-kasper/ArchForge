// ─────────────────────────────────────────────────────────
// @archforge/core-engine — Public API
// ─────────────────────────────────────────────────────────

export * from './types';
export { generateProject } from './generator';
export { renderTemplate, renderAllTemplates, buildContext } from './template-engine';
export { getTemplateManifest, listAvailableTemplates } from './template-registry';
export {
  validateArchitecture,
  getRulesForArchitecture,
  extractTsImports,
  extractJavaImports,
  extractCSharpImports,
  BUILT_IN_RULES,
} from './rules-engine';
export { loadPlugin, PLUGIN_PREFIX } from './plugin-loader';
export {
  getArchitectureDefinition,
  listArchitectureDefinitions,
  getArchitecturesForStack,
} from './architecture-definitions';
