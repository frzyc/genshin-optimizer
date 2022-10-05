import { CharacterData } from 'pipeline'
import { infoMut } from '../../../Formula/utils'
import { CharacterKey, CharacterSheetKey, WeaponTypeKey } from '../../../Types/consts'
import { trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { dmgNode } from '../dataUtil'
import data_gen_src from './data_gen.json'
const data_gen = data_gen_src as CharacterData

export function travelerSheet(key: CharacterSheetKey, charKey: CharacterKey, talentFunc: any, skillParam_gen: any, assets: any, baseTravelerSheet: Partial<ICharacterSheet>) {
  const datamine = {
    normal: {
      hitArr: [
        skillParam_gen.auto[0],
        skillParam_gen.auto[1],
        skillParam_gen.auto[2],
        skillParam_gen.auto[3],
        skillParam_gen.auto[4],
      ]
    },
    charged: {
      hit1: skillParam_gen.auto[5],
      hit2: skillParam_gen.auto[6],
      stamina: skillParam_gen.auto[7][0],
    },
    plunging: {
      dmg: skillParam_gen.auto[8],
      low: skillParam_gen.auto[9],
      high: skillParam_gen.auto[10],
    },
  } as const

  const dmgFormulas = {
    normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
      [i, dmgNode("atk", arr, "normal")])),
    charged: {
      dmg1: dmgNode("atk", datamine.charged.hit1, "charged"),
      dmg2: dmgNode("atk", datamine.charged.hit2, "charged")
    },
    plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
      [key, dmgNode("atk", value, "plunging")])),
  } as const

  const { talent, data, elementKey } = talentFunc(key, charKey, dmgFormulas)

  const [tr] = trans("char", key)
  const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

  talent.auto = ct.talentTemplate("auto", [{
    text: tr("auto.fields.normal")
  }, {
    fields: datamine.normal.hitArr.map((_: any, i: number) => ({
      node: infoMut(dmgFormulas.normal[i]!, { key: `char_${key}_gen:auto.skillParams.${i}` }),
    }))
  }, {
    text: tr("auto.fields.charged"),
  }, {
    fields: [{
      node: infoMut(dmgFormulas.charged.dmg1!, { key: `char_${key}_gen:auto.skillParams.5` }),
      textSuffix: "(1)"
    }, {
      node: infoMut(dmgFormulas.charged.dmg2!, { key: `char_${key}_gen:auto.skillParams.5` }),
      textSuffix: "(2)"
    }, {
      text: tr("auto.skillParams.6"),
      value: datamine.charged.stamina,
    }]
  }, {
    text: tr("auto.fields.plunging"),
  }, {
    fields: [{
      node: infoMut(dmgFormulas.plunging.dmg!, { key: "sheet_gen:plunging.dmg" }),
    }, {
      node: infoMut(dmgFormulas.plunging.low!, { key: "sheet_gen:plunging.low" }),
    }, {
      node: infoMut(dmgFormulas.plunging.high!, { key: "sheet_gen:plunging.high" }),
    }]
  }])

  const sheet = { ...baseTravelerSheet, talent, key: charKey, elementKey } as ICharacterSheet

  return new CharacterSheet(sheet, data, assets)
}

export default {
  sheet: {
    rarity: data_gen.star,
    weaponTypeKey: data_gen.weaponTypeKey as WeaponTypeKey,
  },
  data_gen,
} as const
