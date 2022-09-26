import { CharacterData } from 'pipeline'
import ColorText from '../../../Components/ColoredText'
import { input } from '../../../Formula'
import { constant, equal, equalStr, greaterEq, greaterEqStr, infoMut, lookup, percent, prod } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { objectKeyMap, range } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Keqing"
const elementKey: ElementKey = "electro"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4.1
      skillParam_gen.auto[a++], // 4.2
      skillParam_gen.auto[a++], // 5
    ]
  },
  charged: {
    dmg1: skillParam_gen.auto[a++], // 1
    dmg2: skillParam_gen.auto[a++], // 2
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    stiletto: skillParam_gen.skill[s++],
    slash: skillParam_gen.skill[s++],
    thunderclap: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    initial: skillParam_gen.burst[b++],
    slash: skillParam_gen.burst[b++],
    final: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[0][0],
  },
  passive2: {
    critInc_: skillParam_gen.passive2[p2++][0],
    enerRechInc_: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0]
  },
  constellation1: {
    dmg: skillParam_gen.constellation1[0],
  },
  constellation4: {
    duration: skillParam_gen.constellation4[0],
    atkInc: skillParam_gen.constellation4[1],
  },
  constellation6: {
    electroInc: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
  }
} as const

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg1: dmgNode("atk", datamine.charged.dmg1, "charged"),
    dmg2: dmgNode("atk", datamine.charged.dmg2, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    stiletto: dmgNode("atk", datamine.skill.stiletto, "skill"),
    slash: dmgNode("atk", datamine.skill.slash, "skill"),
    thunderclap: dmgNode("atk", datamine.skill.thunderclap, "skill"),
  },
  burst: {
    initial: dmgNode("atk", datamine.burst.initial, "burst"),
    slash: dmgNode("atk", datamine.burst.slash, "burst"),
    final: dmgNode("atk", datamine.burst.final, "burst"),
  },
  constellation1: {
    dmg: greaterEq(input.constellation, 1, customDmgNode(prod(input.total.atk, datamine.constellation1.dmg), "elemental", { hit: { ele: constant(elementKey) } }))
  }
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

const [condAfterRecastPath, condAfterRecast] = cond(key, "afterRecast")
const afterRecastInfusion = equalStr("afterRecast", condAfterRecast,
  greaterEqStr(input.asc, 1, elementKey)
)

const [condAfterBurstPath, condAfterBurst] = cond(key, "afterBurst")
const afterBurstCritRate_ = greaterEq(input.asc, 4, equal("afterBurst", condAfterBurst, percent(datamine.passive2.critInc_)))
const afterBurstEnerRech_ = { ...afterBurstCritRate_ }

const [condAfterReactPath, condAfterReact] = cond(key, "afterReact")
const afterReactAtk_ = greaterEq(input.constellation, 4, equal("afterReact", condAfterReact, percent(datamine.constellation4.atkInc)))

const [condC6StackPath, condC6Stack] = cond(key, "c6Stack")
const c6Electro_dmg_ = greaterEq(input.constellation, 6,
  prod(
    lookup(condC6Stack, objectKeyMap(range(1, 4), i => constant(i)), constant(0)),
    datamine.constellation6.electroInc
  )
)

export const data = dataObjForCharacterSheet(key, elementKey, "liyue", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  infusion: {
    overridableSelf: afterRecastInfusion,
  },
  premod: {
    critRate_: afterBurstCritRate_,
    enerRech_: afterBurstEnerRech_,
    atk_: afterReactAtk_,
    electro_dmg_: c6Electro_dmg_,
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
        node: infoMut(dmgFormulas.normal[i],
          { key: `char_${key}_gen:auto.skillParams.${i + (i < 4 ? 0 : -1)}` }
        ),
        textSuffix: i === 3 ? "(1)" : i === 4 ? "(2)" : ""
      }))
    }, {
      text: tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg1, { key: `char_${key}_gen:auto.skillParams.5` }),
        textSuffix: "(1)"
      }, {
        node: infoMut(dmgFormulas.charged.dmg2, { key: `char_${key}_gen:auto.skillParams.5` }),
        textSuffix: "(2)"
      }, {
        text: tr("auto.skillParams.6"),
        value: datamine.charged.stamina,
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
        node: infoMut(dmgFormulas.skill.stiletto, { key: `char_${key}_gen:skill.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.skill.slash, { key: `char_${key}_gen:skill.skillParams.1` }),
      }, {
        node: infoMut(dmgFormulas.skill.thunderclap, { key: `char_${key}_gen:skill.skillParams.2` }),
      }, {
        text: sgt("cd"),
        value: datamine.skill.cd,
        unit: "s",
        fixed: 1
      }]
    }, ct.conditionalTemplate("passive1", {
      value: condAfterRecast,
      path: condAfterRecastPath,
      name: trm("recast"),
      states: {
        afterRecast: {
          fields: [{
            canShow: data => data.get(afterRecastInfusion).value === elementKey,
            text: <ColorText color="electro">{st("infusion.electro")}</ColorText>
          }, {
            text: sgt("duration"),
            value: datamine.passive1.duration,
            unit: "s"
          }]
        }
      }
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.initial, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.burst.slash, { key: `char_${key}_gen:burst.skillParams.1` }),
        textSuffix: st("brHits", { count: 8 })
      }, {
        node: infoMut(dmgFormulas.burst.final, { key: `char_${key}_gen:burst.skillParams.2` })
      }, {
        text: sgt("cd"),
        value: datamine.burst.cd,
        unit: "s",
      }, {
        text: sgt("energyCost"),
        value: datamine.burst.cost,
      }]
    }, ct.conditionalTemplate("passive2", {
      value: condAfterBurst,
      path: condAfterBurstPath,
      name: st("afterUse.burst"),
      states: {
        afterBurst: {
          fields: [{
            node: afterBurstCritRate_
          }, {
            node: afterBurstEnerRech_
          }]
        }
      }
    })]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2"),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1", [ct.fieldsTemplate("constellation1", {
      fields: [{
        node: infoMut(dmgFormulas.constellation1.dmg, { key: `char_${key}:c1DMG` })
      }]
    })]),
    constellation2: ct.talentTemplate("constellation2"),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTemplate("constellation4", [ct.conditionalTemplate("constellation4", {
      value: condAfterReact,
      path: condAfterReactPath,
      name: st("elementalReaction.electro"),
      states: {
        afterReact: {
          fields: [{
            node: afterReactAtk_
          }]
        }
      }
    })]),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTemplate("constellation6", [ct.conditionalTemplate("constellation6", {
      value: condC6Stack,
      path: condC6StackPath,
      name: trm("effectTriggers"),
      states: objectKeyMap(range(1, 4), i => ({
        name: st("stack", { count: i }),
        fields: [{
          node: c6Electro_dmg_
        }]
      }))
    })]),
  }
}

export default new CharacterSheet(sheet, data, assets)
