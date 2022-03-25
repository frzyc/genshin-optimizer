import { CharacterData } from 'pipeline'
import { Translate } from '../../../../Components/Translate'
import { TalentSheet } from '../../../../Types/character_WR'
import { absorbableEle, CharacterKey, ElementKey } from '../../../../Types/consts'
import { customDmgNode, customHealNode, dataObjForCharacterSheet, dmgNode } from '../../dataUtil'
import { burst, c1, c2, c3, c4, c5, c6, passive1, passive2, skill } from './assets'
import data_gen_src from '../data_gen.json'
import skillParam_gen from './skillParam_gen.json'
import { constant, equal, greaterEq, infoMut, percent, prod, unequal } from '../../../../Formula/utils'
import { input, target } from '../../../../Formula'
import { normalSrc, sectionTemplate, talentTemplate } from '../../CharacterSheet'
import { cond, sgt, st } from '../../../SheetUtil'
import ColorText from '../../../../Components/ColoredText'
import { objectKeyValueMap } from '../../../../Util/Util'

const data_gen = data_gen_src as CharacterData
const auto = normalSrc(data_gen.weaponTypeKey)

const key: CharacterKey = "Traveler"
const elementKey: ElementKey = "anemo"

const tr = (strKey: string) => <Translate ns="char_Traveler_gen" key18={`${elementKey}.${strKey}`} />
const trm = (strKey: string) => <Translate ns="char_Traveler" key18={`${elementKey}.${strKey}`} />

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
    hit1: skillParam_gen.auto[a++],
    hit2: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    initial_dmg: skillParam_gen.skill[s++],
    initial_max: skillParam_gen.skill[s++],
    storm_dmg: skillParam_gen.skill[s++],
    storm_max: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    maxCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    absorbDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmg: 0.6,
  },
  passive2: {
    heal_: 0.02,
  },
  constellation2: {
    enerRech_: 0.16,
  },
  constellation6: {
    enemyRes_: -0.2
  }
} as const

const [condBurstAbsorptionPath, condBurstAbsorption] = cond(key, `${elementKey}BurstAbsorption`)
const nodeC2 = greaterEq(input.constellation, 2, datamine.constellation2.enerRech_)
const [condC6Path, condC6] = cond(key, `${elementKey}C6Hit`)
const nodeC6 = equal(condC6, "on", datamine.constellation6.enemyRes_)
const nodesC6 = objectKeyValueMap(absorbableEle, ele => [`${ele}_enemyRes_`, equal(condC6, "on", equal(condBurstAbsorption, ele, datamine.constellation6.enemyRes_))])
const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg1: dmgNode("atk", datamine.charged.hit1, "charged"),
    dmg2: dmgNode("atk", datamine.charged.hit2, "charged")
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    initial_dmg: dmgNode("atk", datamine.skill.initial_dmg, "skill"),
    initial_max: dmgNode("atk", datamine.skill.initial_max, "skill"),
    storm_dmg: dmgNode("atk", datamine.skill.storm_dmg, "skill"),
    storm_max: dmgNode("atk", datamine.skill.storm_max, "skill"),
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
    absorb: dmgNode("atk", datamine.burst.absorbDmg, "burst", { hit: { ele: condBurstAbsorption } }),
  },
  passive1: {
    dmg: greaterEq(input.asc, 1, customDmgNode(prod(input.total.atk, datamine.passive1.dmg), "elemental", { hit: { ele: constant(elementKey) } })),
  },
  passive2: {
    heal: customHealNode(prod(percent(datamine.passive2.heal_), input.total.hp)),
  }
} as const

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, undefined, data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  premod: {
    enerRech_: nodeC2,
    ...nodesC6,
    anemo_enemyRes_: nodeC6,
  }
})

const talentSheet: TalentSheet = {
  sheets: {
    auto: talentTemplate("auto", tr, auto, undefined, undefined, [{
      ...sectionTemplate("auto", tr, auto,
        datamine.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:${elementKey}.auto.skillParams.${i}` }),
        }))
      ),
      text: tr("auto.fields.normal")
    }, {
      ...sectionTemplate("auto", tr, auto, [{
        node: infoMut(dmgFormulas.charged.dmg1, { key: `char_${key}_gen:${elementKey}.auto.skillParams.5` }),
        textSuffix: "(1)"
      }, {
        node: infoMut(dmgFormulas.charged.dmg2, { key: `char_${key}_gen:${elementKey}.auto.skillParams.5` }),
        textSuffix: "(2)"
      }, {
        text: tr("auto.skillParams.6"),
        value: datamine.charged.stamina,
      }]
      ),
      text: tr("auto.fields.charged"),
    }, {
      ...sectionTemplate("auto", tr, auto, [{
        node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
      }, {
        node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
      }, {
        node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
      }]
      ),
      text: tr("auto.fields.plunging"),
    }]),
    skill: talentTemplate("skill", tr, skill, [{
      node: infoMut(dmgFormulas.skill.initial_dmg, { key: `char_${key}_gen:${elementKey}.skill.skillParams.0` }),
    }, {
      node: infoMut(dmgFormulas.skill.initial_max, { key: `char_${key}_gen:${elementKey}.skill.skillParams.1` }),
    }, {
      node: infoMut(dmgFormulas.skill.storm_dmg, { key: `char_${key}_gen:${elementKey}.skill.skillParams.2` }),
    }, {
      node: infoMut(dmgFormulas.skill.storm_max, { key: `char_${key}_gen:${elementKey}.skill.skillParams.3` }),
    }, {
      text: tr("skill.skillParams.4"),
      value: datamine.skill.cd,
      unit: "s"
    }, {
      text: tr("skill.skillParams.5"),
      value: datamine.skill.maxCd,
      unit: "s"
    }, {
      canShow: data => data.get(input.constellation).value >= 4,
      text: trm("c1"),
      value: 10,
      unit: "%"
    }]),
    burst: talentTemplate("burst", tr, burst, [{
      node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:${elementKey}.burst.skillParams.0` }),
    }, {
      text: tr("burst.skillParams.2"),
      value: datamine.burst.duration,
      unit: "s"
    }, {
      text: tr("burst.skillParams.3"),
      value: datamine.burst.cd,
      unit: "s"
    }, {
      text: tr("burst.skillParams.4"),
      value: datamine.burst.enerCost,
    }], {
      value: condBurstAbsorption,
      path: condBurstAbsorptionPath,
      name: st("eleAbsor"),
      states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
        name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
        fields: [{
          node: infoMut(dmgFormulas.burst.absorb, { key: `char_${key}_gen:${elementKey}.burst.skillParams.1` }),
        }]
      }]))
    }, [
      // C6 anemo
      sectionTemplate("constellation6", tr, c6, undefined, {
        value: condC6,
        path: condC6Path,
        description: tr("constellation6.description.0"),
        teamBuff: true,
        name: trm("c6"),
        canShow: greaterEq(input.constellation, 6, 1),
        states: {
          on: {
            fields: [{
              node: infoMut(nodeC6, { key: "anemo_enemyRes_", variant: "anemo" })
            }]
          }
        }
      }), 
      // C6 elemental self-display
      sectionTemplate("constellation6", tr, c6, absorbableEle.map(eleKey => (
          { node: nodesC6[`${eleKey}_enemyRes_`] }
        )),
        undefined,
        data => data.get(input.constellation).value >= 6
          && data.get(condBurstAbsorption).value !== undefined
          && data.get(equal(target.charKey, key, 1)).value === 1,
        false,
        true
      ),
      // C6 elemental team-display
      sectionTemplate("constellation6", tr, c6, undefined, {
        value: condBurstAbsorption,
        path: condBurstAbsorptionPath,
        description: tr("constellation6.description.1"),
        name: st("eleAbsor"),
        teamBuff: true,
        canShow: greaterEq(input.constellation, 6, unequal(input.activeCharKey, key, 1)),
        states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
          name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
          fields: [{
            node: nodesC6[`${eleKey}_enemyRes_`]
          }]
        }]))
      })
    ]),
    passive1: talentTemplate("passive1", tr, passive1, [{
      node: infoMut(dmgFormulas.passive1.dmg, { key: `char_${key}:${elementKey}.p1` }) 
    }]),
    passive2: talentTemplate("passive2", tr, passive2, [{
      node: infoMut(dmgFormulas.passive2.heal, { key: `sheet_gen:healing`, variant: "success" }) 
    }]),
    constellation1: talentTemplate("constellation1", tr, c1),
    constellation2: talentTemplate("constellation2", tr, c2, [{ node: nodeC2 }]),
    constellation3: talentTemplate("constellation3", tr, c3, [{ node: nodeC3 }]),
    constellation4: talentTemplate("constellation4", tr, c4),
    constellation5: talentTemplate("constellation5", tr, c5, [{ node: nodeC5 }]),
    constellation6: talentTemplate("constellation6", tr, c6),
  },
}
export default talentSheet
