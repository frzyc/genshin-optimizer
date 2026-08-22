import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

describe('CLI tests', () => {
  it('should print a message', () => {
    const repoRoot = join(
      dirname(fileURLToPath(import.meta.url)),
      '../../../..'
    )
    const cliPath = join(repoRoot, 'dist/apps/somnia')

    const output = execFileSync('node', [cliPath], {
      cwd: repoRoot,
    }).toString()

    expect(output).toMatch(/Hello World/)
  })
})
