import { CharacterData } from '@genshin-optimizer/pipeline'
import { input } from '../../../Formula'
import { equal, greaterEq, infoMut, lookup, naught, percent, prod } from '../../../Formula/utils'
import { allElementWithPhyKeys, CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { objectKeyMap, objectKeyValueMap, range } from '../../../Util/Util'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import { ICharacterSheet } from '../ICharacterSheet.d'
import { customHealNode, dataObjForCharacterSheet, dmgNode, shieldElement, shieldNodeTalent } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'
const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Zhongli"
const elementKey: ElementKey = "geo"
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ]
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    stele: skillParam_gen.skill[s++],
    resonance: skillParam_gen.skill[s++],
    pressCD: skillParam_gen.skill[s++][0],
    holdDMG: skillParam_gen.skill[s++],
    shield: skillParam_gen.skill[s++],
    shield_: skillParam_gen.skill[s++],
    shileDuration: skillParam_gen.skill[s++][0],
    holdCD: skillParam_gen.skill[s++][0],
    enemyRes_: -0.2,
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    shield_: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    auto_: skillParam_gen.passive2[p2++][0],
    skill_: skillParam_gen.passive2[p2++][0],
    burst_: skillParam_gen.passive2[p2++][0],
  },
  constellation4: {
    durationInc: skillParam_gen.constellation4[1]
  },
  constellation6: {
    hp_: skillParam_gen.constellation6[1]
  }
} as const
const [condSkillPath, condSkill] = cond(key, "skill")
const nodesSkill = objectKeyValueMap(allElementWithPhyKeys, k => [`${k}_enemyRes_`,
equal("on", condSkill, percent(dm.skill.enemyRes_))])

const [condP1Path, condP1] = cond(key, "p1")
const nodeP1 = greaterEq(
  input.asc, 1,
  lookup(condP1, objectKeyMap(range(1, 5), i => percent(dm.passive1.shield_ * i)), naught)
)

const p4AutoDmgInc = greaterEq(input.asc, 4, prod(percent(dm.passive2.auto_), input.premod.hp))
const p4normalDmgInc = { ...p4AutoDmgInc }
const p4ChargedDmgInc = { ...p4AutoDmgInc }
const p4PlungingDmgInc = { ...p4AutoDmgInc }
const p4SKillDmgInc = greaterEq(input.asc, 4, prod(percent(dm.passive2.skill_), input.premod.hp))
const p4BurstDmgInc = greaterEq(input.asc, 4, prod(percent(dm.passive2.burst_), input.premod.hp))

const nodeC6 = greaterEq(input.constellation, 6,
  customHealNode(prod(
    percent(dm.constellation6.hp_),
    input.total.hp
  )))

const dmgFormulas = {
  normal: Object.fromEntries(dm.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", dm.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(dm.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    stele: dmgNode("atk", dm.skill.stele, "skill"),
    resonance: dmgNode("atk", dm.skill.resonance, "skill"),
    holdDMG: dmgNode("atk", dm.skill.holdDMG, "skill"),
    shield: shieldElement("geo", shieldNodeTalent("hp", dm.skill.shield_, dm.skill.shield, "skill"))
  },
  burst: {
    dmg: dmgNode("atk", dm.burst.dmg, "burst"),
  },
  passive2: {
    p4normalDmgInc,
    p4ChargedDmgInc,
    p4PlungingDmgInc,
    p4SKillDmgInc,
    p4BurstDmgInc,
  },
  constellation6: {
    heal: nodeC6
  }
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, "liyue", data_gen, dmgFormulas, {
  premod: {
    skillBoost: nodeC3,
    burstBoost: nodeC5,
    // TODO: below should be for `total`
    normal_dmgInc: p4normalDmgInc,
    charged_dmgInc: p4ChargedDmgInc,
    plunging_dmgInc: p4PlungingDmgInc,
    skill_dmgInc: p4SKillDmgInc,
    burst_dmgInc: p4BurstDmgInc,
  },
  teamBuff: {
    premod: {
      shield_: nodeP1,
      ...nodesSkill,
    }
  }
})

const sheet: ICharacterSheet = {
  key,
  name: ct.chg("name"),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "M",
  constellationName: ct.chg("constellationName"),
  title: ct.chg("title"),
  talent: {
    auto: ct.talentTem("auto", [{
      text: ct.chg("auto.fields.normal"),
    }, {
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], {
          name: ct.chg(`auto.skillParams.${i}`),
          multi: i === 4 ? 4 : undefined
        }),
      }))
    }, {
      text: ct.chg("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg, { name: ct.chg(`auto.skillParams.6`) }),
      }, {
        text: ct.chg("auto.skillParams.7"),
        value: dm.charged.stamina,
      }]
    }, {
      text: ct.chg(`auto.fields.plunging`),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.plunging.dmg, { name: stg("plunging.dmg") }),
      }, {
        node: infoMut(dmgFormulas.plunging.low, { name: stg("plunging.low") }),
      }, {
        node: infoMut(dmgFormulas.plunging.high, { name: stg("plunging.high") }),
      }]
    }]),

    skill: ct.talentTem("skill", [{
      fields: [{
        node: infoMut(dmgFormulas.skill.stele, { name: ct.ch("skill.stele") })
      }, {
        node: infoMut(dmgFormulas.skill.resonance, { name: ct.ch("skill.resonance") })
      }, {
        text: ct.ch("skill.maxStele"),
        value: data => data.get(input.constellation).value >= 1 ? 2 : 1
      }, {
        text: st("pressCD"),
        value: dm.skill.pressCD,
        unit: "s"
      }, {
        node: infoMut(dmgFormulas.skill.holdDMG, { name: ct.chg(`skill.skillParams.2`) })
      }, {
        text: st("holdCD"),
        value: dm.skill.holdCD,
        unit: "s"
      }, {
        node: infoMut(dmgFormulas.skill.shield, { name: stg(`dmgAbsorption`) })
      }, {
        text: ct.chg("skill.skillParams.5"),
        value: dm.skill.shileDuration,
        unit: "s"
      }]
    }, ct.condTem("skill", {
      value: condSkill,
      path: condSkillPath,
      teamBuff: true,
      name: ct.ch("skill.nearShield"),
      states: {
        on: {
          fields: Object.values(nodesSkill).map(node => ({ node }))
        }
      }
    })]),

    burst: ct.talentTem("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.dmg, { name: ct.chg(`burst.skillParams.0`) })
      }, {
        text: ct.chg("burst.skillParams.1"),
        value: data =>
          data.get(input.constellation).value < 4 ?
            dm.burst.duration[data.get(input.total.burstIndex).value] :
            `${dm.burst.duration[data.get(input.total.burstIndex).value]}s +${dm.constellation4.durationInc}`,
        fixed: 1,
        unit: "s"
      }, {
        text: ct.chg("burst.skillParams.2"),
        value: dm.burst.cd,
        unit: "s"
      }, {
        text: ct.chg("burst.skillParams.3"),
        value: dm.burst.enerCost,
      }]
    }]),

    passive1: ct.talentTem("passive1", [ct.condTem("passive1", {
      value: condP1,
      path: condP1Path,
      teamBuff: true,
      name: ct.ch("p1cond"),
      states: objectKeyMap(range(1, 5), i => ({ name: st("stack", { count: i }), fields: [{ node: nodeP1 }] }))
    })]),
    passive2: ct.talentTem("passive2", [ct.fieldsTem("passive2", {
      fields: [{
        node: p4normalDmgInc
      }, {
        node: p4ChargedDmgInc
      }, {
        node: p4PlungingDmgInc
      }, {
        node: p4SKillDmgInc
      }, {
        node: p4BurstDmgInc
      }]
    })]),
    passive3: ct.talentTem("passive3"),
    constellation1: ct.talentTem("constellation1"),
    constellation2: ct.talentTem("constellation2"),
    constellation3: ct.talentTem("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTem("constellation4"),
    constellation5: ct.talentTem("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTem("constellation6", [ct.fieldsTem("constellation6", {
      fields: [{
        node: infoMut(dmgFormulas.constellation6.heal, { name: ct.ch("c6heal") })
      }]
    })]),
  },
}
export default new CharacterSheet(sheet, data)
