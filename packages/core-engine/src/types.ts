// ─────────────────────────────────────────────────────────
// ArchForge Core Types
// ─────────────────────────────────────────────────────────

export type Stack = 'react' | 'java' | 'dotnet';
export type ArchitectureStyle = 'clean' | 'layered' | 'feature-based';
export type DatabaseOption = 'postgresql' | 'mysql' | 'none';
export type AuthOption = 'jwt' | 'oauth' | 'none';
export type ToolingOption = 'docker' | 'ci' | 'tests';

export interface ProjectConfig {
  projectName: string;
  stack: Stack;
  architecture: ArchitectureStyle;
  database: DatabaseOption;
  auth: AuthOption;
  tooling: ToolingOption[];
  outputDir: string;
}

export interface TemplateFile {
  /** Relative path inside the generated project (supports EJS interpolation) */
  path: string;
  /** EJS template content */
  content: string;
}

export interface TemplateManifest {
  stack: Stack;
  architecture: ArchitectureStyle;
  files: TemplateFile[];
  /** Optional post-generation instructions shown to the user */
  postMessages?: string[];
}

export interface ArchitectureRule {
  id: string;
  description: string;
  /** Glob pattern for files this rule applies to */
  appliesTo: string;
  /** Validate a file's import statements against the rule */
  validate: (filePath: string, imports: string[]) => RuleViolation[];
}

export interface RuleViolation {
  ruleId: string;
  file: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface GenerationResult {
  success: boolean;
  filesCreated: string[];
  warnings: string[];
  errors: string[];
  postMessages: string[];
}

export interface PluginDefinition {
  name: string;
  version: string;
  description: string;
  /** Additional files to inject into the generated project */
  files: TemplateFile[];
  /** Additional architecture rules provided by this plugin */
  rules?: ArchitectureRule[];
  /** Packages to add to the generated project's dependencies */
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}
