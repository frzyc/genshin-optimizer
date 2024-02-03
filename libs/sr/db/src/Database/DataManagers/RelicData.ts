import { clamp } from '@genshin-optimizer/common/util'
import type {
  RelicMainStatKey,
  RelicRarityKey,
  RelicSubStatKey,
} from '@genshin-optimizer/sr/consts'
import {
  allCharacterLocationKeys,
  allRelicMainStatKeys,
  allRelicRarityKeys,
  allRelicSetKeys,
  allRelicSlotKeys,
  allRelicSubStatKeys,
  charKeyToCharLocKey,
  relicMaxLevel,
  relicSlotToMainStatKeys,
} from '@genshin-optimizer/sr/consts'
import type {
  IRelic,
  ISrObjectDescription,
  ISubstat,
} from '@genshin-optimizer/sr/srod'
import {
  getRelicMainStatDisplayVal,
  getSubstatRange,
} from '@genshin-optimizer/sr/util'
import type {
  ICachedRelic,
  ICachedSubstat,
  ISroDatabase,
} from '../../Interfaces'
import type { SroDatabase } from '../Database'
import { SroDataManager } from '../SroDataManager'
import type { ImportResult } from '../exim'

export class RelicDataManager extends SroDataManager<
  string,
  'relics',
  ICachedRelic,
  IRelic
> {
  constructor(database: SroDatabase) {
    super(database, 'relics')
  }
  override validate(obj: unknown): IRelic | undefined {
    return validateRelic(obj)
  }
  override toCache(storageObj: IRelic, id: string): ICachedRelic | undefined {
    // Generate cache fields
    const newRelic = cachedRelic(storageObj, id).relic

    // Check relations and update equipment
    const oldRelic = super.get(id)
    if (newRelic.location !== oldRelic?.location) {
      const slotKey = newRelic.slotKey
      const prevChar = oldRelic?.location
        ? this.database.chars.getOrCreate(
            this.database.chars.LocationToCharacterKey(oldRelic.location)
          )
        : undefined
      const newChar = newRelic.location
        ? this.database.chars.getOrCreate(
            this.database.chars.LocationToCharacterKey(newRelic.location)
          )
        : undefined

      // previously equipped relic at new location
      const prevRelic = super.get(newChar?.equippedRelics[slotKey])

      //current prevRelic <-> newChar  && newRelic <-> prevChar
      //swap to prevRelic <-> prevChar && newRelic <-> newChar(outside of this if)

      if (prevRelic)
        super.setCached(prevRelic.id, {
          ...prevRelic,
          location: prevChar?.key ? charKeyToCharLocKey(prevChar.key) : '',
        })
      if (newChar)
        this.database.chars.setEquippedRelic(
          charKeyToCharLocKey(newChar.key),
          slotKey,
          newRelic.id
        )
      if (prevChar)
        this.database.chars.setEquippedRelic(
          charKeyToCharLocKey(prevChar.key),
          slotKey,
          prevRelic?.id ?? ''
        )
    } else
      newRelic.location &&
        this.database.chars.triggerCharacter(newRelic.location, 'update')
    return newRelic
  }
  override deCache(relic: ICachedRelic): IRelic {
    const {
      setKey,
      rarity,
      level,
      slotKey,
      mainStatKey,
      substats,
      location,
      lock,
    } = relic
    return {
      setKey,
      rarity,
      level,
      slotKey,
      mainStatKey,
      substats: substats.map((substat) => ({
        key: substat.key,
        value: substat.value,
      })),
      location,
      lock,
    }
  }

  new(value: IRelic): string {
    const id = this.generateKey()
    this.set(id, value)
    return id
  }
  override remove(key: string, notify = true) {
    const relic = this.get(key)
    if (!relic) return
    relic.location &&
      this.database.chars.setEquippedRelic(relic.location, relic.slotKey, '')
    super.remove(key, notify)
  }
  override importSROD(
    srod: ISrObjectDescription & ISroDatabase,
    result: ImportResult
  ) {
    result.relics.beforeMerge = this.values.length

    // Match relics for counter, metadata, and locations
    const relics = srod.relics

    if (!Array.isArray(relics) || !relics.length) {
      result.relics.notInImport = this.values.length
      return
    }

    const takenIds = new Set(this.keys)
    relics.forEach((r) => {
      const id = (r as ICachedRelic).id
      if (!id) return
      takenIds.add(id)
    })

    result.relics.import = relics.length
    const idsToRemove = new Set(this.values.map((r) => r.id))
    const hasEquipment = relics.some((r) => r.location)
    relics.forEach((r): void => {
      const relic = this.validate(r)
      if (!relic) {
        result.relics.invalid.push(r)
        return
      }

      let importRelic = relic
      let importId: string | undefined = (r as ICachedRelic).id
      let foundDupOrUpgrade = false
      if (!result.ignoreDups) {
        const { duplicated, upgraded } = this.findDups(
          relic,
          Array.from(idsToRemove)
        )
        if (duplicated[0] || upgraded[0]) {
          foundDupOrUpgrade = true
          // Favor upgrades with the same location, else use 1st dupe
          let [match, isUpgrade] =
            hasEquipment &&
            relic.location &&
            upgraded[0]?.location === relic.location
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
            ? result.relics.upgraded.push(relic)
            : result.relics.unchanged.push(relic)
          idsToRemove.delete(match.id)

          //Imported relic will be set to `importId` later, so remove the dup/upgrade now to avoid a duplicate
          this.remove(match.id, false) // Do not notify, since this is a "replacement"
          if (!importId) importId = match.id // always resolve some id
          importRelic = {
            ...relic,
            location: hasEquipment ? relic.location : match.location,
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
      this.set(importId, importRelic, !foundDupOrUpgrade)
    })
    const idtoRemoveArr = Array.from(idsToRemove)
    if (result.keepNotInImport || result.ignoreDups)
      result.relics.notInImport = idtoRemoveArr.length
    else idtoRemoveArr.forEach((k) => this.remove(k))
  }
  findDups(
    editorRelic: IRelic,
    idList = this.keys
  ): { duplicated: ICachedRelic[]; upgraded: ICachedRelic[] } {
    const { setKey, rarity, level, slotKey, mainStatKey, substats } =
      editorRelic

    const relics = idList
      .map((id) => this.get(id))
      .filter((r) => r) as ICachedRelic[]
    const candidates = relics.filter(
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
              substat.value >= candidate.substats[i].value)
        )
    )

    // Strictly upgraded relic
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
                  substat.value === candidate.substats[i].value
              )
            : substats.some(
                (
                  substat,
                  i // Has extra rolls
                ) =>
                  candidate.substats[i].key
                    ? substat.value > candidate.substats[i].value // Extra roll to existing substat
                    : substat.key // Extra roll to new substat
              ))
      )
      .sort((candidates) =>
        candidates.location === editorRelic.location ? -1 : 1
      )
    // Strictly duplicated relic
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
                  substat.value === candidateSubstat.value
              )
          )
      )
      .sort((candidates) =>
        candidates.location === editorRelic.location ? -1 : 1
      )
    return { duplicated, upgraded }
  }
}

export function cachedRelic(
  flex: IRelic,
  id: string
): { relic: ICachedRelic; errors: string[] } {
  const { location, lock, setKey, slotKey, rarity, mainStatKey } = flex
  const level = Math.round(
    Math.min(Math.max(0, flex.level), relicMaxLevel[rarity])
  )
  const mainStatVal = getRelicMainStatDisplayVal(rarity, mainStatKey, level)

  const errors: string[] = []
  const substats: ICachedSubstat[] = flex.substats.map((substat) => ({
    ...substat,
    rolls: [],
    efficiency: 0,
    accurateValue: substat.value,
  }))
  // Carry over the probability, since its a cached value calculated outside of the relic.
  const validated: ICachedRelic = {
    id,
    setKey,
    location,
    slotKey,
    lock,
    mainStatKey,
    rarity,
    level,
    substats,
    mainStatVal,
  }

  // TODO: Validate rolls
  // const allPossibleRolls: { index: number; substatRolls: number[][] }[] = []
  // let totalUnambiguousRolls = 0

  // function efficiency(value: number, key: RelicSubStatKey): number {
  //   return (value / getSubstatValue(rarity, key, 'high')) * 100
  // }

  // substats.forEach((substat, _index): void => {
  //   const { key, value } = substat
  //   if (!key) {
  //     substat.value = 0
  //     return
  //   }
  //   substat.efficiency = efficiency(value, key)

  //   const possibleRolls = getSubstatRolls(key, value, rarity)

  //   if (possibleRolls.length) {
  //     // Valid Substat
  //     const possibleLengths = new Set(possibleRolls.map((roll) => roll.length))

  //     if (possibleLengths.size !== 1) {
  //       // Ambiguous Rolls
  //       allPossibleRolls.push({ index, substatRolls: possibleRolls })
  //     } else {
  //       // Unambiguous Rolls
  //       totalUnambiguousRolls += possibleRolls[0].length
  //     }

  //     substat.rolls = possibleRolls.reduce((best, current) =>
  //       best.length < current.length ? best : current
  //     )
  //     substat.efficiency = efficiency(
  //       substat.rolls.reduce((a, b) => a + b, 0),
  //       key
  //     )
  //     substat.accurateValue = substat.rolls.reduce((a, b) => a + b, 0)
  //   } else {
  //     // Invalid Substat
  //     substat.rolls = []
  //     // TODO: Translate
  //     errors.push(`Invalid substat ${substat.key}`)
  //   }
  // })

  // if (errors.length) return { relic: validated, errors }

  // const { low, high } = relicSubstatRollData[rarity],
  //   lowerBound = low + Math.floor(level / 3),
  //   upperBound = high + Math.floor(level / 3)

  // let highestScore = -Infinity // -Max(substats.rolls[i].length) over ambiguous rolls
  // const tryAllSubstats = (
  //   rolls: { index: number; roll: number[] }[],
  //   currentScore: number,
  //   total: number
  // ) => {
  //   if (rolls.length === allPossibleRolls.length) {
  //     if (
  //       total <= upperBound &&
  //       total >= lowerBound &&
  //       highestScore < currentScore
  //     ) {
  //       highestScore = currentScore
  //       for (const { index, roll } of rolls) {
  //         const key = substats[index].key as RelicSubStatKey
  //         const accurateValue = roll.reduce((a, b) => a + b, 0)
  //         substats[index].rolls = roll
  //         substats[index].accurateValue = accurateValue
  //         substats[index].efficiency = efficiency(accurateValue, key)
  //       }
  //     }

  //     return
  //   }

  //   const { index, substatRolls } = allPossibleRolls[rolls.length]
  //   for (const roll of substatRolls) {
  //     rolls.push({ index, roll })
  //     const newScore = Math.min(currentScore, -roll.length)
  //     if (newScore >= highestScore)
  //       // Scores won't get better, so we can skip.
  //       tryAllSubstats(rolls, newScore, total + roll.length)
  //     rolls.pop()
  //   }
  // }

  // tryAllSubstats([], Infinity, totalUnambiguousRolls)

  // const totalRolls = substats.reduce(
  //   (accu, { rolls }) => accu + rolls.length,
  //   0
  // )

  // if (totalRolls > upperBound)
  //   errors.push(
  //     `${rarity}-star relic (level ${level}) should have no more than ${upperBound} rolls. It currently has ${totalRolls} rolls.`
  //   )
  // else if (totalRolls < lowerBound)
  //   errors.push(
  //     `${rarity}-star relic (level ${level}) should have at least ${lowerBound} rolls. It currently has ${totalRolls} rolls.`
  //   )

  // if (substats.some((substat) => !substat.key)) {
  //   const substat = substats.find((substat) => (substat.rolls?.length ?? 0) > 1)
  //   if (substat)
  //     // TODO: Translate
  //     errors.push(
  //       `Substat ${substat.key} has > 1 roll, but not all substats are unlocked.`
  //     )
  // }

  return { relic: validated, errors }
}

export function validateRelic(
  obj: unknown = {},
  allowZeroSub = false
): IRelic | undefined {
  if (!obj || typeof obj !== 'object') return undefined
  const { setKey, rarity, slotKey } = obj as IRelic
  let { level, mainStatKey, substats, location, lock } = obj as IRelic

  if (
    !allRelicSetKeys.includes(setKey) ||
    !allRelicSlotKeys.includes(slotKey) ||
    !allRelicMainStatKeys.includes(mainStatKey) ||
    !allRelicRarityKeys.includes(rarity) ||
    typeof level !== 'number' ||
    level < 0 ||
    level > 15
  )
    return undefined // non-recoverable
  level = Math.round(level)
  if (level > relicMaxLevel[rarity]) return undefined

  substats = parseSubstats(substats, rarity, allowZeroSub)
  // substat cannot have same key as mainstat
  if (substats.find((sub) => sub.key === mainStatKey)) return undefined
  lock = !!lock
  const plausibleMainStats = relicSlotToMainStatKeys[slotKey]
  if (!(plausibleMainStats as RelicMainStatKey[]).includes(mainStatKey))
    if (plausibleMainStats.length === 1) mainStatKey = plausibleMainStats[0]
    else return undefined // ambiguous mainstat
  if (!location || !allCharacterLocationKeys.includes(location)) location = ''
  return {
    setKey,
    rarity,
    level,
    slotKey,
    mainStatKey,
    substats,
    location,
    lock,
  }
}
function defSub(): ISubstat {
  return { key: '', value: 0 }
}
function parseSubstats(
  obj: unknown,
  rarity: RelicRarityKey,
  allowZeroSub = false
): ISubstat[] {
  if (!Array.isArray(obj)) return new Array(4).map((_) => defSub())
  const substats = (obj as ISubstat[])
    .slice(0, 4)
    .map(({ key = '', value = 0 }) => {
      if (
        !allRelicSubStatKeys.includes(key as RelicSubStatKey) ||
        typeof value !== 'number' ||
        !isFinite(value)
      )
        return defSub()
      if (key) {
        value = key.endsWith('_')
          ? Math.round(value * 1000) / 1000
          : Math.round(value)
        const { low, high } = getSubstatRange(rarity, key)
        value = clamp(value, allowZeroSub ? 0 : low, high)
      } else value = 0
      return { key, value }
    })
  while (substats.length < 4) substats.push(defSub())

  return substats
}
