import { generateIndexFromObj } from '@genshin-optimizer/common/pipeline'
import { crawlObject } from '@genshin-optimizer/common/util'
import { AssetData } from '@genshin-optimizer/gi/assets-data'
import { DM2D_PATH } from '@genshin-optimizer/gi/dm'
import { workspaceRoot } from '@nx/devkit'
import * as fs from 'fs'
import * as path from 'path'
import type { GenAssetsExecutorSchema } from './schema'

export const DEST_PROJ_PATH = `${workspaceRoot}/libs/gi/assets/src` as const

export default async function runExecutor(
  _options: GenAssetsExecutorSchema
): Promise<{ success: boolean }> {
  // Still continue working, so we can generate the asset index files.
  let copyAssets = true
  if (!fs.existsSync(DM2D_PATH)) {
    console.log(
      `Texture2D does not exist, no assets will be copied. Only index files will be generated.`
    )
    copyAssets = false
  }
  function copyFile(src: string, dest: string) {
    if (!fs.existsSync(src)) {
      console.warn('Cannot find file', src)
      return
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFile(src, dest, (err) => {
      if (err) console.error(err)
    })
  }

  // dumpFile(`${__dirname}/AssetData_gen.json`, assetChar)
  if (copyAssets) {
    crawlObject(
      AssetData,
      [],
      (s) => typeof s === 'string',
      (icon, keys) => {
        copyFile(
          `${DM2D_PATH}/${icon}.png`,
          `${DEST_PROJ_PATH}/gen/${keys.slice(0, -1).join('/')}/${icon}.png`
        )
      }
    )
  }

  await generateIndexFromObj(AssetData, `${DEST_PROJ_PATH}/gen`)
  return { success: true }
}
