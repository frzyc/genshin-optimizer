import { mkdirSync, writeFile, writeFileSync } from 'fs'
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

export function nameToKey(name: string) {
  if (!name) name = ''
  return name
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .map((str) => str.charAt(0).toUpperCase() + str.slice(1))
    .join('')
}

/**
 * Generate index file(index.ts) using a object as the directory structure, starting from a path.
 * @param obj That defines the structure, with leaves being strings for filenames.
 * @param path The starting path
 * @returns
 */
export function generateIndexFromObj(obj: object, path: string) {
  const keys = Object.keys(obj)
  if (!keys.length) return
  const isImg = typeof Object.values(obj)[0] === 'string'
  // generate a index.ts using keys
  const imports = Object.entries(obj)
    .sort(([a], [b]) => (a as string).localeCompare(b))
    .map(([k, v]) => `import ${k} from './${isImg ? `${v}.png` : k}'`)
    .join('\n')
  const dataContent = keys
    .sort()
    .map((k) => `  ${k},`)
    .join('\n')

  const indexContent = `// This is a generated index file.
${imports}

const data = {
${dataContent}
} as const
export default data
`
  writeFileSync(`${path}/index.ts`, indexContent)

  Object.entries(obj).forEach(([key, val]) => {
    if (typeof val === 'object') generateIndexFromObj(val, `${path}/${key}`)
  })
}
