import { writeFile } from 'fs'

export function dumpFile(filename, obj, print = false) {
  const fileStr = JSON.stringify(obj, undefined, 2)
  writeFile(
    filename,
    fileStr,
    () => print && console.log('Generated JSON at', filename)
  )
}
