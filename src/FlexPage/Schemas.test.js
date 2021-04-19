import { ArtifactMainSlotKeys, ArtifactSlotsData, ArtifactSubStatsData } from "../Data/ArtifactData"
import artifacts from "../Data/Artifacts"
import { CharacterSpecializedStatKey } from "../Data/CharacterData"
import characters from "../Data/Characters"
import { amplifyingReactions } from "../StatConstants"
import { constants } from "./Schemas"

describe('Export Import', () => {
  test('supports all characters', () => {
    for (const characterKey in characters)
      expect(constants.characterKeys).toContain(characterKey)
  })
  test('support all artifacts', () => {
    for (const artifact in artifacts)
      expect(constants.artifactSets).toContain(artifact)
  })
  test('support all slots', () => {
    for (const slot in ArtifactSlotsData)
      expect(constants.slots).toContain(slot)
  })
  test('support all reaction modes', () => {
    expect(constants.reactionModes).toContain(null)

    for (const [reaction, {variants}] of Object.entries(amplifyingReactions))
      for (const variant in variants)
        expect(constants.reactionModes).toContain(`${variant}_${reaction}`)
  })
  test('support all stat keys', () => {
    for (const specializedStat of CharacterSpecializedStatKey)
      expect(constants.stats).toContain(specializedStat)

    for (const mainStat of ArtifactMainSlotKeys)
      expect(constants.stats).toContain(mainStat)
    for (const subStat in ArtifactSubStatsData)
      expect(constants.stats).toContain(subStat)
  })
})
