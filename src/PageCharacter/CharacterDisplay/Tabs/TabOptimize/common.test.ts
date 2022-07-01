import { ArtSetExclusion } from "../../../../Database/Data/BuildsettingData"
import { allSlotKeys, ArtifactSetKey, SlotKey } from "../../../../Types/consts"
import { objectKeyMap } from "../../../../Util/Util"
import { artSetPerm, exclusionToAllowed } from "./common"

function* allCombinations(sets: StrictDict<SlotKey, ArtifactSetKey[]>): Iterable<StrictDict<SlotKey, ArtifactSetKey>> {
  for (const flower of sets.flower)
    for (const circlet of sets.circlet)
      for (const goblet of sets.goblet)
        for (const plume of sets.plume)
          for (const sands of sets.sands)
            yield { flower, circlet, goblet, plume, sands }
}

describe("common.ts", () => {
  describe("artSetPerm should handle", () => {
    const filter: ArtSetExclusion = { Adventurer: [2, 4], ArchaicPetra: [4], Berserker: [2, 4], rainbow: [2, 4] }
    const artSets: ArtifactSetKey[] = ["Adventurer", "ArchaicPetra", "Berserker", "BloodstainedChivalry"]
    const perm = [...artSetPerm(filter, artSets)], allowedRainbows = exclusionToAllowed(filter.rainbow)

    for (const combination of allCombinations(objectKeyMap(allSlotKeys, _ => artSets))) {
      let shouldMatch = true, rainbowCount = 0
      for (const key of new Set([...Object.keys(filter), ...Object.values(combination)])) {
        const allowed = exclusionToAllowed(filter[key])
        const count = Object.values(combination).filter(x => x === key).length
        if (count === 1) rainbowCount++
        if (!allowed.has(count)) shouldMatch = false
      }
      if (!allowedRainbows.has(rainbowCount)) shouldMatch = false
      const matchCount = perm.filter(filters =>
        allSlotKeys.every(slot => {
          const art = combination[slot]
          const filter = filters[slot]
          switch (filter.kind) {
            case "id": throw new Error("ID filter in artSetPerm")
            case "required": return filter.sets.has(art)
            case "exclude": return !filter.sets.has(art)
          }
        })).length

      test(`Set ${Object.values(combination)}`, () => {
        expect(matchCount).toEqual(shouldMatch ? 1 : 0)
      })
    }
  })
})
