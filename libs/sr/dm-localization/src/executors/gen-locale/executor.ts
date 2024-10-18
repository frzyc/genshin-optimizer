import { dumpFile } from '@genshin-optimizer/common/pipeline'
import type { PromiseExecutor } from '@nx/devkit'
import { StringData } from './lib/stringData'
import type { GenLocaleExecutorSchema } from './schema'

const runExecutor: PromiseExecutor<GenLocaleExecutorSchema> = async (
  options
) => {
  console.log('Executor ran for GenLocale', options)
  //dump the language data to files
  Object.entries(StringData).forEach(([lang, data]) => {
    const fileDir = `${process.env['NX_WORKSPACE_ROOT']}/libs/sr/dm-localization/assets/locales/${lang}`
    // console.log(data)

    Object.entries(data).forEach(([type, typeData]) => {
      //general manual localization namespaces
      if (
        [
          'characters',
          'charNames',
          'common',
          'lightCones',
          'lightConeNames',
          'relics',
          'relicNames',
          'paths',
          'statKey',
          'teams',
          'ui',
        ].includes(type)
      )
        return dumpFile(`${fileDir}/${type}_gen.json`, typeData)

      //lightCones/characters/relics
      Object.entries(typeData as any).forEach(([itemKey, data]) =>
        dumpFile(`${fileDir}/${type}_${itemKey}_gen.json`, data)
      )
    })
  })

  return {
    success: true,
  }
}

export default runExecutor
