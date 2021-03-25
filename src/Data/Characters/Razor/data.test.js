import { applyArtifacts, computeAllStats, createProxiedStats } from "../TestUtils"
import formula from "./data"
import urlon from 'urlon'

const url1 = "https://frzyc.github.io/genshin-optimizer/#/flex?$dbv:2&characterKey=razor&levelKey=L80&hitMode=critHit&reactionMode:null&artifactConditionals@;&baseStatOverrides$physical_enemyImmunity:false&enemyLevel:77&physical_enemyRes_:70;&weapon$key=PrototypeAminus&levelKey=L80&refineIndex:0&overrideMainVal:0&overrideSubVal:0&conditionalNum:0;&autoInfused:false&talentConditionals@$srcKey=constellation1&conditionalNum:1&srcKey2=WolfsInstinct;;&constellation:3&artifacts@$level:20&numStars:5&mainStatKey=hp&setKey=BloodstainedChivalry&slotKey=flower&substats$critRate_:8.9&atk_:5.8&atk:35&critDMG_:13.2;;&$level:20&numStars:5&mainStatKey=atk&setKey=BloodstainedChivalry&slotKey=plume&substats$eleMas:33&critDMG_:10.9&critRate_:9.3&atk_:8.7;;&$level:16&numStars:5&mainStatKey=atk_&setKey=GladiatorsFinale&slotKey=sands&substats$critDMG_:13.2&atk:51&enerRech_:5.8&hp_:10.5;;&$level:20&numStars:5&mainStatKey=physical_dmg_&setKey=NoblesseOblige&slotKey=goblet&substats$critRate_:10.9&hp_:5.8&critDMG_:5.4&enerRech_:16.8;;&$level:20&numStars:5&mainStatKey=atk_&setKey=GladiatorsFinale&slotKey=circlet&substats$def_:7.3&hp_:13.4&critRate_:7.8&def:42;;;&tlvl@:7&:5&:5"
const charObj1 = urlon.parse(url1.split("flex?")[1])

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
      { hp: 4780, ...charObj1.artifacts[0].substats }, // Flower of Life
      { atk: 311, ...charObj1.artifacts[1].substats }, // Plume of Death
      { atk_: 38.7, ...charObj1.artifacts[2].substats }, // Sands of Eon
      { physical_dmg_: 58.3, ...charObj1.artifacts[3].substats }, // Goblet of Eonothem
      { atk_: 46.6, ...charObj1.artifacts[4].substats }, // Circlet of Logos
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

        //reactions
        expect(stats.overloaded_hit).toApproximate(1961)
        expect(stats.electrocharged_hit).toApproximate(1177)
        expect(stats.shattered_hit).toApproximate(490)

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


const url2 = "https://frzyc.github.io/genshin-optimizer/#/flex?$dbv:2&characterKey=razor&levelKey=L80&hitMode=hit&reactionMode:null&artifactConditionals@;&baseStatOverrides$;&weapon$key=PrototypeAminus&levelKey=L90&refineIndex:1&overrideMainVal:0&overrideSubVal:0&conditionalNum:0;&autoInfused:false&talentConditionals@;&constellation:6&artifacts@$level:16&numStars:4&mainStatKey=hp&setKey=GladiatorsFinale&slotKey=flower&substats$critDMG_:14.3&atk_:8.4&critRate_:2.8&atk:12;;&$level:20&numStars:5&mainStatKey=atk&setKey=GladiatorsFinale&slotKey=plume&substats$hp_:4.1&hp:508&critRate_:3.1&enerRech_:20.1;;&$level:20&numStars:5&mainStatKey=atk_&setKey=GladiatorsFinale&slotKey=sands&substats$atk:68&critRate_:6.2&critDMG_:7&eleMas:21;;&$level:20&numStars:5&mainStatKey=critRate_&setKey=GladiatorsFinale&slotKey=circlet&substats$atk:68&hp_:5.3&enerRech_:10.4&atk_:4.1;;&$level:16&numStars:5&mainStatKey=physical_dmg_&setKey=WanderersTroupe&slotKey=goblet&substats$atk:27&hp:478&eleMas:40&atk_:5.3;;;&tlvl@:0&:0&:0"
const charObj2 = urlon.parse(url2.split("flex?")[1])

describe("Testing Razor's Formulas (sohum#5921)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 10602, characterATK: 772 - 565, characterDEF: 665,
      characterEle: "electro", characterLevel: 80,
      weaponType: "claymore", weaponATK: 565,
      atk_: 27.6,//prototype Archiac R2
      physical_dmg_: 22.5,//specialized

      enemyLevel: 77, physical_enemyRes_: 70, // Ruin Guard
      // dmg_: 10,//C1
      tlvl: Object.freeze({ auto: 8 - 1, skill: 11 - 1, burst: 10 - 1 }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      { hp: 3571, ...charObj2.artifacts[0].substats }, // Flower of Life
      { atk: 311, ...charObj2.artifacts[1].substats }, // Plume of Death
      { atk_: 46.6, ...charObj2.artifacts[2].substats }, // Sands of Eon
      { physical_dmg_: 48.4, ...charObj2.artifacts[3].substats }, // Goblet of Eonothem
      { atk_: 31.1, ...charObj2.artifacts[4].substats }, // Circlet of Logos
      { atk_: 18, normal_dmg_: 35 }, // 4 piece gladiator
    ]))

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(972)
        expect(formula.constellation6.dmg(stats)[0](stats)).toApproximate(935)

        //prototype Archiac R1 dmg
        expect(3 * stats.physical_elemental_hit).toApproximate(1598)
      })

    })
    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(1665)
        expect(formula.constellation6.dmg(stats)[0](stats)).toApproximate(1601)

        //prototype Archiac R1 dmg
        expect(3 * stats.physical_elemental_critHit).toApproximate(2737)
      })
    })
  })
})
