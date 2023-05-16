import { mkdirSync, writeFile } from 'fs'
import { dirname } from 'path'

export function dumpFile(filename: string, obj: unknown, print = false) {
  mkdirSync(dirname(filename), { recursive: true })
  const fileStr = JSON.stringify(obj, undefined, 2)
  writeFile(
    filename,
    fileStr,
    () => print && console.log('Generated JSON at', filename)
  )
}
