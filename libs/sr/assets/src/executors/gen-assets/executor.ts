import { generateIndexFromObj } from '@genshin-optimizer/common/pipeline'
import { crawlObject, layeredAssignment } from '@genshin-optimizer/common/util'
import { AssetData } from '@genshin-optimizer/sr/assets-data'
import { DM2D_PATH } from '@genshin-optimizer/sr/dm'
import { workspaceRoot } from '@nx/devkit'
import * as fs from 'fs'
import * as path from 'path'
import type { GenAssetsExecutorSchema } from './schema'

const DEST_PROJ_PATH = `${workspaceRoot}/libs/sr/assets/src` as const

export default async function runExecutor(
  _options: GenAssetsExecutorSchema
): Promise<{ success: boolean }> {
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

  // Dump out the asset List.
  // Best effort and since most of the time we don't use this
  if (fs.existsSync(DM2D_PATH)) {
    console.log('Copying files')
    crawlObject(
      AssetData,
      [],
      (s) => typeof s === 'string',
      (filePath: string, keys) => {
        const fileName = keys.slice(-1)
        const folderPath = keys.slice(0, -1).join('/')
        copyFile(
          `${DM2D_PATH}/${filePath}`,
          `${DEST_PROJ_PATH}/gen/${folderPath}/${fileName}.png`
        )
      }
    )
  } else {
    console.log(`\`assets\` folder does not exist, no assets will be copied.`)
  }
  console.log('Generating index')
  // Extract just the filename for the index files
  const indexData = {}
  crawlObject(
    AssetData,
    [],
    (s) => typeof s === 'string',
    (_filePath: string, keys) => {
      const fileName = keys.slice(-1)[0]
      layeredAssignment(indexData, keys, fileName)
    }
  )
  await generateIndexFromObj(indexData, `${DEST_PROJ_PATH}/gen`)
  return { success: true }
}
