import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"

const string = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=545k01049p14W03z0a4245k03147x0aJ19t14n195g0424a423P08W02F1g5k0c349J12W0aS08E295k04446912629e15G0k203003L8007553mphysical_enemyImmunity3NaNaenemyLevel277iphysical_enemyRes_270fPrototypeAminus3L800101000"
const { artifacts } = parseTestFlexObject(string)

let setupStats
describe("Testing Razor's Formulas (Mabmab#6492)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 10602, characterATK: 704 - 497, characterDEF: 665,
      characterEle: "electro", characterLevel: 80,
      weaponType: "claymore", weaponATK: 497,
      atk_: 25.1,//prototype Archiac R1
      physical_dmg_: 22.5,//specialized

      enemyLevel: 77, physical_enemyRes_: 70, // Ruin Guard
      dmg_: 10,//C1
      tlvl: Object.freeze({ auto: 8 - 1, skill: 6 - 1, burst: 9 - 1 }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { physical_dmg_: 25, atk_: 18 }, // 2 piece bloodstained 2 piece gladiator
    ]))

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(1041)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(897)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(1122)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(1477)
        expect(formula.charged.spinning(stats)[0](stats)).toApproximate(735)
        expect(formula.charged.final(stats)[0](stats)).toApproximate(1329)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(964)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(1928)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(2408)

        expect(formula.skill.press(stats)[0](stats)).toApproximate(2932)
        expect(formula.skill.hold(stats)[0](stats)).toApproximate(4346)

        expect(formula.burst.summon(stats)[0](stats)).toApproximate(2860)
        expect(formula.burst[0](stats)[0](stats)).toApproximate(650)
        expect(formula.burst[1](stats)[0](stats)).toApproximate(560)
        expect(formula.burst[2](stats)[0](stats)).toApproximate(700)
        expect(formula.burst[3](stats)[0](stats)).toApproximate(922)

        //prototype Archiac R1 dmg
        expect(2.4 * stats.physical_elemental_hit).toApproximate(1650)
      })

    })
    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(2008)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(1730)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(2163)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(2848)
        expect(formula.charged.spinning(stats)[0](stats)).toApproximate(1416)
        expect(formula.charged.final(stats)[0](stats)).toApproximate(2562)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(1858)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(3717)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(4642)

        expect(formula.skill.press(stats)[0](stats)).toApproximate(5652)
        expect(formula.skill.hold(stats)[0](stats)).toApproximate(8377)

        expect(formula.burst.summon(stats)[0](stats)).toApproximate(5513)
        expect(formula.burst[0](stats)[0](stats)).toApproximate(1252)
        expect(formula.burst[1](stats)[0](stats)).toApproximate(1079)
        expect(formula.burst[2](stats)[0](stats)).toApproximate(1349)
        expect(formula.burst[3](stats)[0](stats)).toApproximate(1777)
        //prototype Archiac R1 dmg
        expect(2.4 * stats.physical_elemental_critHit).toApproximate(3181)
      })
    })
  })
})
