import { allSlotKeys, ArtifactSetKey, SlotKey } from "../../../../Types/consts"
import { objectKeyMap } from "../../../../Util/Util"
import { artSetPerm } from "./foreground"

function* allCombinations(sets: StrictDict<SlotKey, ArtifactSetKey[]>): Iterable<StrictDict<SlotKey, ArtifactSetKey>> {
  for (const flower of sets.flower)
    for (const circlet of sets.circlet)
      for (const goblet of sets.goblet)
        for (const plume of sets.plume)
          for (const sands of sets.sands)
            yield { flower, circlet, goblet, plume, sands }
}

describe("foreground.ts", () => {
  describe("artSetPerm should handle", () => {
    const filter: Dict<ArtifactSetKey, number[]> = { Adventurer: [2], ArchaicPetra: [4] }, excludeRainbow = 4
    const artSets: ArtifactSetKey[] = ["Adventurer", "ArchaicPetra", "Berserker", "BloodstainedChivalry"]
    const perm = [...artSetPerm(filter, artSets, excludeRainbow)]

    for (const combination of allCombinations(objectKeyMap(allSlotKeys, _ => artSets))) {
      let shouldMatch = true, rainbowCount = 0
      for (const key of new Set([...Object.keys(filter), ...Object.values(combination)])) {
        const list = filter[key] ?? []
        let allowed = [0, 1, 2, 3, 4, 5]
        if (list.includes(2)) allowed = allowed.filter(x => x !== 2 && x !== 3)
        if (list.includes(4)) allowed = allowed.filter(x => x !== 4 && x !== 5)
        const count = Object.values(combination).filter(x => x === key).length
        if (count === 1) rainbowCount++
        if (!allowed.includes(count)) shouldMatch = false
      }
      if (rainbowCount >= excludeRainbow) shouldMatch = false
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
