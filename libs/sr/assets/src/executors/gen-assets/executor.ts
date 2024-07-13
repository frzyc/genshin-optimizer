import { generateIndexFromObj } from '@genshin-optimizer/common/pipeline'
import { crawlObject, layeredAssignment } from '@genshin-optimizer/common/util'
import { AssetData } from '@genshin-optimizer/sr/assets-data'
import { DM2D_PATH } from '@genshin-optimizer/sr/dm'
import { workspaceRoot } from '@nx/devkit'
import * as fs from 'fs'
import * as path from 'path'
import { Readable } from 'stream'
import { finished } from 'stream/promises'
import type { ReadableStream } from 'stream/web'
import type { GenAssetsExecutorSchema } from './schema'

const DEST_PROJ_PATH = `${workspaceRoot}/libs/sr/assets/src` as const

export default async function runExecutor(
  options: GenAssetsExecutorSchema
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
  console.log(options)
  if (options.fetchAssets === 'local' && fs.existsSync(DM2D_PATH)) {
    console.log('Copying files')
    await crawlObject(
      AssetData,
      [],
      (s) => typeof s === 'string',
      async (filePath: string, keys) => {
        const fileName = keys.slice(-1)
        const folderPath = keys.slice(0, -1).join('/')
        copyFile(
          `${DM2D_PATH}/${filePath.toLocaleLowerCase()}`,
          `${DEST_PROJ_PATH}/gen/${folderPath}/${fileName}.png`
        )
      }
    )
  } else if (options.fetchAssets === 'yatta') {
    console.log('Fetching from yatta.top')
    await crawlObject(
      AssetData,
      [],
      (s) => typeof s === 'string',
      async (filePath: string, keys) => {
        const fileName = keys.slice(-1)
        const folderPath = keys.slice(0, -1).join('/')
        const realFileName = filePath.split('/').at(-1) ?? ''
        const yatta = `https://api.yatta.top/hsr/assets/UI/skill/${realFileName}`
        const file = await fetch(yatta)
        const dest = path.resolve(
          `${DEST_PROJ_PATH}/gen/${folderPath}/${fileName}.png`
        )
        const filestream = fs.createWriteStream(dest)
        if (file.body !== null)
          await finished(
            Readable.fromWeb(file.body as ReadableStream<any>).pipe(filestream)
          )
      }
    )
  } else {
    console.log('No assets will be copied.')
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
