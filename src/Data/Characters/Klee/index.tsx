import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, percent, prod } from '../../../Formula/utils'
import { CharacterKey, ElementKey, Region } from '../../../Types/consts'
import { cond, sgt, trans } from '../../SheetUtil'
import CharacterSheet, { ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData
const key: CharacterKey = "Klee"
const elementKey: ElementKey = "pyro"
const regionKey: Region = "mondstadt"
const [tr, trm] = trans("char", key)

let a = 0, s = 0, b = 0
const datamine = {
  normal: {
    hitArr: [
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
    jumptyDumptyDmg1: skillParam_gen.skill[s++],
    jumptyDumptyDmg2: skillParam_gen.skill[s++],
    jumptyDumptyDmg3: skillParam_gen.skill[s++],
    mineDmg: skillParam_gen.skill[s++],
    mineDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    unknown: skillParam_gen.burst[b++], // what is this??
    duration: skillParam_gen.burst[b++][0],
  }
} as const

const [condA1Path, condA1] = cond(key, "PoundingSurprise")
const charged_dmg_ = equal("on", condA1, greaterEq(input.asc, 1, percent(0.5))) // The datamine does not hold this value unfortunately

const [condC2Path, condC2] = cond(key, "ExplosiveFrags")
const enemyDefRed_ = equal("on", condC2, greaterEq(input.constellation, 2, percent(0.23))) // The datamine does not hold this value unfortunately

const [condC6Path, condC6] = cond(key, "BlazingDelight")
const pyro_dmg_ = equal("on", condC6, greaterEq(input.constellation, 6, percent(0.1))) // The datamine does not hold this value unfortunately

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    jumptyDumptyDmg: dmgNode("atk", datamine.skill.jumptyDumptyDmg1, "skill"),
    mineDmg: dmgNode("atk", datamine.skill.mineDmg, "skill"),
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
  },
  constellation1: {
    // TODO: Is this correct?
    chainedReactionsDmg: prod(dmgNode("atk", datamine.burst.dmg, "burst"), percent(1.2)) // The datamine does not hold this value unfortunately
  },
  constellation4: {
    // TODO: Is this correct?
    sparklyExplosionDmg: customDmgNode(prod(percent(5.55), input.total.atk), "elemental", { hit: { ele: constant('pyro') } }) // The datamine does not hold this value unfortunately
  }
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, regionKey, data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC3,
    burst: nodeC5,
  },
  premod: {
    charged_dmg_
  },
  teamBuff: {
    premod: {
      pyro_dmg_,
      // TODO: Enemy def reduction should technically be in teambuff right?
      enemyDefRed_
    }
  }
})

const sheet: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normalSrc(data_gen.weaponTypeKey),
        sections: [
          {
            text: tr("auto.fields.normal"),
            fields: datamine.normal.hitArr.map((_, i) =>
            ({
              node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` })
            }))
          }, {
            text: tr("auto.fields.charged"),
            fields: [{
              node: infoMut(dmgFormulas.charged.dmg, { key: `char_${key}_gen:auto.skillParams.3` })
            }, {
              text: tr("auto.skillParams.4"),
              value: datamine.charged.stamina
            }]
          }, {
            text: tr("auto.fields.plunging"),
            fields: [{
              node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" })
            }, {
              node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" })
            }, {
              node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" })
            }]
          }
        ],
      },
      skill: talentTemplate("skill", tr, skill, [{
        node: infoMut(dmgFormulas.skill.jumptyDumptyDmg, { key: `char_${key}_gen:skill.skillParams.0` })
      }, {
        node: infoMut(dmgFormulas.skill.mineDmg, { key: `char_${key}_gen:skill.skillParams.1` })
      }, {
        text: tr("skill.skillParams.2"),
        value: `${datamine.skill.mineDuration}`,
        unit: "s"
      }, {
        text: tr("skill.skillParams.3"),
        value: `${datamine.skill.cd}`,
        unit: "s"
      }]),
      burst: talentTemplate("burst", tr, burst, [{
        node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` })
      }, {
        text: tr("burst.skillParams.1"),
        value: `${datamine.burst.duration}`,
        unit: "s"
      }, {
        text: tr("burst.skillParams.2"),
        value: `${datamine.burst.cd}`,
        unit: "s"
      }, {
        text: tr("burst.skillParams.3"),
        value: `${datamine.burst.enerCost}`
      }]),
      passive1: talentTemplate("passive1", tr, passive1, undefined, {
        value: condA1,
        path: condA1Path,
        canShow: greaterEq(input.asc, 1, 1),
        name: trm("a1CondName"),
        states: {
          on: {
            fields: [{
              node: charged_dmg_
            }, {
              text: trm("a1CondName2")
            }]
          }
        }
      }),
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1, [{
        node: infoMut(dmgFormulas.constellation1.chainedReactionsDmg, { key: `sheet:dmg` }),
      }]),
      constellation2: talentTemplate("constellation2", tr, c2, undefined, {
        value: condC2,
        path: condC2Path,
        canShow: greaterEq(input.constellation, 2, 1),
        teamBuff: true,
        name: trm("c2CondName"),
        states: {
          on: {
            fields: [{
              node: enemyDefRed_
            }, {
              text: sgt("duration"),
              value: 10,
              unit: "s"
            }]
          }
        }
      }),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: nodeC3 }]),
      constellation4: talentTemplate("constellation4", tr, c4, [{
        node: infoMut(dmgFormulas.constellation4.sparklyExplosionDmg, { key: `sheet:dmg` })
      }]),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: nodeC5 }]),
      constellation6: talentTemplate("constellation6", tr, c6, undefined, {
        value: condC6,
        path: condC6Path,
        canShow: greaterEq(input.constellation, 6, 1),
        teamBuff: true,
        name: trm("c6CondName"),
        states: {
          on: {
            fields: [{
              node: pyro_dmg_
            }, {
              text: sgt("duration"),
              value: 25,
              unit: "s"
            }]
          }
        }
      })
    }
  }
};
export default new CharacterSheet(sheet, data);
