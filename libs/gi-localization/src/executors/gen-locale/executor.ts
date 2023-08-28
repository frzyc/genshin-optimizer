import type { GenLocaleExecutorSchema } from './schema'
import {
  readdirSync,
  readFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
} from 'fs'

export const PROJROOT_PATH = `${process.env['NX_WORKSPACE_ROOT']}/libs/gi-localization`

export default async function runExecutor(_options: GenLocaleExecutorSchema) {
  // Load translation files from POEditor into the assets folder.
  const transDir = `${PROJROOT_PATH}/Translated/`
  const localeDir = `${PROJROOT_PATH}/assets/locales/`
  const logging = false
  {
    const files = readdirSync(transDir).filter((fn) => fn.includes('.json'))
    files.forEach((file) => {
      const lang = file.split('.json')[0]
      const raw = readFileSync(transDir + file).toString()
      const json = JSON.parse(raw)
      Object.entries(json).forEach(([ns, entry]) => {
        const content = JSON.stringify(entry, null, 2)
        const fileDir = `${localeDir}${lang}`
        const fileName = `${fileDir}/${ns}.json`
        if (!existsSync(fileDir)) mkdirSync(fileDir)
        writeFileSync(fileName, content)
        if (logging) console.log('Generated JSON at', fileName)
      })
    })
  }

  //put all manual(english) translation into one file, to upload to POEditor to update translations.
  const enDir = `${PROJROOT_PATH}/assets/locales/en/`
  {
    const files = readdirSync(enDir).filter(
      (fn) => fn.includes('.json') && !fn.includes('_gen')
    )
    const main = {} as { [key: string]: object }
    files.forEach((file) => {
      const filename = file.split('.json')[0]
      const raw = readFileSync(enDir + file).toString()
      const json = JSON.parse(raw)
      main[filename] = json
    })
    const data = JSON.stringify(main, null, 2)
    const mainFile = `${PROJROOT_PATH}/main_gen.json`
    writeFileSync(mainFile, data)
    console.log('Generated MAIN JSON at ', mainFile)
  }

  return { success: true }
}
