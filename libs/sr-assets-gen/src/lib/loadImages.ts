import { dumpFile, generateIndexFromObj } from '@genshin-optimizer/pipeline'
import type { CharacterKey, LightConeKey } from '@genshin-optimizer/sr-consts'
import {
  avatarConfig,
  characterIdMap,
  DM2D_PATH,
  equipmentConfig,
  lightconeIdMap,
} from '@genshin-optimizer/sr-dm'
import { crawlObject } from '@genshin-optimizer/util'
import * as fs from 'fs'
import * as path from 'path'

const WORKSPACE_ROOT_PATH = process.env['NX_WORKSPACE_ROOT']
const DEST_PROJ_PATH = `${WORKSPACE_ROOT_PATH}/libs/sr-assets/src` as const

type CharacterIcon = {
  icon: string
  cover: string
}

type LightConeIcon = {
  icon: string
  cover: string
}

//An object to store all the asset related data.
export const AssetData = {
  // artifacts: {},
  lightCones: {} as Record<LightConeKey, LightConeIcon>,
  chars: {} as Record<CharacterKey, CharacterIcon>,
}

export default function loadImages() {
  const hasAssetsDir = fs.existsSync(DM2D_PATH)
  if (!hasAssetsDir)
    return console.log(
      `libs/sr-dm/assets does not exist, no assets will be copied.`
    )
  function copyFile(src, dest) {
    if (!fs.existsSync(src)) {
      console.warn('Cannot find file', src)
      return
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFile(src, dest, (err) => {
      if (err) console.error(err)
    })
  }

  // parse baseStat/ascension/basic data for characters.
  Object.entries(avatarConfig).forEach(([charid, charData]) => {
    const { DefaultAvatarHeadIconPath, AvatarCutinFrontImgPath } = charData

    const assets: CharacterIcon = {
      icon: DefaultAvatarHeadIconPath.toLocaleLowerCase(),
      cover: AvatarCutinFrontImgPath.toLocaleLowerCase(),
    }
    AssetData.chars[characterIdMap[charid]] = assets
  })

  Object.entries(equipmentConfig).forEach(([id, data]) => {
    const { ThumbnailPath, ImagePath } = data

    const assets: LightConeIcon = {
      icon: ThumbnailPath.toLocaleLowerCase(),
      cover: ImagePath.toLocaleLowerCase(),
    }
    AssetData.lightCones[lightconeIdMap[id]] = assets
  })

  // Dump out the asset List.
  dumpFile(
    `${WORKSPACE_ROOT_PATH}/libs/sr-assets-gen/src/lib/AssetData_gen.json`,
    AssetData
  )
  crawlObject(
    AssetData,
    [],
    (s) => typeof s === 'string',
    (icon, keys) => {
      copyFile(
        `${DM2D_PATH}/${icon}`,
        `${DEST_PROJ_PATH}/gen/${keys.slice(0, -1).join('/')}/${keys.at(
          -1
        )}.png`
      )
    }
  )

  generateIndexFromObj(AssetData, `${DEST_PROJ_PATH}/gen`)
}
