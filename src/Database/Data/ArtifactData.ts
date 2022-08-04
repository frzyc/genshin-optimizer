import { IArtifact, ICachedArtifact } from "../../Types/artifact";
import { getRandomInt } from "../../Util/Util";
import { ArtCharDatabase } from "../Database";
import { DataManager } from "../DataManager";
import { parseArtifact } from "../imports/parse";
import { validateArtifact } from "../imports/validate";

export class ArtifactDataManager extends DataManager<string, string, ICachedArtifact, IArtifact>{
  deletedArts = new Set<string>()
  constructor(database: ArtCharDatabase) {
    super(database)
    for (const key of this.database.storage.keys) {
      if (key.startsWith("artifact_")) {
        const obj = this.database.storage.get(key)
        const flex = parseArtifact(obj)
        if (!flex) {
          console.error("Entry", key, "is unrecoverable.", obj)
          this.database.storage.remove(key)
          continue
        }

        // Update relations
        const { location, slotKey } = flex
        const char = this.database.chars.get(location)
        if (location && char && char.equippedArtifacts[slotKey] === "")
          this.database.chars.setEquippedArtifact(location, slotKey, key)
        else flex.location = ""

        const { artifact } = validateArtifact(flex, key)

        this.set(artifact.id, artifact)
      }
    }
  }
  deCache(artifact: ICachedArtifact): IArtifact {
    const { setKey, rarity, level, slotKey, mainStatKey, substats, location, exclude, lock } = artifact
    return { setKey, rarity, level, slotKey, mainStatKey, substats: substats.map(substat => ({ key: substat.key, value: substat.value })), location, exclude, lock }
  }

  new(value: IArtifact): string {
    const id = generateRandomArtID(new Set(this.keys), this.deletedArts)
    const newArt = validateArtifact(parseArtifact({ ...value, location: "" })!, id).artifact
    this.set(id, newArt)
    return id
  }
  remove(key: string) {
    const art = this.get(key)
    if (!art) return

    const char = art.location && this.database.chars.get(art.location)
    if (char && char.equippedArtifacts[art.slotKey] === key)
      this.database.chars.setEquippedArtifact(char.key, art.slotKey, "")
    super.remove(key)
    this.deletedArts.add(key)
  }
  set(id: string, value: Partial<IArtifact>) {
    const oldArt = super.get(id)
    const parsedArt = parseArtifact({ ...oldArt, ...value })
    if (!parsedArt) return

    const newArt = validateArtifact({ ...oldArt, ...parsedArt }, id).artifact

    if (oldArt && newArt.location !== oldArt.location) {
      const slotKey = newArt.slotKey
      const prevChar = this.database.chars.get(oldArt.location)
      const newChar = this.database.chars.get(newArt.location)

      // previously equipped art at new location
      const prevArt = super.get(newChar?.equippedArtifacts[slotKey])

      //current prevArt <-> newChar  && newArt <-> prevChar
      //swap to prevArt <-> prevChar && newArt <-> newChar(outside of this if)

      if (prevArt)
        super.set(prevArt.id, { ...prevArt, location: prevChar?.key ?? "" })
      if (newChar)
        this.database.chars.setEquippedArtifact(newChar.key, slotKey, newArt.id)
      if (prevChar)
        this.database.chars.setEquippedArtifact(prevChar.key, slotKey, prevArt?.id ?? "")
    } else if (newArt.location) // Trigger a update to character as well
      this.database.chars.trigger(newArt.location)

    super.set(id, newArt)
  }
  setProbability(id: string, probability?: number) {
    const art = super.get(id)
    if (art) super.set(id, { ...art, probability })
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
  const range = 2 * (1 + keys.size + rejectedKeys.size)
  let candidate = ""
  do {
    candidate = `artifact_${getRandomInt(1, range)}`
  } while (keys.has(candidate) || rejectedKeys.has(candidate))
  return candidate
}
