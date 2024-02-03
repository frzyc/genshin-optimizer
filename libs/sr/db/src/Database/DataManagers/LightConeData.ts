import type { CharacterLocationKey } from '@genshin-optimizer/sr/consts'
import {
  allCharacterLocationKeys,
  allLightConeKeys,
  charKeyToCharLocKey,
  lightConeMaxLevel,
} from '@genshin-optimizer/sr/consts'
import type {
  ILightCone,
  ISrObjectDescription,
} from '@genshin-optimizer/sr/srod'
import { validateLevelAsc } from '@genshin-optimizer/sr/util'
import type {
  ICachedLightCone,
  ICachedSroCharacter,
  ISroDatabase,
} from '../../Interfaces'
import type { SroDatabase } from '../Database'
import { SroDataManager } from '../SroDataManager'
import type { ImportResult } from '../exim'
import { initialCharacter } from './CharacterData'

export class LightConeDataManager extends SroDataManager<
  string,
  'lightCones',
  ICachedLightCone,
  ILightCone
> {
  constructor(database: SroDatabase) {
    super(database, 'lightCones')
  }
  override validate(obj: unknown): ILightCone | undefined {
    if (typeof obj !== 'object') return undefined
    const { key, level: rawLevel, ascension: rawAscension } = obj as ILightCone
    let { superimpose, location, lock } = obj as ILightCone

    if (!allLightConeKeys.includes(key)) return undefined
    if (rawLevel > lightConeMaxLevel) return undefined
    const { level, ascension } = validateLevelAsc(rawLevel, rawAscension)
    if (typeof superimpose !== 'number' || superimpose < 1 || superimpose > 5)
      superimpose = 1
    if (location && !allCharacterLocationKeys.includes(location)) location = ''
    lock = !!lock
    return { key, level, ascension, superimpose, location, lock }
  }
  override toCache(
    storageObj: ILightCone,
    id: string
  ): ICachedLightCone | undefined {
    const newLightCone = { ...storageObj, id }
    const oldLightCone = super.get(id)

    // During initialization of the database, if you import lightCones with location without a corresponding character, the char will be generated here.
    const getWithInit = (lk: CharacterLocationKey): ICachedSroCharacter => {
      const cKey = this.database.chars.LocationToCharacterKey(lk)
      if (!this.database.chars.keys.includes(cKey))
        this.database.chars.set(cKey, initialCharacter(cKey))
      return this.database.chars.get(cKey) as ICachedSroCharacter
    }
    if (newLightCone.location !== oldLightCone?.location) {
      const prevChar = oldLightCone?.location
        ? getWithInit(oldLightCone.location)
        : undefined
      const newChar = newLightCone.location
        ? getWithInit(newLightCone.location)
        : undefined

      // previously equipped light cone at new location
      let prevLightCone = super.get(newChar?.equippedLightCone)

      //current prevLightCone <-> newChar  && newLightCone <-> prevChar
      //swap to prevLightCone <-> prevChar && newLightCone <-> newChar(outside of this if)

      if (prevLightCone)
        super.setCached(prevLightCone.id, {
          ...prevLightCone,
          location: prevChar?.key ? charKeyToCharLocKey(prevChar.key) : '',
        })
      else if (prevChar?.key) prevLightCone = undefined

      if (newChar)
        this.database.chars.setEquippedLightCone(
          charKeyToCharLocKey(newChar.key),
          newLightCone.id
        )
      if (prevChar)
        this.database.chars.setEquippedLightCone(
          charKeyToCharLocKey(prevChar.key),
          prevLightCone?.id
        )
    } else
      newLightCone.location &&
        this.database.chars.triggerCharacter(newLightCone.location, 'update')
    return newLightCone
  }
  override deCache(lightCone: ICachedLightCone): ILightCone {
    const { key, level, ascension, superimpose, location, lock } = lightCone
    return { key, level, ascension, superimpose, location, lock }
  }

  new(value: ILightCone): string {
    const id = this.generateKey()
    this.set(id, value)
    return id
  }
  override remove(key: string, notify = true) {
    const lc = this.get(key)
    if (!lc) return
    lc.location && this.database.chars.setEquippedLightCone(lc.location, '')
    super.remove(key, notify)
  }
  override importSROD(
    srod: ISrObjectDescription & ISroDatabase,
    result: ImportResult
  ) {
    result.lightCones.beforeMerge = this.values.length

    // Match lightCones for counter, metadata, and locations.
    const lightCones = srod.lightCones

    if (!Array.isArray(lightCones) || !lightCones.length) {
      result.lightCones.notInImport = this.values.length
      return
    }

    const takenIds = new Set(this.keys)
    lightCones.forEach((a) => {
      const id = (a as ICachedLightCone).id
      if (!id) return
      takenIds.add(id)
    })

    result.lightCones.import = lightCones.length
    const idsToRemove = new Set(this.values.map((w) => w.id))
    const hasEquipment = lightCones.some((w) => w.location)
    lightCones.forEach((w): void => {
      const lightCone = this.validate(w)
      if (!lightCone) {
        result.lightCones.invalid.push(w)
        return
      }

      let importLightCone = lightCone
      let importId: string | undefined = (w as ICachedLightCone).id
      let foundDupOrUpgrade = false
      if (!result.ignoreDups) {
        const { duplicated, upgraded } = this.findDups(
          lightCone,
          Array.from(idsToRemove)
        )
        if (duplicated[0] || upgraded[0]) {
          foundDupOrUpgrade = true
          // Favor upgrades with the same location, else use 1st dupe
          let [match, isUpgrade] =
            hasEquipment &&
            lightCone.location &&
            upgraded[0]?.location === lightCone.location
              ? [upgraded[0], true]
              : duplicated[0]
              ? [duplicated[0], false]
              : [upgraded[0], true]
          if (importId) {
            // favor exact id matches
            const up = upgraded.find((w) => w.id === importId)
            if (up) [match, isUpgrade] = [up, true]
            const dup = duplicated.find((w) => w.id === importId)
            if (dup) [match, isUpgrade] = [dup, false]
          }
          isUpgrade
            ? result.lightCones.upgraded.push(lightCone)
            : result.lightCones.unchanged.push(lightCone)
          idsToRemove.delete(match.id)

          //Imported lightCone will be set to `importId` later, so remove the dup/upgrade now to avoid a duplicate
          super.remove(match.id, false) // Do not notify, since this is a "replacement". Also use super to bypass the equipment check
          if (!importId) importId = match.id // always resolve some id
          importLightCone = {
            ...lightCone,
            location: hasEquipment ? lightCone.location : match.location,
          }
        }
      }
      if (importId) {
        if (this.get(importId)) {
          // `importid` already in use, get a new id
          const newId = this.generateKey(takenIds)
          takenIds.add(newId)
          if (this.changeId(importId, newId)) {
            // Sync the id in `idsToRemove` due to the `changeId`
            if (idsToRemove.has(importId)) {
              idsToRemove.delete(importId)
              idsToRemove.add(newId)
            }
          }
        }
        this.set(importId, importLightCone, !foundDupOrUpgrade)
      } else {
        importId = this.generateKey(takenIds)
        takenIds.add(importId)
      }
      this.set(importId, importLightCone, !foundDupOrUpgrade)
    })

    // Shouldn't remove Somnia's signature
    const idtoRemoveArr = Array.from(idsToRemove)
    if (result.keepNotInImport || result.ignoreDups)
      result.lightCones.notInImport = idtoRemoveArr.length
    else idtoRemoveArr.forEach((k) => this.remove(k))
  }

  findDups(
    lightCone: ILightCone,
    idList = this.keys
  ): { duplicated: ICachedLightCone[]; upgraded: ICachedLightCone[] } {
    const { key, level, ascension, superimpose } = lightCone

    const lightCones = idList
      .map((id) => this.get(id))
      .filter((a) => a) as ICachedLightCone[]
    const candidates = lightCones.filter(
      (candidate) =>
        key === candidate.key &&
        level >= candidate.level &&
        ascension >= candidate.ascension &&
        superimpose >= candidate.superimpose
    )

    // Strictly upgraded lightCones
    const upgraded = candidates
      .filter(
        (candidate) =>
          level > candidate.level ||
          ascension > candidate.ascension ||
          superimpose > candidate.superimpose
      )
      .sort((candidates) =>
        candidates.location === lightCone.location ? -1 : 1
      )
    // Strictly duplicated lightCones
    const duplicated = candidates
      .filter(
        (candidate) =>
          level === candidate.level &&
          ascension === candidate.ascension &&
          superimpose === candidate.superimpose
      )
      .sort((candidates) =>
        candidates.location === lightCone.location ? -1 : 1
      )
    return { duplicated, upgraded }
  }
}
