import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../../TestUtils"
import formula from "./data"

let setupStats

// Agent RAF#3111 data male
const url = "http://localhost:3000/genshin-optimizer/#/flex?v=2&d=54500d344L08J02R000094g0104aY19s03q02G0t5004443i08W07j0000t5003141L35l09z04W0t5004245j09v01L3000n000004L80A00000fFesteringDesire4L80A41010011"
const { artifacts } = parseTestFlexObject(url)

describe("Agent RAF#3111 Traveler Anemo", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 10122, characterATK: 198, characterDEF: 635,
      characterEle: "anemo", characterLevel: 80,
      weaponType: "sword", weaponATK: 475,

      atk_: 24, // Specialize stat
      enerRech_: 16 + 41.9, //C2 + Festering 80A
      skill_dmg_: 32, // Festering passive
      skill_critRate_: 12,
      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard
      tlvl: Object.freeze({ auto: 4 - 1, skill: 9 - 1, burst: 9 - 1 }),
    })
  })

  describe("Ruin Guard lvl 85 with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { anemo_dmg_: 15, }, // Viridescent Venerer 2 Pieces Set

    ]))
    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hits", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(91)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(89)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(109)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(120)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(145)
        expect(formula.charged[0](stats)[0](stats)).toApproximate(115)
        expect(formula.charged[1](stats)[0](stats)).toApproximate(125)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(131)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(263)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(329)
        expect(formula.skill.initial_dmg(stats)[0](stats)).toApproximate(151)
        expect(formula.skill.initial_max(stats)[0](stats)).toApproximate(212)
        expect(formula.skill.storm_dmg(stats)[0](stats)).toApproximate(2227)
        expect(formula.skill.storm_max(stats)[0](stats)).toApproximate(2430)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(810)
      })
    })
  })
})