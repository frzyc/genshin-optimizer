// TODO: This should be in libs somewhere, not in this app
import * as process from 'process'

export const cwd = process.env['NX_WORKSPACE_ROOT'] ?? process.cwd()
