import type { CharacterKey, WengineKey } from '@genshin-optimizer/zzz/consts'
import {
  allLocationKeys,
  allWengineKeys,
  wengineMaxLevel,
} from '@genshin-optimizer/zzz/consts'
import { getWengineStat } from '@genshin-optimizer/zzz/stats'
import { validateLevelAsc } from '@genshin-optimizer/zzz/util'
import type { ICachedWengine, IWengine } from '../../Interfaces/IWengine'
import type { ZzzDatabase } from '../Database'
import { DataManager } from '../DataManager'
import type { CharacterData } from './CharacterDataManager'
import { initialCharacterData } from './CharacterDataManager'

export class WengineDataManager extends DataManager<
  string,
  'wengines',
  ICachedWengine,
  IWengine
> {
  constructor(database: ZzzDatabase) {
    super(database, 'wengines')
  }

  override validate(obj: unknown): IWengine | undefined {
    if (typeof obj !== 'object') return undefined
    const { key, level: rawLevel, ascension: rawAscension } = obj as IWengine
    let { phase, location, lock } = obj as IWengine

    if (!allWengineKeys.includes(key)) return undefined
    const { rarity } = getWengineStat(key)
    if (rawLevel > wengineMaxLevel[rarity]) return undefined
    const { sanitizedLevel, ascension } = validateLevelAsc(
      rawLevel,
      rawAscension
    )
    if (typeof phase !== 'number' || phase < 1 || phase > 5) phase = 1
    if (location && !allLocationKeys.includes(location)) location = ''
    lock = !!lock
    return { key, level: sanitizedLevel, ascension, phase, location, lock }
  }
  override toCache(
    storageObj: IWengine,
    id: string
  ): ICachedWengine | undefined {
    const newWengine = { ...storageObj, id }
    const oldWengine = super.get(id)
    // Disallow unequipping of weapons
    if (!newWengine.location && oldWengine?.location) return undefined

    // During initialization of the database, if you import weapons with location without a corresponding character, the char will be generated here.
    const getWithInit = (cKey: CharacterKey): CharacterData => {
      if (!this.database.chars.keys.includes(cKey))
        this.database.chars.set(cKey, initialCharacterData(cKey))
      return this.database.chars.get(cKey) as CharacterData
    }
    if (newWengine.location !== oldWengine?.location) {
      const prevChar = oldWengine?.location
        ? getWithInit(oldWengine.location)
        : undefined
      const newChar = newWengine.location
        ? getWithInit(newWengine.location)
        : undefined

      // previously equipped wengine at new location
      let prevWengine = super.get(newChar?.wengineKey)

      //current prevWengine <-> newChar  && newWengine <-> prevChar
      //swap to prevWengine <-> prevChar && newWengine <-> newChar(outside of this if)

      if (prevWengine)
        super.setCached(prevWengine.id, {
          ...prevWengine,
          location: prevChar?.key ?? '',
        })
      else if (prevChar?.key) prevWengine = undefined

      if (newChar)
        this.database.chars.setEquippedWengine(newChar.key, newWengine.id)
      if (prevChar)
        this.database.chars.setEquippedWengine(
          prevChar.key,
          prevWengine?.id as WengineKey
        )
    } else
      newWengine.location &&
        this.database.chars.triggerCharacter(newWengine.location, 'update')
    return newWengine
  }
  override deCache(wengine: ICachedWengine): IWengine {
    const { key, level, ascension, phase, location, lock } = wengine
    return { key, level, ascension, phase, location, lock }
  }

  new(value: IWengine): string {
    const id = this.generateKey()
    this.set(id, value)
    return id
  }
  override remove(id: string, notify?: boolean): ICachedWengine | undefined {
    const wengine = super.remove(id, notify)
    if (wengine)
      wengine.location &&
        this.database.chars.setEquippedWengine(wengine.location, '')
    return wengine
  }
}

export const defaultInitialWeapon = (
  key: WengineKey = 'BashfulDemon'
): ICachedWengine => initialWengine(key)

export const initialWengine = (key: WengineKey): ICachedWengine => ({
  id: '',
  key,
  level: 1,
  ascension: 0,
  phase: 1,
  location: '',
  lock: false,
})
