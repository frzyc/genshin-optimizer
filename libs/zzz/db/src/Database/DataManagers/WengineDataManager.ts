import type { CharacterKey, WengineKey } from '@genshin-optimizer/zzz/consts'
import {
  allLocationKeys,
  allWengineKeys,
  wengineMaxLevel,
} from '@genshin-optimizer/zzz/consts'
import { validateLevelMilestone } from '@genshin-optimizer/zzz/util'
import type { IWengine } from '@genshin-optimizer/zzz/zood'
import type { ICachedCharacter } from '../../Interfaces'
import type { ICachedWengine } from '../../Interfaces/IDbWengine'
import { DataManager } from '../DataManager'
import type { ZzzDatabase } from '../Database'
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
    const { key, level: rawLevel, modification: rawMod } = obj as IWengine
    let { phase, location, lock } = obj as IWengine

    if (!allWengineKeys.includes(key)) return undefined
    if (rawLevel > wengineMaxLevel) return undefined
    const { sanitizedLevel, milestone: modification } = validateLevelMilestone(
      rawLevel,
      rawMod
    )
    if (typeof phase !== 'number' || phase < 1 || phase > 5) phase = 1
    if (location && !allLocationKeys.includes(location)) location = ''
    lock = !!lock
    return {
      key,
      level: sanitizedLevel,
      modification,
      phase,
      location,
      lock,
    }
  }
  override toCache(
    storageObj: IWengine,
    id: string
  ): ICachedWengine | undefined {
    const newWengine = { ...storageObj, id }
    const oldWengine = super.get(id)
    // During initialization of the database, if you import wengines with location without a corresponding character, the char will be generated here.
    const getWithInit = (cKey: CharacterKey): ICachedCharacter => {
      if (!this.database.chars.keys.includes(cKey))
        this.database.chars.set(cKey, initialCharacterData(cKey))
      return this.database.chars.get(cKey) as ICachedCharacter
    }
    if (newWengine.location !== oldWengine?.location) {
      const prevChar = oldWengine?.location
        ? getWithInit(oldWengine.location)
        : undefined
      const newChar = newWengine.location
        ? getWithInit(newWengine.location)
        : undefined

      // previously equipped wengine at new location
      const prevWengine = super.get(newChar?.equippedWengine)

      //current prevWengine <-> newChar  && newWengine <-> prevChar
      //swap to prevWengine <-> prevChar && newWengine <-> newChar(outside of this if)

      if (prevWengine)
        super.setCached(prevWengine.id, {
          ...prevWengine,
          location: prevChar?.key ?? '',
        })

      if (newChar)
        this.database.chars.setEquippedWengine(newChar.key, newWengine.id)
      if (prevChar)
        this.database.chars.setEquippedWengine(
          prevChar.key,
          prevWengine?.id ?? ''
        )
    } else
      newWengine.location &&
        this.database.chars.triggerCharacter(newWengine.location, 'update')
    return newWengine
  }
  override deCache(wengine: ICachedWengine): IWengine {
    const { key, level, modification, phase, location, lock } = wengine
    return { key, level, modification, phase, location, lock }
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

  findDups(
    wengine: IWengine,
    idList = this.keys
  ): { duplicated: ICachedWengine[]; upgraded: ICachedWengine[] } {
    const { key, level, modification, phase } = wengine

    const wengines = idList
      .map((id) => this.get(id))
      .filter((a) => a) as ICachedWengine[]
    const candidates = wengines.filter(
      (candidate) =>
        key === candidate.key &&
        level >= candidate.level &&
        modification >= candidate.modification &&
        phase >= candidate.phase
    )

    // Strictly upgraded wengines
    const upgraded = candidates
      .filter(
        (candidate) =>
          level > candidate.level ||
          modification > candidate.modification ||
          phase > candidate.phase
      )
      .sort((candidates) => (candidates.location === wengine.location ? -1 : 1))
    // Strictly duplicated wengines
    const duplicated = candidates
      .filter(
        (candidate) =>
          level === candidate.level &&
          modification === candidate.modification &&
          phase === candidate.phase
      )
      .sort((candidates) => (candidates.location === wengine.location ? -1 : 1))
    return { duplicated, upgraded }
  }
}

export const initialWengine = (key: WengineKey): ICachedWengine => ({
  id: '',
  key,
  level: 1,
  modification: 0,
  phase: 1,
  location: '',
  lock: false,
})
