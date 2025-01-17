import { notEmpty } from '@genshin-optimizer/common/util'
import type {
  DiscMainStatKey,
  DiscRarityKey,
  DiscSubStatKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allDiscRarityKeys,
  allDiscSetKeys,
  allDiscSlotKeys,
  allDiscSubStatKeys,
  discMaxLevel,
  discSlotToMainStatKeys,
} from '@genshin-optimizer/zzz/consts'
import type {
  ICachedDisc,
  IZenlessObjectDescription,
  IZZZDatabase,
} from '../../Interfaces'
import type { IDisc, ISubstat } from '../../Interfaces/IDisc'
import { DataManager } from '../DataManager'
import type { ZzzDatabase } from '../Database'
import type { ImportResult } from '../exim'

export class DiscDataManager extends DataManager<
  string,
  'discs',
  ICachedDisc,
  IDisc
> {
  constructor(database: ZzzDatabase) {
    super(database, 'discs')
  }
  override validate(obj: unknown): IDisc | undefined {
    return validateDisc(obj)
  }
  override toCache(storageObj: IDisc, id: string): ICachedDisc | undefined {
    // Generate cache fields
    const newDisc = { ...storageObj, id } as ICachedDisc

    // Check relations and update equipment
    /* TODO:
    const oldDisc = super.get(id)
    if (newDisc.location !== oldDisc?.location) {
      const slotKey = newDisc.slotKey
      const prevChar = oldDisc?.location
        ? this.database.chars.getOrCreate(oldDisc.location)
        : undefined
      const newChar = newDisc.location
        ? this.database.chars.getOrCreate(newDisc.location)
        : undefined

      // previously equipped disc at new location
      const prevDisc = super.get(newChar?.equippedDiscs[slotKey])

      //current prevDisc <-> newChar  && newDisc <-> prevChar
      //swap to prevDisc <-> prevChar && newDisc <-> newChar(outside of this if)

      if (prevDisc)
        super.setCached(prevDisc.id, {
          ...prevDisc,
          location: prevChar?.key ?? '',
        })
      if (newChar)
        this.database.chars.setEquippedDisc(newChar.key, slotKey, newDisc.id)
      if (prevChar)
        this.database.chars.setEquippedDisc(
          prevChar.key,
          slotKey,
          prevDisc?.id ?? ''
        )
    } else
      newDisc.location &&
        this.database.chars.triggerCharacter(newDisc.location, 'update')
    */
    return newDisc
  }
  override deCache(disc: ICachedDisc): IDisc {
    const {
      setKey,
      rarity,
      level,
      slotKey,
      mainStatKey,
      substats,
      location,
      lock,
      trash,
    } = disc
    return {
      setKey,
      rarity,
      level,
      slotKey,
      mainStatKey,
      substats: substats.map(({ key, upgrades }) => ({
        key,
        upgrades,
      })),
      location,
      lock,
      trash,
    }
  }

  new(value: IDisc): string {
    const id = this.generateKey()
    this.set(id, value)
    return id
  }
  override remove(key: string, notify = true): ICachedDisc | undefined {
    const disc = super.remove(key, notify)
    // TODO:
    // if (disc)
    //   disc.location &&
    //     this.database.chars.setEquippedDisc(disc.location, disc.slotKey, '')
    return disc
  }
  override importZOD(
    zod: IZenlessObjectDescription & IZZZDatabase,
    result: ImportResult
  ) {
    result.discs.beforeMerge = this.values.length

    // Match discs for counter, metadata, and locations
    const discs = zod.discs

    if (!Array.isArray(discs) || !discs.length) {
      result.discs.notInImport = this.values.length
      return
    }

    const takenIds = new Set(this.keys)
    discs.forEach((r) => {
      const id = (r as ICachedDisc).id
      if (!id) return
      takenIds.add(id)
    })

    result.discs.import = discs.length
    const idsToRemove = new Set(this.values.map((r) => r.id))
    const hasEquipment = discs.some((r) => r.location)
    discs.forEach((r): void => {
      const disc = this.validate(r)
      if (!disc) {
        result.discs.invalid.push(r)
        return
      }

      let importDisc = disc
      let importId: string | undefined = (r as ICachedDisc).id
      let foundDupOrUpgrade = false
      if (!result.ignoreDups) {
        const { duplicated, upgraded } = this.findDups(
          disc,
          Array.from(idsToRemove)
        )
        if (duplicated[0] || upgraded[0]) {
          foundDupOrUpgrade = true
          // Favor upgrades with the same location, else use 1st dupe
          let [match, isUpgrade] =
            hasEquipment &&
            disc.location &&
            upgraded[0]?.location === disc.location
              ? [upgraded[0], true]
              : duplicated[0]
              ? [duplicated[0], false]
              : [upgraded[0], true]
          if (importId) {
            // favor exact id matches
            const up = upgraded.find((a) => a.id === importId)
            if (up) [match, isUpgrade] = [up, true]
            const dup = duplicated.find((a) => a.id === importId)
            if (dup) [match, isUpgrade] = [dup, false]
          }
          isUpgrade
            ? result.discs.upgraded.push(disc)
            : result.discs.unchanged.push(disc)
          idsToRemove.delete(match.id)

          //Imported disc will be set to `importId` later, so remove the dup/upgrade now to avoid a duplicate
          this.remove(match.id, false) // Do not notify, since this is a "replacement"
          if (!importId) importId = match.id // always resolve some id
          importDisc = {
            ...disc,
            location: hasEquipment ? disc.location : match.location,
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
      } else {
        importId = this.generateKey(takenIds)
        takenIds.add(importId)
      }
      this.set(importId, importDisc, !foundDupOrUpgrade)
    })
    const idtoRemoveArr = Array.from(idsToRemove)
    if (result.keepNotInImport || result.ignoreDups)
      result.discs.notInImport = idtoRemoveArr.length
    else idtoRemoveArr.forEach((k) => this.remove(k))
  }
  findDups(
    editorDisc: IDisc,
    idList = this.keys
  ): { duplicated: ICachedDisc[]; upgraded: ICachedDisc[] } {
    const {
      setKey,
      rarity,
      level = 0,
      slotKey,
      mainStatKey,
      substats = [],
    } = editorDisc

    const discs = idList
      .map((id) => this.get(id))
      .filter((r) => r) as ICachedDisc[]
    const candidates = discs.filter(
      (candidate) =>
        setKey === candidate.setKey &&
        rarity === candidate.rarity &&
        slotKey === candidate.slotKey &&
        mainStatKey === candidate.mainStatKey &&
        level >= candidate.level &&
        substats.every(
          (substat, i) =>
            !candidate.substats[i].key || // Candidate doesn't have anything on this slot
            (substat.key === candidate.substats[i].key && // Or editor simply has better substat
              substat.upgrades >= candidate.substats[i].upgrades)
        )
    )

    // Strictly upgraded disc
    const upgraded = candidates
      .filter(
        (candidate) =>
          level > candidate.level &&
          (Math.floor(level / 3) === Math.floor(candidate.level / 3) // Check for extra rolls
            ? substats.every(
                (
                  substat,
                  i // Has no extra roll
                ) =>
                  substat.key === candidate.substats[i].key &&
                  substat.upgrades === candidate.substats[i].upgrades
              )
            : substats.some(
                (
                  substat,
                  i // Has extra rolls
                ) =>
                  candidate.substats[i].key
                    ? substat.upgrades > candidate.substats[i].upgrades // Extra roll to existing substat
                    : substat.key // Extra roll to new substat
              ))
      )
      .sort((candidates) =>
        candidates.location === editorDisc.location ? -1 : 1
      )
    // Strictly duplicated disc
    const duplicated = candidates
      .filter(
        (candidate) =>
          level === candidate.level &&
          substats.every(
            (substat) =>
              !substat.key || // Empty slot
              candidate.substats.some(
                (candidateSubstat) =>
                  substat.key === candidateSubstat.key && // Or same slot
                  substat.upgrades === candidateSubstat.upgrades
              )
          )
      )
      .sort((candidates) =>
        candidates.location === editorDisc.location ? -1 : 1
      )
    return { duplicated, upgraded }
  }
}

export function validateDisc(
  obj: unknown = {},
  allowZeroSub = false,
  sortSubs = true
): IDisc | undefined {
  if (!obj || typeof obj !== 'object') return undefined
  let {
    setKey,
    rarity,
    slotKey,
    level,
    mainStatKey,
    substats,
    location,
    lock,
    trash,
  } = obj as IDisc

  if (!allDiscSetKeys.includes(setKey)) setKey = allDiscSetKeys[0]
  if (!allDiscSlotKeys.includes(slotKey)) slotKey = '1'
  if (!discSlotToMainStatKeys[slotKey].includes(mainStatKey))
    mainStatKey = discSlotToMainStatKeys[slotKey][0]
  if (!allDiscRarityKeys.includes(rarity)) rarity = 'S'

  if (typeof level !== 'number') level = 0
  level = Math.round(level)
  if (level > discMaxLevel[rarity]) level = 0

  substats = parseSubstats(substats, rarity, allowZeroSub, sortSubs)
  // substat cannot have same key as mainstat
  if (substats.find((sub) => sub.key === mainStatKey)) return undefined
  lock = !!lock
  trash = !!trash
  const plausibleMainStats = discSlotToMainStatKeys[slotKey]
  if (!(plausibleMainStats as DiscMainStatKey[]).includes(mainStatKey))
    if (plausibleMainStats.length === 1) mainStatKey = plausibleMainStats[0]
    else return undefined // ambiguous mainstat
  // TODO:
  // if (!location || !allCharacterKeys.includes(location)) location = ''
  location = ''
  return {
    setKey,
    rarity,
    level,
    slotKey,
    mainStatKey,
    substats,
    location,
    lock,
    trash,
  }
}

function parseSubstats(
  obj: unknown,
  _rarity: DiscRarityKey,
  _allowZeroSub = false,
  _sortSubs = true
): ISubstat[] {
  if (!Array.isArray(obj)) return []
  const substats = (obj as ISubstat[])
    .map(({ key, upgrades = 0 }) => {
      if (!key) return null
      if (
        !allDiscSubStatKeys.includes(key as DiscSubStatKey) ||
        typeof upgrades !== 'number' ||
        !Number.isFinite(upgrades)
      )
        return null

      upgrades = Math.round(upgrades)

      return { key, upgrades }
    })
    .filter(notEmpty) as ISubstat[]

  return substats
}
