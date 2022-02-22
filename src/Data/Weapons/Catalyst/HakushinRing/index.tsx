import { WeaponData } from 'pipeline'
import ColorText from '../../../../Components/ColoredText'
import { Translate } from '../../../../Components/Translate'
import { input } from '../../../../Formula'
import { equal, lookup, naught, subscript, unequal } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, sgt, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { conditionaldesc, conditionalHeader, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "HakushinRing"
const data_gen = data_gen_json as WeaponData
const [tr] = trans("weapon", key)

const refinementEleBonusSrc = [0.1, 0.125, 0.15, 0.175, 0.2]

const [condPassivePath, condPassive] = cond(key, "SakuraSaiguu")
const eleDmg = subscript(input.weapon.refineIndex, refinementEleBonusSrc)
const anemo_dmg_ = unequal(input.activeCharKey, input.charKey, equal("anemo", condPassive, eleDmg))
const cryo_dmg_ = unequal(input.activeCharKey, input.charKey, equal("cryo", condPassive, eleDmg))
const geo_dmg_ = unequal(input.activeCharKey, input.charKey, equal("geo", condPassive, eleDmg))
const hydro_dmg_ = unequal(input.activeCharKey, input.charKey, equal("hydro", condPassive, eleDmg))
const pyro_dmg_ = unequal(input.activeCharKey, input.charKey, equal("pyro", condPassive, eleDmg))

const electro_dmg_ = unequal(input.activeCharKey, input.charKey, lookup(condPassive, { "anemo": eleDmg, "cryo": eleDmg, "geo": eleDmg, "hydro": eleDmg, "pyro": eleDmg }, naught))

// This should be in teambuff: premod right?
const data = dataObjForWeaponSheet(key, data_gen, {
  teamBuff: {
    premod: {
      anemo_dmg_,
      cryo_dmg_,
      electro_dmg_,
      geo_dmg_,
      hydro_dmg_,
      pyro_dmg_,
    }
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    conditional: {
      value: condPassive,
      path: condPassivePath,
      name: <Translate ns="weapon_HakushinRing" key18="afterElectroReaction" />,
      canShow: unequal(input.activeCharKey, input.charKey, 1),
      teamBuff: true,
      header: conditionalHeader(tr, icon, iconAwaken),
      description: conditionaldesc(tr),
      states: {
        anemo: {
          name: <ColorText color="anemo">{sgt("reaction.swirl")}</ColorText>,
          fields: [{
            node: anemo_dmg_
          }, {
            node: electro_dmg_
          }, {
            text: sgt("duration"),
            value: 6,
            unit: "s"
          }]
        },
        cryo: {
          name: <ColorText color="cryo">{sgt("reaction.Superconduct")}</ColorText>,
          fields: [{
            node: cryo_dmg_
          }, {
            node: electro_dmg_
          }, {
            text: sgt("duration"),
            value: 6,
            unit: "s"
          }]
        },
        geo: {
          name: <ColorText color="geo">{sgt("reaction.crystallize")}</ColorText>,
          fields: [{
            node: geo_dmg_
          }, {
            node: electro_dmg_
          }, {
            text: sgt("duration"),
            value: 6,
            unit: "s"
          }]
        },
        pyro: {
          name: <ColorText color="pyro">{sgt("reaction.overloaded")}</ColorText>,
          fields: [{
            node: pyro_dmg_
          }, {
            node: electro_dmg_
          }, {
            text: sgt("duration"),
            value: 6,
            unit: "s"
          }]
        },
        hydro: {
          name: <ColorText color="hydro">{sgt("reaction.electrocharged")}</ColorText>,
          fields: [{
            node: hydro_dmg_
          }, {
            node: electro_dmg_
          }, {
            text: sgt("duration"),
            value: 6,
            unit: "s"
          }]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)