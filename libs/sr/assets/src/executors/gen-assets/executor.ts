import * as fs from 'fs'
import * as path from 'path'
import { Readable } from 'stream'
import { generateIndexFromObj } from '@genshin-optimizer/common/pipeline'
import {
  crawlObject,
  crawlObjectAsync,
  layeredAssignment,
} from '@genshin-optimizer/common/util'
import { AssetData } from '@genshin-optimizer/sr/assets-data'
import { DM2D_PATH } from '@genshin-optimizer/sr/dm'
import { workspaceRoot } from '@nx/devkit'
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
    crawlObject(
      AssetData,
      [],
      (s) => typeof s === 'string' || Array.isArray(s),
      (filePath: string | string[], keys) => {
        const fileName = keys.slice(-1)[0]
        const folderPath = keys.slice(0, -1).join('/')
        if (typeof filePath === 'string') {
          copyFile(
            `${DM2D_PATH}/${filePath.toLocaleLowerCase()}`,
            `${DEST_PROJ_PATH}/gen/${folderPath}/${fileName}.png`
          )
        } else {
          filePath.forEach((fp, index) =>
            copyFile(
              `${DM2D_PATH}/${fp.toLocaleLowerCase()}`,
              `${DEST_PROJ_PATH}/gen/${folderPath}/${fileName}_${index}.png`
            )
          )
        }
      }
    )
  } else if (options.fetchAssets === 'yatta') {
    console.log('Fetching from yatta.top')
    await crawlObjectAsync(
      AssetData,
      [],
      (s) => typeof s === 'string' || Array.isArray(s),
      async (filePath: string | string[], keys) => {
        const fileName = keys.slice(-1)[0]
        const subFolderPath = keys.slice(0, -1).join('/')
        const destFolder = path.resolve(
          `${DEST_PROJ_PATH}/gen/${subFolderPath}`
        )
        if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder)

        if (typeof filePath === 'string') {
          await saveFromYatta(filePath, destFolder, fileName)
        } else {
          await Promise.all(
            filePath.map((fp, index) =>
              saveFromYatta(fp, destFolder, `${fileName}_${index}`)
            )
          )
        }
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
    (s) => typeof s === 'string' || Array.isArray(s),
    (filePath: string | string[], keys) => {
      const fileName = keys.slice(-1)[0]
      if (typeof filePath === 'string') {
        layeredAssignment(indexData, keys, fileName)
      } else {
        filePath.forEach((_, index) => {
          const newKeys = [...keys]
          newKeys[newKeys.length - 1] = `${
            newKeys[newKeys.length - 1]
          }_${index}`
          layeredAssignment(indexData, newKeys, `${fileName}_${index}`)
        })
      }
    }
  )
  await generateIndexFromObj(indexData, `${DEST_PROJ_PATH}/gen`)
  return { success: true }
}

async function saveFromYatta(
  filePath: string,
  destFolder: string,
  fileName: string
) {
  const yattaFileName = filePath.split('/').at(-1) ?? ''
  const yatta = `https://api.yatta.top/hsr/assets/UI/skill/${yattaFileName}`
  const destFile = path.resolve(`${destFolder}/${fileName}.png`)

  const filestream = fs.createWriteStream(destFile)

  try {
    const yattaImage = await fetch(yatta)
    if (yattaImage.body === null) {
      console.log(`File body null for ${yatta} to be stored in ${destFile}`)
      return
    }
    await finished(
      Readable.fromWeb(yattaImage.body as ReadableStream<any>).pipe(filestream)
    )
  } catch (exception) {
    console.log(
      `Exception when fetching ${yatta} for ${destFile}: ${exception}`
    )
    throw exception
  }
}
