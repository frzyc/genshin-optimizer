import { existsSync, readFileSync, writeFile } from "fs"

export function crawlObject(obj, keys, validate, cb) {
  if (validate(obj)) cb(obj, keys)
  else obj && typeof obj === "object" && Object.entries(obj).forEach(([key, val]) => crawlObject(val, [...keys, key], validate, cb))
}

export function layeredAssignment(obj, keys, value) {
  keys.reduce((accu, key, i, arr) => {
    if (i === arr.length - 1) return (accu[key] = value)
    if (!accu[key]) accu[key] = {}
    return accu[key]
  }, obj)
  return obj
}

export function dumpFile(filename, obj, print = false) {
  const fileStr = JSON.stringify(obj, undefined, 2)
  writeFile(filename, fileStr, () => print && console.log("Generated JSON at", filename))
}

export const FRONTEND_PATH = `${__dirname}/../../../apps/frontend/src` as const
export const DM_PATH = `${__dirname}/../../dm/GenshinData` as const
export const DM2D_PATH = `${__dirname}/../../dm/Texture2D` as const
export function readDMJSON(path: string) {
  const fullPath = `${DM_PATH}/${path}`
  if (!existsSync(fullPath)) throw `File not found :${fullPath}`
  return readFileSync(fullPath).toString()
}
