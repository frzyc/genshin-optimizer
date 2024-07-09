import {
  crawlObject,
  layeredAssignment,
  verifyObjKeys,
} from '@genshin-optimizer/common/util'
import {
  TrailblazerPathMap,
  allElementalTypeKeys,
  allTrailblazerGenderedKeys,
  allTrailblazerKeys,
} from '@genshin-optimizer/sr/consts'
import type { LanguageKey } from '@genshin-optimizer/sr/dm'
import { allLanguageKeys, languageMap } from '@genshin-optimizer/sr/dm'
import { HashData, type LanguageData } from './hashData'

const langArray = Object.entries(languageMap).map(([langKey, strings]) => {
  const data = {} as LanguageData // We will mirror the structure of HashData, so this is safe

  // Keep the same obj structure; convert any hash `number` to strings
  crawlObject(
    HashData,
    [],
    (value) => typeof value === 'string',
    (hash: string, path) => layeredAssignment(data, path, strings[hash])
  )

  // Trailblazer name handling
  allTrailblazerGenderedKeys.forEach((key) => {
    const type = allElementalTypeKeys.find((typeKey) => key.includes(typeKey))
    if (!type)
      throw new Error(
        `Trailblazer key ${key} was unable to find an elemental type`
      )
    const typeString = strings[HashData.sheet.type[type]]

    const trailblazerKey = allTrailblazerKeys.find((tbKey) =>
      key.includes(tbKey)
    )
    if (!trailblazerKey)
      throw new Error(
        `Trailblazer key ${key} was unable to find a trailblzer key`
      )
    const path = TrailblazerPathMap[trailblazerKey]
    const pathString = strings[HashData.sheet.path[path]]

    // Override name to something like 'Trailblazer (Physical • Destruction)'
    data.char[
      key
    ].name = `${data.char[key].name} (${typeString} • ${pathString})`
    data.charNames[key] = data.char[key].name
  })

  const tuple: [LanguageKey, LanguageData] = [langKey, data]
  return tuple
})

const data = Object.fromEntries(langArray)
verifyObjKeys(data, allLanguageKeys)
export const StringData = data
