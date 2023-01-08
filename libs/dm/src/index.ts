import { existsSync, readFileSync } from "fs"

export const DM_PATH = `${__dirname}/../GenshinData` as const
export const DM2D_PATH = `${__dirname}/../Texture2D` as const
export function readDMJSON(path: string) {
  const fullPath = `${DM_PATH}/${path}`
  if (!existsSync(fullPath)) throw `File not found :${fullPath}`
  return readFileSync(fullPath).toString()
}
