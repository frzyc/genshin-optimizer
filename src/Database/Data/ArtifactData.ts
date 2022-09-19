import Artifact from "../../Data/Artifacts/Artifact";
import KeyMap from "../../KeyMap";
import { allMainStatKeys, allSubstatKeys, IArtifact, ICachedArtifact, ICachedSubstat, ISubstat, SubstatKey } from "../../Types/artifact";
import { allArtifactRarities, allArtifactSets, allSlotKeys, charKeyToLocCharKey, locationCharacterKeys } from "../../Types/consts";
import { ArtCharDatabase } from "../Database";
import { DataManager } from "../DataManager";

export class ArtifactDataManager extends DataManager<string, string, ICachedArtifact, IArtifact>{
  deletedArts = new Set<string>()
  constructor(database: ArtCharDatabase) {
    super(database)
    for (const key of this.database.storage.keys)
      if (key.startsWith("artifact_"))
        if (!this.set(key, this.database.storage.get(key) as any))
          this.database.storage.remove(key)
  }
  validate(obj: object): IArtifact | undefined {
    return validateArtifact(obj)
  }
  toCache(storageObj: IArtifact, id: string): ICachedArtifact | undefined {
    // Generate cache fields
    const newArt = cachedArtifact(storageObj, id).artifact

    // Check relations and update equipment
    const oldArt = super.get(id)
    if (newArt.location !== oldArt?.location) {
      const slotKey = newArt.slotKey
      const prevChar = oldArt?.location ? this.database.chars.getWithInitWeapon(oldArt.location) : undefined
      const newChar = newArt.location ? this.database.chars.getWithInitWeapon(newArt.location) : undefined

      // previously equipped art at new location
      const prevArt = super.get(newChar?.equippedArtifacts[slotKey])

      //current prevArt <-> newChar  && newArt <-> prevChar
      //swap to prevArt <-> prevChar && newArt <-> newChar(outside of this if)

      if (prevArt)
        super.setCached(prevArt.id, { ...prevArt, location: prevChar?.key ? charKeyToLocCharKey(prevChar.key) : "" })
      if (newChar)
        this.database.chars.setEquippedArtifact(charKeyToLocCharKey(newChar.key), slotKey, newArt.id)
      if (prevChar)
        this.database.chars.setEquippedArtifact(charKeyToLocCharKey(prevChar.key), slotKey, prevArt?.id ?? "")
    } else
      newArt.location && this.database.chars.triggerCharacter(newArt.location, "update")
    return newArt
  }
  deCache(artifact: ICachedArtifact): IArtifact {
    const { setKey, rarity, level, slotKey, mainStatKey, substats, location, exclude, lock } = artifact
    return { setKey, rarity, level, slotKey, mainStatKey, substats: substats.map(substat => ({ key: substat.key, value: substat.value })), location, exclude, lock }
  }

  new(value: IArtifact): string {
    const id = generateRandomArtID(new Set(this.keys), this.deletedArts)
    this.set(id, value)
    return id
  }
  remove(key: string) {
    const art = this.get(key)
    if (!art) return
    art.location && this.database.chars.setEquippedArtifact(art.location, art.slotKey, "")
    this.deletedArts.add(key)
    super.remove(key)
  }
  setProbability(id: string, probability?: number) {
    const art = this.get(id)
    if (art) this.setCached(id, { ...art, probability })
  }
  clear(): void {
    super.clear()
    this.deletedArts = new Set<string>()
  }

  findDups(editorArt: IArtifact): { duplicated: ICachedArtifact[], upgraded: ICachedArtifact[] } {
    const { setKey, rarity, level, slotKey, mainStatKey, substats } = editorArt

    const candidates = this.values.filter(candidate =>
      setKey === candidate.setKey &&
      rarity === candidate.rarity &&
      slotKey === candidate.slotKey &&
      mainStatKey === candidate.mainStatKey &&
      level >= candidate.level &&
      substats.every((substat, i) =>
        !candidate.substats[i].key || // Candidate doesn't have anything on this slot
        (substat.key === candidate.substats[i].key && // Or editor simply has better substat
          substat.value >= candidate.substats[i].value)
      )
    )

    // Strictly upgraded artifact
    const upgraded = candidates.filter(candidate =>
      level > candidate.level &&
      (Math.floor(level / 4) === Math.floor(candidate.level / 4) ? // Check for extra rolls
        substats.every((substat, i) => // Has no extra roll
          substat.key === candidate.substats[i].key && substat.value === candidate.substats[i].value) :
        substats.some((substat, i) => // Has extra rolls
          candidate.substats[i].key ?
            substat.value > candidate.substats[i].value : // Extra roll to existing substat
            substat.key // Extra roll to new substat
        )
      )
    )
    // Strictly duplicated artifact
    const duplicated = candidates.filter(candidate =>
      level === candidate.level &&
      substats.every(substat =>
        !substat.key ||  // Empty slot
        candidate.substats.some(candidateSubstat =>
          substat.key === candidateSubstat.key && // Or same slot
          substat.value === candidateSubstat.value
        )))
    return { duplicated, upgraded }
  }
}

/// Get a random integer (converted to string) that is not in `keys`
function generateRandomArtID(keys: Set<string>, rejectedKeys: Set<string>): string {
  let ind = keys.size + rejectedKeys.size
  let candidate = ""
  do {
    candidate = `artifact_${ind++}`
  } while (keys.has(candidate) || rejectedKeys.has(candidate))
  return candidate
}

export function cachedArtifact(flex: IArtifact, id: string): { artifact: ICachedArtifact, errors: string[] } {
  const { location, exclude, lock, setKey, slotKey, rarity, mainStatKey } = flex
  const level = Math.round(Math.min(Math.max(0, flex.level), rarity >= 3 ? rarity * 4 : 4))
  const mainStatVal = Artifact.mainStatValue(mainStatKey, rarity, level)!

  const errors: string[] = []
  const substats: ICachedSubstat[] = flex.substats.map(substat => ({ ...substat, rolls: [], efficiency: 0, accurateValue: substat.value }))
  // Carry over the probability, since its a cached value calculated outside of the artifact.
  const validated: ICachedArtifact = { id, setKey, location, slotKey, exclude, lock, mainStatKey, rarity, level, substats, mainStatVal, probability: ((flex as any).probability) }

  const allPossibleRolls: { index: number, substatRolls: number[][] }[] = []
  let totalUnambiguousRolls = 0

  function efficiency(value: number, key: SubstatKey): number {
    return value / Artifact.substatValue(key) * 100
  }

  substats.forEach((substat, index) => {
    const { key, value } = substat
    if (!key) return substat.value = 0
    substat.efficiency = efficiency(value, key)

    const possibleRolls = Artifact.getSubstatRolls(key, value, rarity)

    if (possibleRolls.length) { // Valid Substat
      const possibleLengths = new Set(possibleRolls.map(roll => roll.length))

      if (possibleLengths.size !== 1) { // Ambiguous Rolls
        allPossibleRolls.push({ index, substatRolls: possibleRolls })
      } else { // Unambiguous Rolls
        totalUnambiguousRolls += possibleRolls[0].length
      }

      substat.rolls = possibleRolls.reduce((best, current) => best.length < current.length ? best : current)
      substat.efficiency = efficiency(substat.rolls.reduce((a, b) => a + b, 0), key)
      substat.accurateValue = substat.rolls.reduce((a, b) => a + b, 0)
    } else { // Invalid Substat
      substat.rolls = []
      errors.push(`Invalid substat ${KeyMap.getStr(substat.key)}`)
    }
  })

  if (errors.length) return { artifact: validated, errors }

  const { low, high } = Artifact.rollInfo(rarity), lowerBound = low + Math.floor(level / 4), upperBound = high + Math.floor(level / 4)

  let highestScore = -Infinity // -Max(substats.rolls[i].length) over ambiguous rolls
  const tryAllSubstats = (rolls: { index: number, roll: number[] }[], currentScore: number, total: number) => {
    if (rolls.length === allPossibleRolls.length) {
      if (total <= upperBound && total >= lowerBound && highestScore < currentScore) {
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
      let newScore = Math.min(currentScore, -roll.length)
      if (newScore >= highestScore) // Scores won't get better, so we can skip.
        tryAllSubstats(rolls, newScore, total + roll.length)
      rolls.pop()
    }
  }

  tryAllSubstats([], Infinity, totalUnambiguousRolls)

  const totalRolls = substats.reduce((accu, { rolls }) => accu + rolls.length, 0)

  if (totalRolls > upperBound)
    errors.push(`${rarity}-star artifact (level ${level}) should have no more than ${upperBound} rolls. It currently has ${totalRolls} rolls.`)
  else if (totalRolls < lowerBound)
    errors.push(`${rarity}-star artifact (level ${level}) should have at least ${lowerBound} rolls. It currently has ${totalRolls} rolls.`)

  if (substats.some((substat) => !substat.key)) {
    let substat = substats.find(substat => (substat.rolls?.length ?? 0) > 1)
    if (substat)
      errors.push(`Substat ${KeyMap.getStr(substat.key)} has > 1 roll, but not all substats are unlocked.`)
  }

  return { artifact: validated, errors }
}


export function validateArtifact(obj: any): IArtifact | undefined {
  if (typeof obj !== "object") return

  let {
    setKey, rarity, level, slotKey, mainStatKey, substats, location, exclude, lock,
  } = obj ?? {}

  if (!allArtifactSets.includes(setKey) ||
    !allSlotKeys.includes(slotKey) ||
    !allMainStatKeys.includes(mainStatKey) ||
    !allArtifactRarities.includes(rarity) ||
    typeof level !== "number" || level < 0 || level > 20)
    return // non-recoverable

  // TODO:
  // These two requires information from artifact sheet,
  // which normally isn't loaded at this point yet.
  // - Validate artifact set vs slot
  // - Validate artifact set vs rarity
  substats = parseSubstats(substats)
  lock = !!lock
  exclude = !!exclude
  level = Math.round(level)
  const plausibleMainStats = Artifact.slotMainStats(slotKey)
  if (!plausibleMainStats.includes(mainStatKey))
    if (plausibleMainStats.length === 1) mainStatKey = plausibleMainStats[0]
    else return // ambiguous mainstat
  if (!locationCharacterKeys.includes(location)) location = ""
  return { setKey, rarity, level, slotKey, mainStatKey, substats, location, exclude, lock }
}
function parseSubstats(obj: any): ISubstat[] {
  if (!Array.isArray(obj))
    return new Array(4).map(_ => ({ key: "", value: 0 }))
  const substats = obj.slice(0, 4).map(({ key = undefined, value = undefined }) => {
    if (!allSubstatKeys.includes(key) || typeof value !== "number" || !isFinite(value))
      return { key: "", value: 0 }
    value = key.endsWith("_") ? Math.round(value * 10) / 10 : Math.round(value)
    return { key, value }
  })
  while (substats.length < 4)
    substats.push({ key: "", value: 0 })

  return substats
}
