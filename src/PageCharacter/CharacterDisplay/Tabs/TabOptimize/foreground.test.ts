import { allSlotKeys, ArtifactSetKey, SlotKey } from "../../../../Types/consts"
import { objectKeyMap } from "../../../../Util/Util"

/*
describe("foreground.ts", () => {
  describe("artSetPerm should handle", () => {
    function* allCombinations(sets: StrictDict<SlotKey, ArtifactSetKey[]>): Iterable<StrictDict<SlotKey, ArtifactSetKey>> {
      for (const flower of sets.flower)
        for (const circlet of sets.circlet)
          for (const goblet of sets.goblet)
            for (const plume of sets.plume)
              for (const sands of sets.sands)
                yield { flower, circlet, goblet, plume, sands }
    }
    const filter = [
      { key: "Adventurer" as const, min: 2, max: 4 },
      { key: "ArchaicPetra" as const, min: 1, max: 3 },
    ]
    const perm = [...artSetPerm([filter])]
    const artSets: ArtifactSetKey[] = ["Adventurer", "ArchaicPetra", "Berserker", "BloodstainedChivalry"]
    for (const combination of allCombinations(objectKeyMap(allSlotKeys, _ => artSets))) {
      let shouldMatch = true
      for (const { key, min, max } of filter) {
        const count = Object.values(combination).filter(x => x === key).length
        if (count < min || count > max) shouldMatch = false
      }
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
*/
