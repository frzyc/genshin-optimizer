import { CharacterData } from 'pipeline'
import ColorText from '../../../Components/ColoredText'
import { input, target } from '../../../Formula'
import { constant, equal, equalStr, greaterEq, greaterEqStr, infoMut, min, percent, prod, subscript } from '../../../Formula/utils'
import { CharacterKey, ElementKey, Region } from '../../../Types/consts'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, customHealNode, dataObjForCharacterSheet, dmgNode, healNodeTalent } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Dori"
const elementKey: ElementKey = "electro"
const regionKey: Region = "sumeru"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2.1
      skillParam_gen.auto[a++], // 2.2
      skillParam_gen.auto[a++], // 3
    ]
  },
  charged: {
    spinningDmg: skillParam_gen.auto[a++],
    finalDmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0]
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++]
  },
  skill: {
    shotDmg: skillParam_gen.skill[s++],
    roundDmg: skillParam_gen.skill[s++],
    numRounds: 2,
    cd: skillParam_gen.skill[s++][0]
  },
  burst: {
    connectorDmg: skillParam_gen.burst[b++],
    healMult: skillParam_gen.burst[b++],
    healBase: skillParam_gen.burst[b++],
    energyRegen: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0]
  },
  passive1: {
    cdRed: skillParam_gen.passive1[0][0],
    cd: skillParam_gen.passive1[1][0],
  },
  passive2: {
    energyRegen: skillParam_gen.passive2[0][0],
    maxEnergyRegen: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    addlRounds: 1
  },
  constellation2: {
    toopDmg: skillParam_gen.constellation2[0],
  },
  constellation4: {
    hpThresh: 50,
    energyThresh: 50,
    incHeal_: skillParam_gen.constellation4[0],
    enerRech_: skillParam_gen.constellation4[1],
  },
  constellation6: {
    infusionDuration: skillParam_gen.constellation6[0],
    heal_: skillParam_gen.constellation6[1],
    cd: 0.1
  }
} as const

const [condC4BelowHpPath, condC4BelowHp] = cond(key, "c4BelowHp")
const [condC4BelowEnerPath, condC4BelowEner] = cond(key, "c4BelowEner")
const c4BelowHp_incHeal_disp = greaterEq(input.constellation, 4,
  equal(condC4BelowHp, "belowHp", datamine.constellation4.incHeal_)
)
const c4BelowHp_incHeal_ = equal(input.activeCharKey, target.charKey, c4BelowHp_incHeal_disp)
const c4BelowEner_enerRech_disp = greaterEq(input.constellation, 4,
  equal(condC4BelowEner, "belowEner", datamine.constellation4.enerRech_)
)
const c4BelowEner_enerRech_ = equal(input.activeCharKey, target.charKey, c4BelowEner_enerRech_disp)

const [condC6AfterSkillPath, condC6AfterSkill] = cond(key, "c6AfterSkill")
const c6AfterSkill_infusion = greaterEqStr(input.constellation, 6, equalStr(condC6AfterSkill, "on", elementKey))

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
    shotDmg: dmgNode("atk", datamine.skill.shotDmg, "skill"),
    roundDmg: dmgNode("atk", datamine.skill.roundDmg, "skill"),
  },
  burst: {
    connectorDmg: dmgNode("atk", datamine.burst.connectorDmg, "burst"),
    heal: healNodeTalent("hp", datamine.burst.healMult, datamine.burst.healBase, "burst")
  },
  passive2: {
    energyRegen: greaterEq(input.asc, 4, min(prod(constant(datamine.passive2.energyRegen), input.total.enerRech_), constant(datamine.passive2.maxEnergyRegen)))
  },
  constellation2: {
    dmg: greaterEq(input.constellation, 2, customDmgNode(
      prod(
        subscript(input.total.skillIndex, datamine.skill.shotDmg, { key: "_" }),
        percent(datamine.constellation2.toopDmg, { key: `char_${key}:c2MultiplierKey_` }),
        input.total.atk
      ),
      "elemental",
      { hit: { ele: constant(elementKey) } }
    ))
  },
  constellation6: {
    heal: greaterEq(input.constellation, 6, equal(condC6AfterSkill, "on",
      customHealNode(prod(
        percent(datamine.constellation6.heal_),
        input.total.hp
      ))
    ))
  }
}

const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, regionKey, data_gen, dmgFormulas, {
  bonus: {
    skill: skillC5,
    burst: burstC3,
  },
  infusion: {
    overridableSelf: c6AfterSkill_infusion // This might end up being non-overridable, though I doubt it
  },
  teamBuff: {
    premod: {
      incHeal_: c4BelowHp_incHeal_,
      enerRech_: c4BelowEner_enerRech_,
    }
  }
})

const sheet: ICharacterSheet = {
  key,
  name: tr("name"),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    auto: ct.talentTemplate("auto", [{
      text: tr("auto.fields.normal"),
    }, {
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i > 1 ? i - 1 : i}` }),
        textSuffix: i >= 1 && i < 3 ? `(${i})` : undefined
      }))
    }, {
      text: tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.spinningDmg, { key: `char_${key}_gen:auto.skillParams.3` }),
      }, {
        node: infoMut(dmgFormulas.charged.finalDmg, { key: `char_${key}_gen:auto.skillParams.4` }),
      }, {
        text: tr("auto.skillParams.5"),
        value: datamine.charged.stamina,
        unit: '/s'
      }, {
        text: tr("auto.skillParams.6"),
        value: datamine.charged.duration,
        unit: 's'
      }]
    }, {
      text: tr("auto.fields.plunging"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
      }, {
        node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
      }, {
        node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
      }]
    }]),

    skill: ct.talentTemplate("skill", [{
      fields: [{
        node: infoMut(dmgFormulas.skill.shotDmg, { key: `char_${key}_gen:skill.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.skill.roundDmg, { key: `char_${key}_gen:skill.skillParams.1` }),
      }, {
        text: sgt("cd"),
        value: datamine.skill.cd,
        unit: 's'
      }]
    }, ct.headerTemplate("passive2", {
      fields: [{
        node: infoMut(dmgFormulas.passive2.energyRegen, { key: "sheet:energyRegen" }),
      }]
    }), ct.conditionalTemplate("constellation6", {
      path: condC6AfterSkillPath,
      value: condC6AfterSkill,
      name: st("afterUse.skill"),
      states: {
        on: {
          fields: [{
            text: <ColorText color={elementKey}>{st(`infusion.${elementKey}`)}</ColorText>
          }, {
            text: sgt("duration"),
            value: datamine.constellation6.infusionDuration,
            unit: "s"
          }, {
            node: infoMut(dmgFormulas.constellation6.heal, { key: `char_${key}:c6Heal`, variant: "heal" })
          }, {
            text: sgt("cd"),
            value: datamine.constellation6.cd,
            unit: "s",
            fixed: 1
          }]
        }
      }
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.connectorDmg, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.burst.heal, { key: `char_${key}_gen:burst.skillParams.1`, variant: "heal" }),
      }, {
        text: st("energyRegen"),
        value: (data) => data.get(subscript(input.total.burstIndex, datamine.burst.energyRegen)).value,
        fixed: 1
      }, {
        text: sgt("duration"),
        value: datamine.burst.duration,
        unit: 's'
      }, {
        text: sgt("cd"),
        value: datamine.burst.cd,
        unit: 's'
      }, {
        text: sgt("energyCost"),
        value: datamine.burst.enerCost,
      }]
    }, ct.headerTemplate("constellation2", {
      fields: [{
        node: infoMut(dmgFormulas.constellation2.dmg, { key: `char_${key}:c2DmgKey` })
      }]
    }), ct.conditionalTemplate("constellation4", {
      teamBuff: true,
      states: {
        belowHp: {
          path: condC4BelowHpPath,
          value: condC4BelowHp,
          name: trm("c4ConnectedBelowHp"),
          fields: [{
            node: infoMut(c4BelowHp_incHeal_disp, { key: "incHeal_" }),
          }]
        },
        belowEner: {
          path: condC4BelowEnerPath,
          value: condC4BelowEner,
          name: trm("c4ConnectedBelowEner"),
          fields: [{
            node: infoMut(c4BelowEner_enerRech_disp, { key: "enerRech_" }),
          }]
        }
      }
    })]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2"),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2"),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: burstC3 }] }]),
    constellation4: ct.talentTemplate("constellation4"),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: skillC5 }] }]),
    constellation6: ct.talentTemplate("constellation6"),
  },
}

export default new CharacterSheet(sheet, data, assets);
