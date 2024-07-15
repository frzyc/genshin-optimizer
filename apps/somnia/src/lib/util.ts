// TODO: This should be in libs somewhere, not in this app
import * as process from 'process'
export const cwd = process.env['NX_WORKSPACE_ROOT'] ?? process.cwd()

const AMBR_BASE_URL = 'https://api.ambr.top/assets/UI/'
export function createAmbrUrl(
  asset: string,
  base = AMBR_BASE_URL,
  fileExt = '.png'
) {
  return new URL(`${asset}${fileExt}`, base).toString()
}
