import { existsSync, readFileSync } from 'fs'
import { DM_PATH, HAKUSHIN_PATH } from './consts'

export function readDMJSON(path: string) {
  const fullPath = `${DM_PATH}/${path}`
  if (!existsSync(fullPath)) throw `File not found :${fullPath}`
  return readFileSync(fullPath).toString()
}

export function readHakushinJSON(path: string) {
  const fullPath = `${HAKUSHIN_PATH}/${path}`
  if (!existsSync(fullPath)) throw `File not found :${fullPath}`
  return readFileSync(fullPath).toString()
}
