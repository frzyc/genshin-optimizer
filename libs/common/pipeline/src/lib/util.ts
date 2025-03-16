import { execSync } from 'child_process'
import { mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { workspaceRoot } from '@nx/devkit'

/**
 * Returns Biome formatter path. Assumes, that node_modules have been initialized
 */
function getBiomeExec() {
  return join(
    workspaceRoot,
    'node_modules',
    '@biomejs',
    'biome',
    'bin',
    'biome'
  )
}

export function dumpFile(filename: string, obj: unknown, print = false) {
  mkdirSync(dirname(filename), { recursive: true })
  const fileStr = JSON.stringify(obj, undefined, 2)
  writeFileSync(filename, fileStr)
  if (print) console.log('Generated JSON at', filename)
}
export async function dumpPrettyFile(filename: string, obj: unknown) {
  mkdirSync(dirname(filename), { recursive: true })
  const biomePath = getBiomeExec()
  const fileStr = execSync(
    `node ${biomePath} check --stdin-file-path=${filename} --fix`,
    { input: JSON.stringify(obj) }
  ).toString()

  writeFileSync(filename, fileStr)
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

  const indexContent = `// This is a generated index file.
${imports}

const data = {
${dataContent}
} as const
export default data
`
  const biomePath = getBiomeExec()
  const formatted = execSync(
    `node ${biomePath} check --stdin-file-path=index.ts --fix`,
    {
      input: indexContent,
    }
  ).toString()
  mkdirSync(path, { recursive: true })
  writeFileSync(`${path}/index.ts`, formatted)

  await Promise.all(
    Object.entries(obj).map(async ([key, val]) => {
      if (typeof val === 'object')
        await generateIndexFromObj(val, `${path}/${key}`)
    })
  )
}
