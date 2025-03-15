import type { PromiseExecutor } from '@nx/devkit'
import { dumpChars } from './lib/dumpChars'
import { dumpDiscs } from './lib/dumpDiscs'
import { dumpWengines } from './lib/dumpWengines'
import type { GenLocaleExecutorSchema } from './schema'

const runExecutor: PromiseExecutor<GenLocaleExecutorSchema> = async (
  options,
) => {
  console.log('Executor ran for GenLocale', options)

  // currently only dump english translations
  const fileDir = `${process.env['NX_WORKSPACE_ROOT']}/libs/zzz/dm-localization/assets/locales/en`

  dumpChars(fileDir)
  dumpDiscs(fileDir)
  dumpWengines(fileDir)

  return {
    success: true,
  }
}

export default runExecutor
