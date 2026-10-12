// Fails `yarn install` early when the local Node major version does not match
// the one pinned in `.nvmrc` (which CI and fnm also use).
//
// Yarn Berry buffers a build script's stdout/stderr into a log file and only
// prints a generic "couldn't be built" line inline. To surface the reason
// without enabling verbose builds globally, we write straight to the
// controlling terminal (`/dev/tty`); that bypasses Yarn's pipe. We fall back to
// stderr when no tty is attached (e.g. CI), where the non-zero exit is enough.
import { closeSync, openSync, readFileSync, writeSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const nvmrc = fileURLToPath(new URL('../../.nvmrc', import.meta.url))
const want = Number.parseInt(readFileSync(nvmrc, 'utf8').trim(), 10)
const have = Number.parseInt(process.versions.node.split('.')[0], 10)

if (have !== want) {
  const msg =
    `\n  This repo requires Node ${want}.x, but you are running ${process.version}.\n` +
    '  Run `fnm use` (or `nvm use`) in this directory to switch, then retry.\n'
  try {
    const tty = openSync('/dev/tty', 'w')
    writeSync(tty, msg)
    closeSync(tty)
  } catch {
    console.error(msg)
  }
  process.exit(1)
}
