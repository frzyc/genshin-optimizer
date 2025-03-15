import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { objMap } from '@genshin-optimizer/common/util'
import type {
  CharacterKey,
  DiscSetKey,
  WengineKey,
} from '@genshin-optimizer/zzz/consts'
import {
  charactersDetailedJSONData,
  discsDetailedJSONData,
  wengineDetailedJSONData,
} from '@genshin-optimizer/zzz/dm'
import type { PromiseExecutor } from '@nx/devkit'
import { workspaceRoot } from '@nx/devkit'
import type { GenAssetsDataExecutorSchema } from './schema'

export type AssetData = {
  discs: Record<
    DiscSetKey,
    {
      circle: string
      cd_s: string
      cd_a: string
      cd_b: string
    }
  >
  chars: Record<
    CharacterKey,
    {
      full: string
      circle: string
      trap: string
      select: string
      interknot: string
    }
  >
  wengines: Record<
    WengineKey,
    {
      icon: string
      big: string
    }
  >
}

const runExecutor: PromiseExecutor<GenAssetsDataExecutorSchema> = async (
  options,
) => {
  console.log('Executor ran for GenAssetsData', options)
  const assetData: AssetData = {
    discs: objMap(discsDetailedJSONData, ({ icon }) => {
      const strKey = icon.match(/Suit([^/]+)\.png/)?.[1]
      if (!strKey) throw Error(`Failed to parse disc icon name: ${icon}`)
      return {
        circle: `Suit${strKey}.png`,
        cd_s: `ItemSuit${strKey}_S.png`,
        cd_a: `ItemSuit${strKey}_A.png`,
        cd_b: `ItemSuit${strKey}_B.png`,
      }
    }),

    chars: objMap(charactersDetailedJSONData, ({ icon }) => {
      // get the last 2 digits of the icon name. this will likely break if ZZZ go over 2 digits.
      const strKey = icon.slice(-2)
      if (!strKey) throw Error(`Failed to parse character icon name: ${icon}`)
      return {
        full: `IconRole${strKey}.png`,
        circle: `IconRoleCircle${strKey}.png`,
        trap: `IconRoleGeneral${strKey}.png`,
        select: `IconRoleSelect${strKey}.png`,
        interknot: `IconInterKnotRole00${strKey}.png`,
      }
    }),
    wengines: objMap(wengineDetailedJSONData, ({ icon }) => {
      const strKey = icon.match(/([^/]+)\.png/)?.[1]
      if (!strKey) throw Error(`Failed to parse wengine icon name: ${icon}`)
      return {
        icon: `${strKey}.png`,
        big: `${strKey}Big.png`,
      }
    }),
  } as const

  // Dump out the asset List.
  dumpFile(
    `${workspaceRoot}/libs/zzz/assets-data/src/AssetsData_gen.json`,
    assetData,
  )

  return {
    success: true,
  }
}

export default runExecutor
