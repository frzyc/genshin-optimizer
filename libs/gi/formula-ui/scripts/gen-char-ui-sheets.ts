/**
 * @deprecated Use `gen-ui-sheets.ts --all-missing` instead.
 * Thin wrapper kept for existing docs / muscle memory.
 */
import { execSync } from 'node:child_process'

execSync(
  'ts-node --project libs/gi/formula-ui/tsconfig.lib.json libs/gi/formula-ui/scripts/gen-ui-sheets.ts --all-missing',
  { stdio: 'inherit', cwd: process.cwd() }
)
