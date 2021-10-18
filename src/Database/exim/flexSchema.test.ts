import { amplifyingReactions } from "../../StatConstants"
import { allMainStatKeys, allSubstats } from "../../Types/artifact"
import { characterSpecializedStatKeys } from "../../Types/consts"
import { constants } from "./flexSchema"

describe('Export Import', () => {
  test('support all reaction modes', () => {
    expect(constants.reactionModes).toContain("")

    for (const [reaction, { variants }] of Object.entries(amplifyingReactions))
      for (const variant in variants)
        expect(constants.reactionModes).toContain(`${variant}_${reaction}`)
  })
  test('support all stat keys', () => {
    for (const specializedStat of characterSpecializedStatKeys)
      expect(constants.stats).toContain(specializedStat)

    for (const mainStat of allMainStatKeys)
      expect(constants.stats).toContain(mainStat)
    for (const substat of allSubstats)
      expect(constants.stats).toContain(substat)
  })
})
