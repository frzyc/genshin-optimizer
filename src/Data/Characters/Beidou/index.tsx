import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, percent, prod, subscript } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, sgt, st } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode, shieldElement, shieldNode, shieldNodeTalent } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterKey = "Beidou"
const elementKey: ElementKey = "electro"
const data_gen = data_gen_src as CharacterData
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ]
  },
  charged: {
    spinningDmg: skillParam_gen.auto[a++],
    finalDmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    shieldHp_: skillParam_gen.skill[s++],
    shieldFlat: skillParam_gen.skill[s++],
    dmgBase: skillParam_gen.skill[s++],
    onHitDmgBonus: skillParam_gen.skill[s++], //DMG bonus on hit taken
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    burstDmg: skillParam_gen.burst[b++],
    lightningDmg: skillParam_gen.burst[b++],
    damageReduction: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    energyCost: skillParam_gen.burst[b++][0],
  },
  //pasive 1: 2, //additional targets for lightning arc
  ascension4: {
    normalDmg_: skillParam_gen.passive2[0][0], //Same value for all 3
    chargeDmg_: skillParam_gen.passive2[0][0],
    attackSpeed: skillParam_gen.passive2[0][0],
  },
  constellation1: {
    shieldHp_: skillParam_gen.constellation1[0],
  },
  constellation4: {
    skillDmg: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    electroResShred_: -1 * skillParam_gen.constellation6[0],
  },
} as const

//Toggable stuff:
// A4: Unleashing <b>Tidecaller</b> with its maximum DMG Bonus
// C6: During the duration of <b>Stormbreaker</b>

const [condC6Path, condC6] = cond(key, "Constellation6")
const [condA4Path, condA4] = cond(key, "Ascension4")

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

const skillDmgOneHit = datamine.skill.dmgBase.map((dmg, i) => dmg + datamine.skill.onHitDmgBonus[i])
const skillDmgTwoHits = datamine.skill.dmgBase.map((dmg, i) => dmg + 2 * datamine.skill.onHitDmgBonus[i])

const nodeBurstElectroResRed_ = equal(condC6, "on", percent(datamine.constellation6.electroResShred_), { name: ct.tr("baneOfEvil_") })
const nodeSkillNormalDmg_ = equal(condA4, "on", percent(datamine.ascension4.normalDmg_), { name: ct.tr("a4normalDmg_") })
const nodeSkillChargeDmg_ = equal(condA4, "on", percent(datamine.ascension4.chargeDmg_), { name: ct.tr("a4chargeDmg_") })
const nodeSkillAttackSpeed_ = equal(condA4, "on", percent(datamine.ascension4.attackSpeed), { name: ct.tr("a4atkSpeed_") })

const skillShieldNode = shieldNodeTalent("hp", datamine.skill.shieldHp_, datamine.skill.shieldFlat, "skill")
const c1ShieldNode = shieldNode("hp", percent(datamine.constellation1.shieldHp_), 0)

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    spinningDmg: dmgNode("atk", datamine.charged.spinningDmg, "charged"),
    finalDmg: dmgNode("atk", datamine.charged.finalDmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    shield: skillShieldNode,
    electroShield: shieldElement("electro", skillShieldNode),
    baseDmg: dmgNode("atk", datamine.skill.dmgBase, "skill"),
    dmgOneHit: dmgNode("atk", skillDmgOneHit, "skill"),
    dmgTwoHits: dmgNode("atk", skillDmgTwoHits, "skill"),
  },
  burst: {
    burstDmg: dmgNode("atk", datamine.burst.burstDmg, "burst"),
    lightningDmg: dmgNode("atk", datamine.burst.lightningDmg, "burst"),
  },
  constellation1: {
    shield: greaterEq(input.constellation, 1, c1ShieldNode),
    electroShield: greaterEq(input.constellation, 1, shieldElement("electro", c1ShieldNode)),
  },
  constellation4: {
    skillDmg: greaterEq(input.constellation, 4, customDmgNode(prod(input.total.atk, percent(datamine.constellation4.skillDmg)), "elemental", { hit: { ele: constant(elementKey) } }))
  }
}

export const data = dataObjForCharacterSheet(key, elementKey, "liyue", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC3,
    burst: nodeC5,
  }, customBonus: {
    normal_dmg_: nodeSkillNormalDmg_,
    charged_dmg_: nodeSkillChargeDmg_,
    atkSPD_: nodeSkillAttackSpeed_,
  }, teamBuff: {
    premod: {
      electro_enemyRes_: nodeBurstElectroResRed_
    }
  }
})

const sheet: ICharacterSheet = {
  key,
  name: ct.tr("name"),
  rarity: data_gen.star,
  elementKey: elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: ct.tr("constellationName"),
  title: ct.tr("title"),
  talent: {
    auto: ct.talentTemplate("auto", [{
      text: ct.tr("auto.fields.normal"),
    }, {
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { name: ct.tr(`auto.skillParams.${i}`) }),
      }))
    }, {
      text: ct.tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.spinningDmg, { name: ct.tr(`auto.skillParams.5`) }),
      }, {
        node: infoMut(dmgFormulas.charged.finalDmg, { name: ct.tr(`auto.skillParams.6`) }),
      }, {
        text: ct.tr("auto.skillParams.7"),
        value: datamine.charged.stamina,
        unit: '/s'
      }, {
        text: ct.tr("auto.skillParams.8"),
        value: datamine.charged.duration,
        unit: 's'
      }]
    }, {
      text: ct.tr(`auto.fields.plunging`),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.plunging.dmg, { name: sgt("plunging.dmg") }),
      }, {
        node: infoMut(dmgFormulas.plunging.low, { name: sgt("plunging.low") }),
      }, {
        node: infoMut(dmgFormulas.plunging.high, { name: sgt("plunging.high") }),
      }]
    }]),

    skill: ct.talentTemplate("skill", [{
      fields: [{
        node: infoMut(dmgFormulas.skill.shield, { name: st(`dmgAbsorption.none`) }),
      }, {
        node: infoMut(dmgFormulas.skill.electroShield, { name: st(`dmgAbsorption.electro`) }),
      }, {
        node: infoMut(dmgFormulas.skill.baseDmg, { name: ct.tr(`skill.skillParams.1`) }),
      }, {
        node: infoMut(dmgFormulas.skill.dmgOneHit, { name: ct.tr("skillOneHit") }),
      }, {
        node: infoMut(dmgFormulas.skill.dmgTwoHits, { name: ct.tr("skillTwoHit") }),
      }, {
        text: ct.tr("skill.skillParams.3"),
        value: datamine.skill.cd,
        unit: "s"
      }]
    }, ct.conditionalTemplate("passive2", {
      teamBuff: false,
      value: condA4,
      path: condA4Path,
      name: ct.trm("tidecallerMaxDmg"),
      states: {
        on: {
          fields: [{
            node: nodeSkillNormalDmg_,
          }, {
            node: nodeSkillChargeDmg_,
          }, {
            node: nodeSkillAttackSpeed_,
          }, {
            text: ct.trm("a4duration"),
            value: 10,
            unit: "s"
          }, {
            text: ct.trm("a4charge"),
          }]
        }
      }
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.burstDmg, { name: ct.tr(`burst.skillParams.0`) }),
      }, {
        node: infoMut(dmgFormulas.burst.lightningDmg, { name: ct.tr(`burst.skillParams.1`) }),
      }, {
        node: infoMut(subscript(input.total.burstIndex, datamine.burst.damageReduction), { name: ct.tr("burstDmgRed_") })
      }, {
        text: ct.tr("burst.skillParams.3"),
        value: datamine.burst.duration,
        unit: "s"
      }, {
        text: ct.tr("burst.skillParams.4"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: ct.tr("burst.skillParams.5"),
        value: datamine.burst.energyCost,
      }]
    }, ct.conditionalTemplate("constellation6", {
      teamBuff: true,
      value: condC6,
      path: condC6Path,
      name: ct.trm("duringBurst"),
      states: {
        on: {
          fields: [{
            node: nodeBurstElectroResRed_,
          }]
        }
      }
    })]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2"),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1", [ct.fieldsTemplate("constellation1", {
      fields: [{
        node: infoMut(dmgFormulas.constellation1.shield, { name: st(`dmgAbsorption.none`) })
      }, {
        node: infoMut(dmgFormulas.constellation1.electroShield, { name: st(`dmgAbsorption.electro`) })
      }]
    })]),
    constellation2: ct.talentTemplate("constellation2"),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTemplate("constellation4", [ct.fieldsTemplate("constellation4", {
      fields: [{
        node: infoMut(dmgFormulas.constellation4.skillDmg, { name: ct.tr("c4dmg") }),
      }]
    })]),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTemplate("constellation6"),
  }
}

export default new CharacterSheet(sheet, data, assets);
