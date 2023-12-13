import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=4a5k03146R15g09F1aX2a5k04245W02t13g0aY1q5k0i341Y74F1691aa3a5k09446b25K02F17B0m000004L80A00004echaracterLevel281ccharacterATK3283ccharacterDEF3763bcharacterHP5122744Rust2L10101000"
const { artifacts } = parseTestFlexObject(url)

let setupStats
describe("Testing Tartaglia's Formulas (Gilgamesh#1095)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 12274, characterATK: 325 - 42, characterDEF: 763,
      characterEle: "hydro", characterLevel: 81,
      weaponType: "bow", weaponATK: 42, atk_: 9,//Rust Lvl. 1 (Refinement 1)
      normal_dmg_: 40, charged_dmg_: -10,
      hydro_dmg_: 28.8,//specialized

      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard 
      tlvl: Object.freeze({ auto: 7 - 1, skill: 10 - 1, burst: 8 - 1 }),
      constellation: 0,
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { hydro_dmg_: 15, }, // 2 piece heart of depth
    ]))

    describe('no crit', () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(117)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(131)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(157)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(162)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(173)
        expect(formula.normal[5](stats)[0](stats)).toApproximate(206)
        expect(formula.charged.hit(stats)[0](stats)).toApproximate(80)
        expect(formula.charged.full(stats)[0](stats)).toApproximate(1293)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(129)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(259)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(324)

        expect(formula.normal.flash(stats)[0](stats)).toApproximate(165)

        expect(formula.skill.skillDmg(stats)[0](stats)).toApproximate(950)
        expect(formula.skill[0](stats)[0](stats)).toApproximate(682)
        expect(formula.skill[1](stats)[0](stats)).toApproximate(730)
        expect(formula.skill[2](stats)[0](stats)).toApproximate(988)
        expect(formula.skill[3](stats)[0](stats)).toApproximate(1052)
        expect(formula.skill[4](stats)[0](stats)).toApproximate(970)
        expect(formula.skill[5](stats)[0](stats)).toApproximate(621)
        expect(formula.skill[6](stats)[0](stats)).toApproximate(661)
        expect(formula.skill.charged1(stats)[0](stats)).toApproximate(827)
        expect(formula.skill.charged2(stats)[0](stats)).toApproximate(989)

        expect(formula.skill.slash(stats)[0](stats)).toApproximate(873)

        expect(formula.burst.melee(stats)[0](stats)).toApproximate(5447)
        expect(formula.burst.ranged(stats)[0](stats)).toApproximate(4442)
        expect(formula.burst.blast(stats)[0](stats)).toApproximate(1408)
      })
      test('riptide burst vs lvl90 hilichurls', () => {
        setupStats.physical_enemyRes_ = 10
        setupStats.enemyLevel = 90
        const stats = computeAllStats(setupStats)
        expect(formula.normal.burst(stats)[0](stats)).toApproximate(814)
      })
    })
    describe('crit', () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(236)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(264)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(317)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(326)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(348)
        expect(formula.normal[5](stats)[0](stats)).toApproximate(416)
        expect(formula.charged.hit(stats)[0](stats)).toApproximate(161)
        expect(formula.charged.full(stats)[0](stats)).toApproximate(2602)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(261)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(522)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(652)

        expect(formula.normal.flash(stats)[0](stats)).toApproximate(332)

        expect(formula.skill.skillDmg(stats)[0](stats)).toApproximate(1914)
        expect(formula.skill[0](stats)[0](stats)).toApproximate(1373)
        expect(formula.skill[1](stats)[0](stats)).toApproximate(1470)
        expect(formula.skill[2](stats)[0](stats)).toApproximate(1989)
        expect(formula.skill[3](stats)[0](stats)).toApproximate(2117)
        expect(formula.skill[4](stats)[0](stats)).toApproximate(1953)
        expect(formula.skill[5](stats)[0](stats)).toApproximate(1251)
        expect(formula.skill[6](stats)[0](stats)).toApproximate(1330)
        expect(formula.skill.charged1(stats)[0](stats)).toApproximate(1665)
        expect(formula.skill.charged2(stats)[0](stats)).toApproximate(1991)

        expect(formula.skill.slash(stats)[0](stats)).toApproximate(1757)

        expect(formula.burst.melee(stats)[0](stats)).toApproximate(10964)
        expect(formula.burst.ranged(stats)[0](stats)).toApproximate(8941)
        expect(formula.burst.blast(stats)[0](stats)).toApproximate(2835)

      })
      test('riptide burst vs lvl90 hilichurls', () => {
        setupStats.physical_enemyRes_ = 10
        setupStats.enemyLevel = 90
        const stats = computeAllStats(setupStats)
        expect(formula.normal.burst(stats)[0](stats)).toApproximate(1639)
      })
    })
  })
})
