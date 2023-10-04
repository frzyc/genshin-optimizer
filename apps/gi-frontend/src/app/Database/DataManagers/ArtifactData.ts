import type { MainStatKey, SubstatKey } from '@genshin-optimizer/consts'
import {
  allArtifactSetKeys,
  allArtifactSlotKeys,
  allLocationCharacterKeys,
  allMainStatKeys,
  allSubstatKeys,
  artMaxLevel,
  artSlotsData,
  artSubstatRollData,
  charKeyToLocCharKey,
} from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import {
  getMainStatDisplayValue,
  getSubstatRange,
  getSubstatRolls,
  getSubstatValue,
} from '@genshin-optimizer/gi-util'
import { clamp } from '@genshin-optimizer/util'
import type {
  IArtifact,
  ICachedArtifact,
  ICachedSubstat,
  ISubstat,
} from '../../Types/artifact'
import type { ArtifactRarity } from '../../Types/consts'
import { allArtifactRarities } from '../../Types/consts'
import { KeyMap } from '../../Util/KeyMap'
import type { ArtCharDatabase } from '../Database'
import { DataManager } from '../DataManager'
import type { IGO, IGOOD, ImportResult } from '../exim'

export class ArtifactDataManager extends DataManager<
  string,
  'artifacts',
  ICachedArtifact,
  IArtifact
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'artifacts')
    for (const key of this.database.storage.keys)
      if (key.startsWith('artifact_') && !this.set(key, {}))
        this.database.storage.remove(key)
  }
  override validate(obj: unknown): IArtifact | undefined {
    return validateArtifact(obj)
  }
  override toCache(
    storageObj: IArtifact,
    id: string
  ): ICachedArtifact | undefined {
    // Generate cache fields
    const newArt = cachedArtifact(storageObj, id).artifact

    // Check relations and update equipment
    const oldArt = super.get(id)
    if (newArt.location !== oldArt?.location) {
      const slotKey = newArt.slotKey
      const prevChar = oldArt?.location
        ? this.database.chars.getWithInitWeapon(
            this.database.chars.LocationToCharacterKey(oldArt.location)
          )
        : undefined
      const newChar = newArt.location
        ? this.database.chars.getWithInitWeapon(
            this.database.chars.LocationToCharacterKey(newArt.location)
          )
        : undefined

      // previously equipped art at new location
      const prevArt = super.get(newChar?.equippedArtifacts[slotKey])

      //current prevArt <-> newChar  && newArt <-> prevChar
      //swap to prevArt <-> prevChar && newArt <-> newChar(outside of this if)

      if (prevArt)
        super.setCached(prevArt.id, {
          ...prevArt,
          location: prevChar?.key ? charKeyToLocCharKey(prevChar.key) : '',
        })
      if (newChar)
        this.database.chars.setEquippedArtifact(
          charKeyToLocCharKey(newChar.key),
          slotKey,
          newArt.id
        )
      if (prevChar)
        this.database.chars.setEquippedArtifact(
          charKeyToLocCharKey(prevChar.key),
          slotKey,
          prevArt?.id ?? ''
        )
    } else
      newArt.location &&
        this.database.chars.triggerCharacter(newArt.location, 'update')
    return newArt
  }
  override deCache(artifact: ICachedArtifact): IArtifact {
    const {
      setKey,
      rarity,
      level,
      slotKey,
      mainStatKey,
      substats,
      location,
      lock,
    } = artifact
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

  new(value: IArtifact): string {
    const id = this.generateKey()
    this.set(id, value)
    return id
  }
  override remove(key: string, notify = true) {
    const art = this.get(key)
    if (!art) return
    art.location &&
      this.database.chars.setEquippedArtifact(art.location, art.slotKey, '')
    super.remove(key, notify)
  }
  setProbability(id: string, probability: number) {
    const art = this.get(id)
    if (art) this.setCached(id, { ...art, probability })
  }
  override clear(): void {
    super.clear()
  }
  override importGOOD(good: IGOOD & IGO, result: ImportResult) {
    result.artifacts.beforeMerge = this.values.length

    // Match artifacts for counter, metadata, and locations
    const artifacts = good.artifacts

    if (!Array.isArray(artifacts) || !artifacts.length) {
      result.artifacts.notInImport = this.values.length
      return
    }

    const takenIds = new Set(this.keys)
    artifacts.forEach((a) => {
      const id = (a as ICachedArtifact).id
      if (!id) return
      takenIds.add(id)
    })

    result.artifacts.import = artifacts.length
    const idsToRemove = new Set(this.values.map((a) => a.id))
    const hasEquipment = artifacts.some((a) => a.location)
    artifacts.forEach((a): void => {
      const art = this.validate(a)
      if (!art) {
        result.artifacts.invalid.push(a)
        return
      }

      let importArt = art
      let importId: string | undefined = (a as ICachedArtifact).id
      let foundDupOrUpgrade = false
      if (!result.ignoreDups) {
        const { duplicated, upgraded } = this.findDups(
          art,
          Array.from(idsToRemove)
        )
        if (duplicated[0] || upgraded[0]) {
          foundDupOrUpgrade = true
          // Favor upgrades with the same location, else use 1st dupe
          let [match, isUpgrade] =
            hasEquipment &&
            art.location &&
            upgraded[0]?.location === art.location
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
            ? result.artifacts.upgraded.push(art)
            : result.artifacts.unchanged.push(art)
          idsToRemove.delete(match.id)

          //Imported artifact will be set to `importId` later, so remove the dup/upgrade now to avoid a duplicate
          this.remove(match.id, false) // Do not notify, since this is a "replacement"
          if (!importId) importId = match.id // always resolve some id
          importArt = {
            ...art,
            location: hasEquipment ? art.location : match.location,
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
      this.set(importId, importArt, !foundDupOrUpgrade)
    })
    const idtoRemoveArr = Array.from(idsToRemove)
    if (result.keepNotInImport || result.ignoreDups)
      result.artifacts.notInImport = idtoRemoveArr.length
    else idtoRemoveArr.forEach((k) => this.remove(k))

    this.database.weapons.ensureEquipments()
  }
  findDups(
    editorArt: IArtifact,
    idList = this.keys
  ): { duplicated: ICachedArtifact[]; upgraded: ICachedArtifact[] } {
    const { setKey, rarity, level, slotKey, mainStatKey, substats } = editorArt

    const arts = idList
      .map((id) => this.get(id))
      .filter((a) => a) as ICachedArtifact[]
    const candidates = arts.filter(
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

    // Strictly upgraded artifact
    const upgraded = candidates
      .filter(
        (candidate) =>
          level > candidate.level &&
          (Math.floor(level / 4) === Math.floor(candidate.level / 4) // Check for extra rolls
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
        candidates.location === editorArt.location ? -1 : 1
      )
    // Strictly duplicated artifact
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
        candidates.location === editorArt.location ? -1 : 1
      )
    return { duplicated, upgraded }
  }
}

export function cachedArtifact(
  flex: IArtifact,
  id: string
): { artifact: ICachedArtifact; errors: string[] } {
  const { location, lock, setKey, slotKey, rarity, mainStatKey } = flex
  const level = Math.round(
    Math.min(Math.max(0, flex.level), rarity >= 3 ? rarity * 4 : 4)
  )
  const mainStatVal = getMainStatDisplayValue(mainStatKey, rarity, level)

  const errors: string[] = []
  const substats: ICachedSubstat[] = flex.substats.map((substat) => ({
    ...substat,
    rolls: [],
    efficiency: 0,
    accurateValue: substat.value,
  }))
  // Carry over the probability, since its a cached value calculated outside of the artifact.
  const validated: ICachedArtifact = {
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
    probability: (flex as any).probability,
  }

  const allPossibleRolls: { index: number; substatRolls: number[][] }[] = []
  let totalUnambiguousRolls = 0

  function efficiency(value: number, key: SubstatKey): number {
    return (value / getSubstatValue(key)) * 100
  }

  substats.forEach((substat, index): void => {
    const { key, value } = substat
    if (!key) {
      substat.value = 0
      return
    }
    substat.efficiency = efficiency(value, key)

    const possibleRolls = getSubstatRolls(key, value, rarity)

    if (possibleRolls.length) {
      // Valid Substat
      const possibleLengths = new Set(possibleRolls.map((roll) => roll.length))

      if (possibleLengths.size !== 1) {
        // Ambiguous Rolls
        allPossibleRolls.push({ index, substatRolls: possibleRolls })
      } else {
        // Unambiguous Rolls
        totalUnambiguousRolls += possibleRolls[0].length
      }

      substat.rolls = possibleRolls.reduce((best, current) =>
        best.length < current.length ? best : current
      )
      substat.efficiency = efficiency(
        substat.rolls.reduce((a, b) => a + b, 0),
        key
      )
      substat.accurateValue = substat.rolls.reduce((a, b) => a + b, 0)
    } else {
      // Invalid Substat
      substat.rolls = []
      errors.push(`Invalid substat ${KeyMap.getStr(substat.key)}`)
    }
  })

  if (errors.length) return { artifact: validated, errors }

  const { low, high } = artSubstatRollData[rarity],
    lowerBound = low + Math.floor(level / 4),
    upperBound = high + Math.floor(level / 4)

  let highestScore = -Infinity // -Max(substats.rolls[i].length) over ambiguous rolls
  const tryAllSubstats = (
    rolls: { index: number; roll: number[] }[],
    currentScore: number,
    total: number
  ) => {
    if (rolls.length === allPossibleRolls.length) {
      if (
        total <= upperBound &&
        total >= lowerBound &&
        highestScore < currentScore
      ) {
        highestScore = currentScore
        for (const { index, roll } of rolls) {
          const key = substats[index].key as SubstatKey
          const accurateValue = roll.reduce((a, b) => a + b, 0)
          substats[index].rolls = roll
          substats[index].accurateValue = accurateValue
          substats[index].efficiency = efficiency(accurateValue, key)
        }
      }

      return
    }

    const { index, substatRolls } = allPossibleRolls[rolls.length]
    for (const roll of substatRolls) {
      rolls.push({ index, roll })
      const newScore = Math.min(currentScore, -roll.length)
      if (newScore >= highestScore)
        // Scores won't get better, so we can skip.
        tryAllSubstats(rolls, newScore, total + roll.length)
      rolls.pop()
    }
  }

  tryAllSubstats([], Infinity, totalUnambiguousRolls)

  const totalRolls = substats.reduce(
    (accu, { rolls }) => accu + rolls.length,
    0
  )

  if (totalRolls > upperBound)
    errors.push(
      `${rarity}-star artifact (level ${level}) should have no more than ${upperBound} rolls. It currently has ${totalRolls} rolls.`
    )
  else if (totalRolls < lowerBound)
    errors.push(
      `${rarity}-star artifact (level ${level}) should have at least ${lowerBound} rolls. It currently has ${totalRolls} rolls.`
    )

  if (substats.some((substat) => !substat.key)) {
    const substat = substats.find((substat) => (substat.rolls?.length ?? 0) > 1)
    if (substat)
      errors.push(
        `Substat ${KeyMap.getStr(
          substat.key
        )} has > 1 roll, but not all substats are unlocked.`
      )
  }

  return { artifact: validated, errors }
}

export function validateArtifact(
  obj: unknown = {},
  allowZeroSub = false
): IArtifact | undefined {
  if (!obj || typeof obj !== 'object') return undefined
  const { setKey, rarity, slotKey } = obj as IArtifact
  let { level, mainStatKey, substats, location, lock } = obj as IArtifact

  if (
    !allArtifactSetKeys.includes(setKey) ||
    !allArtifactSlotKeys.includes(slotKey) ||
    !allMainStatKeys.includes(mainStatKey) ||
    !allArtifactRarities.includes(rarity) ||
    typeof level !== 'number' ||
    level < 0 ||
    level > 20
  )
    return undefined // non-recoverable
  const data = allStats.art.data[setKey]
  if (!data.slots.includes(slotKey)) return undefined
  if (!data.rarities.includes(rarity)) return undefined
  level = Math.round(level)
  if (level > artMaxLevel[rarity]) return undefined

  substats = parseSubstats(substats, rarity, allowZeroSub)
  // substat cannot have same key as mainstat
  if (substats.find((sub) => sub.key === mainStatKey)) return undefined
  lock = !!lock
  const plausibleMainStats = artSlotsData[slotKey].stats
  if (!(plausibleMainStats as unknown as MainStatKey[]).includes(mainStatKey))
    if (plausibleMainStats.length === 1) mainStatKey = plausibleMainStats[0]
    else return undefined // ambiguous mainstat
  if (!location || !allLocationCharacterKeys.includes(location)) location = ''
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
  rarity: ArtifactRarity,
  allowZeroSub = false
): ISubstat[] {
  if (!Array.isArray(obj)) return new Array(4).map((_) => defSub())
  const substats = (obj as ISubstat[])
    .slice(0, 4)
    .map(({ key = '', value = 0 }) => {
      if (
        !allSubstatKeys.includes(key as SubstatKey) ||
        typeof value !== 'number' ||
        !isFinite(value)
      )
        return defSub()
      if (key) {
        value = key.endsWith('_')
          ? Math.round(value * 10) / 10
          : Math.round(value)
        const { low, high } = getSubstatRange(rarity, key)
        value = clamp(value, allowZeroSub ? 0 : low, high)
      } else value = 0
      return { key, value }
    })
  while (substats.length < 4) substats.push(defSub())

  return substats
}
