import { PreprocessFormulas, StatData } from "../../StatData"
import { GetDependencies } from "../../StatDependency"
import characters from "../../Data/Characters";

function _test(calculated, experiment, epsilon = 0.006) {
  if (experiment < epsilon && calculated < epsilon) {
    expect(Math.abs(calculated - experiment) / 1e6).toBeLessThan(epsilon**4)
  } else {
    expect(Math.abs(calculated - experiment) / experiment).toBeLessThan(epsilon)
  }
}

// Discord ID: 249928411441659905
// Discord Handle: ZyrenLe#5042
const ZhongliSetupZyrenLe = {
  talents: {
    "auto": 6 - 1,
    "skill": 7 - 1,
    "burst": 8 - 1
  },
  statFixture: () => {
    const rawStat = {
      characterHP: 14695, characterATK: 251, characterDEF: 738, critRate_: 5,
      characterLevel: 90,
      characterEle: "geo",

      weaponATK: 23,

      physical_enemyRes_: 10,
      geo_enemyRes_: 10,
      enemyLevel: 93,

      hp: 0, hp_: 0, atk: 0, atk_: 0, def: 0, def_: 0,
      critRate_: 5, critDMG_: 50, enerRech_: 100, eleMas: 0,
      geo_dmg_: 28.8,

      burst_dmg_: 20,
    }
    return { ...rawStat };
  },
  targets: [
    "finalHP", "finalATK", "finalDEF", "critRate_",
    "physical_normal_hit", "physical_charged_hit", "physical_plunging_hit",
    "physical_normal_critHit", "physical_charged_critHit", "physical_plunging_critHit",
    "geo_skill_hit", "geo_burst_hit",
    "geo_skill_critHit", "geo_burst_critHit",
  ],
  equipArtifacts: (stat) => {
    // Flower of Life
    stat.hp += 4780
    stat.def += 39
    stat.enerRech_ += 14.9
    stat.critDMG_ += 7.0
    stat.critRate_ += 6.2
    // Plume of Death
    stat.atk += 311
    stat.def += 39
    stat.enerRech_ += 5.8
    stat.critRate_ += 3.5
    stat.critDMG_ += 35.7
    // Sand of Eon
    stat.atk_ += 46.6
    stat.enerRech_ += 12.3
    stat.critRate_ += 6.2
    stat.hp_ += 8.2
    stat.hp += 538
    // Goblet of Eonothem
    stat.hp_ += 46.6
    stat.enerRech_ += 23.3
    stat.atk_ += 4.7
    stat.atk += 31
    stat.def += 23
    // Circlet of Logos
    stat.critRate_ += 31.1
    stat.hp += 209
    stat.critDMG_ += 14
    stat.atk_ += 12.8
    stat.hp_ += 9.3
  }
}

describe(`Testing StatData`, () => {
  describe(`PreprocessFormulas()`, () => {
    test('should compute final stats', () => {
      const { statFixture, targets, equipArtifacts } = ZhongliSetupZyrenLe
      const stat = statFixture();
      equipArtifacts(stat);
      PreprocessFormulas(GetDependencies(stat.modifiers, targets), stat).formula(stat)

      _test(stat.finalHP, 14695 + 14945)
      _test(stat.finalATK, 274 + 518)
      _test(stat.finalDEF, 738 + 102)
      _test(stat.eleMas, 0)
      _test(stat.critRate_, 52.0)
      _test(stat.critDMG_, 106.7)
      _test(stat.enerRech_, 156.4)
      _test(stat.geo_dmg_, 28.8)
    })

    // No arti, no crit, no jade shield
    test('should compute zhongli without artifacts no resonance nocrit', () => {
      const { talents, statFixture, targets, equipArtifacts } = ZhongliSetupZyrenLe
      const stat = statFixture();
      stat.hitMode = "hit",
      PreprocessFormulas(GetDependencies(stat.modifiers, targets), stat).formula(stat)

      // Skills test
      const formula = characters.zhongli.formula;
      _test(formula.normal["0HP"](talents.auto, stat)[0](stat), 145, 0.00625)
      _test(formula.normal["1HP"](talents.auto, stat)[0](stat), 146)
      _test(formula.normal["2HP"](talents.auto, stat)[0](stat), 159)
      _test(formula.normal["3HP"](talents.auto, stat)[0](stat), 167)
      _test(formula.normal["4HP"](talents.auto, stat)[0](stat), 4*110)
      _test(formula.normal["5HP"](talents.auto, stat)[0](stat), 188)
      _test(formula.charged.dmgHP(talents.auto, stat)[0](stat), 288)
      // _test(formula.plunging.dmgHP(talents.auto, stat)[0](stat), NaN)
      // _test(formula.plunging.lowHP(talents.auto, stat)[0](stat), NaN)
      _test(formula.plunging.highHP(talents.auto, stat)[0](stat), 375)
      _test(formula.skill.steeleDMGHP(talents.skill, stat)[0](stat), 198)
      _test(formula.skill.resonanceDMGHP(talents.skill, stat)[0](stat), 236)
      _test(formula.skill.holdDMGHP(talents.skill, stat)[0](stat), 349)
      // _test(formula.skill.shield(talents.skill, stat)[0](stat), NaN)

      // C2 zhongli burst applies jade shield immediately, therefore -20 geo res
      stat.geo_enemyRes_ -= 20
      PreprocessFormulas(GetDependencies(stat.modifiers, targets), stat).formula(stat)
      _test(formula.burst.dmgHP(talents.burst, stat)[0](stat), 4670, 0.155) // Inaccurate, off by ~330
    })

    // No arti, crit, no jade shield
    test('should compute zhongli without artifacts no resonance crit', () => {
      const { talents, statFixture, targets, equipArtifacts } = ZhongliSetupZyrenLe
      const stat = statFixture();
      stat.hitMode = "critHit",
      PreprocessFormulas(GetDependencies(stat.modifiers, targets), stat).formula(stat)

      // Skills test
      const formula = characters.zhongli.formula;
      // _test(formula.normal["0HP"](talents.auto, stat)[0](stat), NaN)
      // _test(formula.normal["1HP"](talents.auto, stat)[0](stat), NaN)
      _test(formula.normal["2HP"](talents.auto, stat)[0](stat), 239)
      // _test(formula.normal["3HP"](talents.auto, stat)[0](stat), NaN)
      // _test(formula.normal["4HP"](talents.auto, stat)[0](stat), NaN)
      // _test(formula.normal["5HP"](talents.auto, stat)[0](stat), NaN)
      _test(formula.charged.dmgHP(talents.auto, stat)[0](stat), 433)
      // _test(formula.plunging.dmgHP(talents.auto, stat)[0](stat), NaN)
      // _test(formula.plunging.lowHP(talents.auto, stat)[0](stat), NaN)
      // _test(formula.plunging.highHP(talents.auto, stat)[0](stat), NaN)
      // _test(formula.skill.steeleDMGHP(talents.skill, stat)[0](stat), NaN)
      // _test(formula.skill.resonanceDMGHP(talents.skill, stat)[0](stat), NaN)
      // _test(formula.skill.holdDMGHP(talents.skill, stat)[0](stat), NaN)
      // _test(formula.skill.shield(talents.skill, stat)[0](stat), NaN)

      // _test(formula.burst.dmgHP(talents.burst, stat)[0](stat), NaN) // Inaccurate, off by ~330
    })

    // No arti, no crit, with jade shield
    test('should compute zhongli without artifacts with jade shield nocrit', () => {
      const { talents, statFixture, targets, equipArtifacts } = ZhongliSetupZyrenLe
      const stat = statFixture();
      stat.hitMode = "hit",
      // due to jade shield shred
      stat.geo_enemyRes_ -= 20
      stat.physical_enemyRes_ -= 20
      PreprocessFormulas(GetDependencies(stat.modifiers, targets), stat).formula(stat)

      // Skills test
      const formula = characters.zhongli.formula;
      _test(formula.normal["0HP"](talents.auto, stat)[0](stat), 170)
      _test(formula.normal["1HP"](talents.auto, stat)[0](stat), 171)
      _test(formula.normal["2HP"](talents.auto, stat)[0](stat), 186)
      _test(formula.normal["3HP"](talents.auto, stat)[0](stat), 195)
      _test(formula.normal["4HP"](talents.auto, stat)[0](stat), 4*128)
      _test(formula.normal["5HP"](talents.auto, stat)[0](stat), 219)
      _test(formula.charged.dmgHP(talents.auto, stat)[0](stat), 337)
      // _test(formula.plunging.dmgHP(talents.auto, stat)[0](stat), NaN)
      // _test(formula.plunging.lowHP(talents.auto, stat)[0](stat), NaN)
      _test(formula.plunging.highHP(talents.auto, stat)[0](stat), 438)
      _test(formula.skill.steeleDMGHP(talents.skill, stat)[0](stat), 231)
      _test(formula.skill.resonanceDMGHP(talents.skill, stat)[0](stat), 275)
      _test(formula.skill.holdDMGHP(talents.skill, stat)[0](stat), 408)
      // _test(formula.skill.shield(talents.skill, stat)[0](stat), NaN)

      _test(formula.burst.dmgHP(talents.burst, stat)[0](stat), 4670, 0.155) // Inaccurate, off by ~330
    })

    // No arti, crit, with jade shield
    test('should compute zhongli without artifacts no resonance crit', () => {
      const { talents, statFixture, targets, equipArtifacts } = ZhongliSetupZyrenLe
      const stat = statFixture();
      stat.hitMode = "critHit",
      // due to jade shield shred
      stat.geo_enemyRes_ -= 20
      stat.physical_enemyRes_ -= 20
      PreprocessFormulas(GetDependencies(stat.modifiers, targets), stat).formula(stat)

      // Skills test
      const formula = characters.zhongli.formula;
      // _test(formula.normal["0HP"](talents.auto, stat)[0](stat), NaN)
      // _test(formula.normal["1HP"](talents.auto, stat)[0](stat), NaN)
      _test(formula.normal["2HP"](talents.auto, stat)[0](stat), 279)
      _test(formula.normal["3HP"](talents.auto, stat)[0](stat), 293)
      // _test(formula.normal["4HP"](talents.auto, stat)[0](stat), NaN)
      // _test(formula.normal["5HP"](talents.auto, stat)[0](stat), NaN)
      _test(formula.charged.dmgHP(talents.auto, stat)[0](stat), 505)
      // _test(formula.plunging.dmgHP(talents.auto, stat)[0](stat), NaN)
      // _test(formula.plunging.lowHP(talents.auto, stat)[0](stat), NaN)
      // _test(formula.plunging.highHP(talents.auto, stat)[0](stat), NaN)
      // _test(formula.skill.steeleDMGHP(talents.skill, stat)[0](stat), NaN)
      // _test(formula.skill.resonanceDMGHP(talents.skill, stat)[0](stat), NaN)
      // _test(formula.skill.holdDMGHP(talents.skill, stat)[0](stat), NaN)
      // _test(formula.skill.shield(talents.skill, stat)[0](stat), NaN)

      // _test(formula.burst.dmgHP(talents.burst, stat)[0](stat), NaN) // Inaccurate, off by ~330
    })

    // Arti, no crit, no jade shield
    test('should compute zhongli with artifacts no resonance nocrit', () => {
      const { talents, statFixture, targets, equipArtifacts } = ZhongliSetupZyrenLe
      const stat = statFixture();
      equipArtifacts(stat)
      stat.hitMode = "hit",
      PreprocessFormulas(GetDependencies(stat.modifiers, targets), stat).formula(stat)

      // Skills test
      const formula = characters.zhongli.formula;
      _test(formula.normal["0HP"](talents.auto, stat)[0](stat), 342)
      _test(formula.normal["1HP"](talents.auto, stat)[0](stat), 344)
      _test(formula.normal["2HP"](talents.auto, stat)[0](stat), 382)
      _test(formula.normal["3HP"](talents.auto, stat)[0](stat), 404)
      _test(formula.normal["4HP"](talents.auto, stat)[0](stat), 4*239)
      _test(formula.normal["5HP"](talents.auto, stat)[0](stat), 464)
      _test(formula.charged.dmgHP(talents.auto, stat)[0](stat), 754)
      // _test(formula.plunging.dmgHP(talents.auto, stat)[0](stat), NaN)
      // _test(formula.plunging.lowHP(talents.auto, stat)[0](stat), NaN)
      _test(formula.plunging.highHP(talents.auto, stat)[0](stat), 1004)
      _test(formula.skill.steeleDMGHP(talents.skill, stat)[0](stat), 433)
      _test(formula.skill.resonanceDMGHP(talents.skill, stat)[0](stat), 542)
      _test(formula.skill.holdDMGHP(talents.skill, stat)[0](stat), 870)
      // _test(formula.skill.shield(talents.skill, stat)[0](stat), NaN)

      // C2 zhongli burst applies jade shield immediately, therefore -20 geo res
      stat.geo_enemyRes_ -= 20
      PreprocessFormulas(GetDependencies(stat.modifiers, targets), stat).formula(stat)
      _test(formula.burst.dmgHP(talents.burst, stat)[0](stat), 12635, 0.27) // Inaccurate, off by ~330
    })

    // Arti, crit, no jade shield
    test('should compute zhongli with artifacts no resonance crit', () => {
      const { talents, statFixture, targets, equipArtifacts } = ZhongliSetupZyrenLe
      const stat = statFixture();
      equipArtifacts(stat)
      stat.hitMode = "critHit",
      PreprocessFormulas(GetDependencies(stat.modifiers, targets), stat).formula(stat)

      // Skills test
      const formula = characters.zhongli.formula;
      _test(formula.normal["0HP"](talents.auto, stat)[0](stat), 707)
      _test(formula.normal["1HP"](talents.auto, stat)[0](stat), 711)
      _test(formula.normal["2HP"](talents.auto, stat)[0](stat), 790)
      _test(formula.normal["3HP"](talents.auto, stat)[0](stat), 836)
      _test(formula.normal["4HP"](talents.auto, stat)[0](stat), 4*494)
      _test(formula.normal["5HP"](talents.auto, stat)[0](stat), 959)
      _test(formula.charged.dmgHP(talents.auto, stat)[0](stat), 1560)
      // _test(formula.plunging.dmgHP(talents.auto, stat)[0](stat), NaN)
      // _test(formula.plunging.lowHP(talents.auto, stat)[0](stat), NaN)
      _test(formula.plunging.highHP(talents.auto, stat)[0](stat), 2077)
      _test(formula.skill.steeleDMGHP(talents.skill, stat)[0](stat), 895)
      _test(formula.skill.resonanceDMGHP(talents.skill, stat)[0](stat), 1121)
      _test(formula.skill.holdDMGHP(talents.skill, stat)[0](stat), 1799)
      // _test(formula.skill.shield(talents.skill, stat)[0](stat), NaN)

      // C2 zhongli burst applies jade shield immediately, therefore -20 geo res
      stat.geo_enemyRes_ -= 20
      PreprocessFormulas(GetDependencies(stat.modifiers, targets), stat).formula(stat)
      _test(formula.burst.dmgHP(talents.burst, stat)[0](stat), 26118, 0.27) // Inaccurate, off by ~330
    })
  })
})


