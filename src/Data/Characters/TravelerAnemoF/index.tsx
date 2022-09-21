import { CharacterData } from 'pipeline'
import { infoMut } from '../../../Formula/utils'
import { CharacterKey, CharacterSheetKey } from '../../../Types/consts'
import { trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { dmgNode } from '../dataUtil'
import TravelerF from '../TravelerF'
import anemo from './anemo'
import assets from './assets'
import skillParam_gen from './skillParam_gen.json'

const data_gen = TravelerF.data_gen as CharacterData
const key: CharacterSheetKey = "TravelerAnemoF"
const charKey: CharacterKey = "TravelerAnemo"
const [tr] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0
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

const { talent, data, elementKey } = anemo(key, charKey, dmgFormulas)
talent.auto = ct.talentTemplate("auto", [{
  text: tr("auto.fields.normal")
}, {
  fields: datamine.normal.hitArr.map((_, i) => ({
    node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
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
}])

const sheet: ICharacterSheet = { ...TravelerF.sheet, talent, key: charKey, elementKey }

export default new CharacterSheet(sheet, data, assets)
