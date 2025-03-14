// TODO: This should be in libs somewhere, not in this app
import * as process from 'process'
export const cwd = process.env['NX_WORKSPACE_ROOT'] ?? process.cwd()

const GI_BASE_URL = 'https://gi.yatta.moe/assets/UI/'
export function giURL(
  asset: string,
  category = '.',
  base = GI_BASE_URL,
  fileExt = '.png',
) {
  return new URL(`${category}/${asset}${fileExt}`, base).toString()
}
const HSR_BASE_URL = 'https://sr.yatta.moe/hsr/assets/UI/'
export function hsrURL(category: string, asset: string, base = HSR_BASE_URL) {
  const path = asset.split('/')
  const name = path[path.length - 1]
  return new URL(`${category}/${name}`, base).toString()
}
