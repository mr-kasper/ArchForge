// ─────────────────────────────────────────────────────────
// Spinner utility — wraps ora for consistent loading UX
// ─────────────────────────────────────────────────────────

import ora, { Ora } from 'ora';

export function createSpinner(text: string): Ora {
  return ora({
    text,
    spinner: 'dots',
  });
}
