import { spawn } from 'child_process'
import { mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { workspaceRoot } from '@nx/devkit'

/**
 * Formats text, returns formatted text. This function does not write directly to the provided file path.
 * File path is only used for determining type of parser
 * @param path Full path to file to get formatted, used for formatter to determine parser type
 * @param text Contents to be formatted
 */
export async function formatText(path: string, text: string): Promise<string> {
  const biomePath = join(
    workspaceRoot,
    'node_modules',
    '@biomejs',
    'biome',
    'bin',
    'biome'
  )
  const biomeConfigPath = join(workspaceRoot, 'biome.json')

  return new Promise((resolve, reject) => {
    const spawnedProcess = spawn('node', [
      biomePath,
      'check',
      `--stdin-file-path=${path}`,
      `--config-path=${biomeConfigPath}`,
      '--formatter-enabled=true',
      '--organize-imports-enabled=true',
      '--linter-enabled=false',
      '--fix',
    ])

    let data = ''
    let error = ''

    spawnedProcess.stdout.on('data', (chunk: Buffer) => {
      console.log(chunk.toString())
      data += chunk.toString()
    })

    spawnedProcess.stderr.on('data', (err: Buffer) => {
      error += err.toString()
    })

    spawnedProcess.on('close', (code: number | null) => {
      if (code === 0) {
        resolve(data)
      } else {
        reject(new Error(`Process exited with code ${code}: ${error}`))
      }
    })

    spawnedProcess.stdin.write(text)
    spawnedProcess.stdin.end()
  })
}

export function dumpFile(
  filename: string,
  obj: unknown,
  print = false,
  newLine = false
) {
  mkdirSync(dirname(filename), { recursive: true })
  const fileStr = JSON.stringify(obj, undefined, 2).concat(newLine ? '\n' : '')
  writeFileSync(filename, fileStr)
  if (print) console.log('Generated JSON at', filename)
}
export async function dumpPrettyFile(filename: string, obj: unknown) {
  mkdirSync(dirname(filename), { recursive: true })
  const fileStr = await formatText(filename, JSON.stringify(obj))

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

  const indexContent = `
${imports}

const data = {
${dataContent}
} as const
export default data
`
  const formatted =
    '// This is a generated index file.\n' +
    (await formatText(`${path}/index.ts`, indexContent))
  mkdirSync(path, { recursive: true })
  writeFileSync(`${path}/index.ts`, formatted)

  await Promise.all(
    Object.entries(obj).map(async ([key, val]) => {
      if (typeof val === 'object')
        await generateIndexFromObj(val, `${path}/${key}`)
    })
  )
}
