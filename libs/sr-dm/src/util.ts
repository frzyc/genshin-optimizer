import { existsSync, readFileSync } from 'fs'
import { DM_PATH } from './consts'

export function readDMJSON(path: string) {
  const fullPath = `${DM_PATH}/${path}`
  if (!existsSync(fullPath)) throw `File not found :${fullPath}`
  return readFileSync(fullPath).toString()
}
