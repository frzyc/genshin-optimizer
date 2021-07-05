import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=1a5k0c341y65z0961aR1x106003L90008934atk_225iphysical_enemyRes_270aenemyLevel285cSkywardPride3L4001010131c1x1e2111c0"
const { artifacts } = parseTestFlexObject(url)

let setupStats
describe("Testing Eula's Formulas (Jilanow#9252)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 13226, characterATK: 342, characterDEF: 751,
      characterEle: "cryo", characterLevel: 90,
      weaponType: "claymore", weaponATK: 261, enerRech_: 20.6, dmg_: 8,//Skyward Pride Lvl. 40 (Refinement 1)
      critDMG_: 38.4,//specialized
      atk_: 25,//pyro resonance
      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard
      tlvl: Object.freeze({ auto: 1 - 1, skill: 9 - 1, burst: 13 - 1 }),
      constellation: 6,
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
    ]))

    describe('no crit', () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("After hold Skill", () => {
        setupStats.physical_enemyRes_ -= 24
        setupStats.cryo_enemyRes_ -= 24
        setupStats.physical_dmg_ += 30 //C1
        const stats = computeAllStats(setupStats)

        expect(formula.skill.holdDMG(stats)[0](stats)).toApproximate(1841)
        expect(formula.skill.brandDMG(stats)[0](stats)).toApproximate(719)
        expect(formula.passive1.dmg(stats)[0](stats)).toApproximate(1865)
        expect(formula.passive1.dmg50(stats)[0](stats)).toApproximate(2103)
      })

    })
  })
})
