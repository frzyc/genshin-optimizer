import { writeFile } from 'fs'

export function dumpFile(filename: string, obj: any, print = false) {
  const fileStr = JSON.stringify(obj, undefined, 2)
  writeFile(
    filename,
    fileStr,
    () => print && console.log('Generated JSON at', filename)
  )
}
