import type { PromiseExecutor } from '@nx/devkit'
import { getDataFromHakushin } from './hakushin'
import type { GenHakushinDataExecutorSchema } from './schema'
// import { workspaceRoot } from '@nx/devkit'
// const folderPath = `${workspaceRoot}/libs/zzz/dm/HakushinData`

const runExecutor: PromiseExecutor<GenHakushinDataExecutorSchema> = async (
  options
) => {
  console.log('Running Executor for GenHakushinData', options)
  await getDataFromHakushin()
  return {
    success: true,
  }
}

export default runExecutor
