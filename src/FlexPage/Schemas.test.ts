import { ArtifactSubstatsData } from "../Data/ArtifactData"
import { amplifyingReactions } from "../StatConstants"
import { allMainStatKeys } from "../Types/artifact"
import { characterSpecializedStatKeys } from "../Types/consts"
import { constants } from "./Schemas"

describe('Export Import', () => {
  test('support all reaction modes', () => {
    expect(constants.reactionModes).toContain(null)

    for (const [reaction, { variants }] of Object.entries(amplifyingReactions))
      for (const variant in variants)
        expect(constants.reactionModes).toContain(`${variant}_${reaction}`)
  })
  test('support all stat keys', () => {
    for (const specializedStat of characterSpecializedStatKeys)
      expect(constants.stats).toContain(specializedStat)

    for (const mainStat of allMainStatKeys)
      expect(constants.stats).toContain(mainStat)
    for (const substat in ArtifactSubstatsData)
      expect(constants.stats).toContain(substat)
  })
})
