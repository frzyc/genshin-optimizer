import { existsSync, readFileSync } from 'fs'
import { DM_PATH, HAKUSHIN_PATH } from './consts'

export function readDMJSON(path: string, root?: string) {
  const fullPath = `${root ? `${root}/libs/zzz/dm/ZenlessData` : DM_PATH}/${path}`
  if (!existsSync(fullPath)) throw `File not found :${fullPath}`
  return readFileSync(fullPath).toString()
}

export function readHakushinJSON(path: string) {
  const fullPath = `${HAKUSHIN_PATH}/${path}`
  if (!existsSync(fullPath)) throw `File not found :${fullPath}`
  return readFileSync(fullPath).toString()
}
