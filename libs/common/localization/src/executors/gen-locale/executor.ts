import { dumpFile, dumpPrettyFile } from '@genshin-optimizer/common/pipeline'
import { readFileSync, readdirSync } from 'fs'
import type { GenLocaleExecutorSchema } from './schema'

/*
 * Projects:
 * common: /libs/common/localization
 * gi: /libs/gi/localization
 * sr: /libs/sr/localization
 * zzz: /libs/zzz/localization
 */
type ProjNames = 'common' | 'gi' | 'sr' | 'zzz'
export const projRootPath = (cat: ProjNames) =>
  `${process.env['NX_WORKSPACE_ROOT']}/libs/${cat}/localization/`

export default async function runExecutor(_options: GenLocaleExecutorSchema) {
  // Load translation files from POEditor into the assets folder.
  const transDirPath = `${projRootPath('common')}Translated/`
  const localeDir = (cat: ProjNames) => `${projRootPath(cat)}assets/locales/`

  const files = readdirSync(transDirPath).filter((fn) => fn.includes('.json'))
  await Promise.all(
    files.map(async (file) => {
      const lang = file.split('.json')[0]
      const raw = readFileSync(transDirPath + file).toString()
      const json = JSON.parse(raw)
      await Promise.all(
        Object.entries(json).map(async ([ns, entry]) => {
          if (ns.startsWith('zzz_')) {
            await dumpPrettyFile(
              `${localeDir('zzz')}${lang}/${ns.slice(3)}.json`,
              entry
            )
          } else if (ns.startsWith('sr_')) {
            await dumpPrettyFile(
              `${localeDir('sr')}${lang}/${ns.slice(3)}.json`,
              entry
            )
          } else if (ns.startsWith('common_')) {
            await dumpPrettyFile(
              `${localeDir('common')}${lang}/${ns.slice(7)}.json`,
              entry
            )
          } else {
            //dump to gi by default, due to legacy namespacing
            if (ns.startsWith('gi_')) ns = ns.slice(3)
            await dumpPrettyFile(`${localeDir('gi')}${lang}/${ns}.json`, entry)
          }
        })
      )
    })
  )

  /**
   * put all manual(english) translation into one file, to upload to POEditor to update translations.
   * need append prefixes:
   *
   * common: XXX -> common_XXX
   * gi XXX -> XXX (no change due to legacy)
   * sr XXX -> sr_XXX
   * zzz XXX -> zzz_XXX
   */
  const main = {} as { [key: string]: object }

  function enToMain(enDir: string, prefix = '') {
    const jsonFiles = readdirSync(enDir).filter((fn) => fn.endsWith('.json'))

    jsonFiles.forEach((jfile) => {
      let filename = jfile.split('.json')[0]
      // only add prefix if the prefix was not appended
      if (!filename.startsWith(prefix)) filename = prefix + filename
      const raw = readFileSync(enDir + jfile).toString()
      const json = JSON.parse(raw)
      main[filename] = json
    })
  }
  enToMain(`${localeDir('common')}en/`, 'common_')
  enToMain(`${localeDir('gi')}en/`) // do not add prefix to gi files
  enToMain(`${localeDir('sr')}en/`, 'sr_')
  enToMain(`${localeDir('zzz')}en/`, 'zzz_')
  // dump main file to common lib
  dumpFile(`${projRootPath('common')}/main_gen.json`, main)

  return { success: true }
}
