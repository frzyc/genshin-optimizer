import { mkdirSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import * as prettier from 'prettier'

export function dumpFile(filename: string, obj: unknown, print = false) {
  mkdirSync(dirname(filename), { recursive: true })
  const fileStr = JSON.stringify(obj, undefined, 2)
  writeFileSync(filename, fileStr)
  if (print) console.log('Generated JSON at', filename)
}
export async function dumpPrettyFile(filename: string, obj: unknown) {
  mkdirSync(dirname(filename), { recursive: true })
  const prettierRc = await prettier.resolveConfig(filename)
  const fileStr = prettier.format(JSON.stringify(obj), {
    ...prettierRc,
    parser: 'json',
  })

  writeFileSync(filename, fileStr)
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
export async function generateIndexFromObj(obj: object, path: string) {
  const keys = Object.keys(obj)
  if (!keys.length) return
  const isImg = typeof Object.values(obj)[0] === 'string'
  // generate a index.ts using keys
  const imports = Object.entries(obj)
    .map(([k, v]) => `import ${k} from './${isImg ? `${v}.png` : k}'`)
    .join('\n')
  const dataContent = keys
    .sort()
    .map((k) => `  ${k},`)
    .join('\n')

  const prettierRc = await prettier.resolveConfig(path)
  const indexContent = prettier.format(
    `// This is a generated index file.
${imports}

const data = {
${dataContent}
} as const
export default data
`,
    { ...prettierRc, parser: 'typescript' }
  )
  mkdirSync(path, { recursive: true })
  writeFileSync(`${path}/index.ts`, indexContent)

  await Promise.all(
    Object.entries(obj).map(async ([key, val]) => {
      if (typeof val === 'object')
        await generateIndexFromObj(val, `${path}/${key}`)
    })
  )
}
