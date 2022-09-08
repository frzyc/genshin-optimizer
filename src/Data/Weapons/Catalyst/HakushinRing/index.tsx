import { WeaponData } from 'pipeline'
import ColorText from '../../../../Components/ColoredText'
import { input, target } from '../../../../Formula'
import { equal, infoMut, subscript, unequal } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, sgt, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "HakushinRing"
const data_gen = data_gen_json as WeaponData

const refinementEleBonusSrc = [0.1, 0.125, 0.15, 0.175, 0.2]

const [condPassivePath, condPassive] = cond(key, "SakuraSaiguu")
const eleDmg = subscript(input.weapon.refineIndex, refinementEleBonusSrc)
const anemo_dmg_disp  = equal("anemo", condPassive, eleDmg)
const cryo_dmg_disp   = equal("cryo", condPassive, eleDmg)
const geo_dmg_disp    = equal("geo", condPassive, eleDmg)
const hydro_dmg_disp  = equal("hydro", condPassive, eleDmg)
const pyro_dmg_disp   = equal("pyro", condPassive, eleDmg)
const dendro_dmg_disp = equal("dendro", condPassive, eleDmg)
const anemo_dmg_  = equal("anemo", target.charEle, anemo_dmg_disp)
const cryo_dmg_   = equal("cryo", target.charEle, cryo_dmg_disp)
const geo_dmg_    = equal("geo", target.charEle, geo_dmg_disp)
const hydro_dmg_  = equal("hydro", target.charEle, hydro_dmg_disp)
const pyro_dmg_   = equal("pyro", target.charEle, pyro_dmg_disp)
const dendro_dmg_ = equal("dendro", target.charEle, dendro_dmg_disp)

const electro_dmg_disp = unequal(condPassive, undefined, eleDmg)
const electro_dmg_ = equal("electro", target.charEle, electro_dmg_disp)

const data = dataObjForWeaponSheet(key, data_gen, {
  teamBuff: {
    premod: {
      anemo_dmg_,
      cryo_dmg_,
      electro_dmg_,
      geo_dmg_,
      hydro_dmg_,
      pyro_dmg_,
      dendro_dmg_,
    }
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    name: st("elementalReaction.electro"),
    teamBuff: true,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    states: {
      anemo: {
        name: <ColorText color="swirl">{sgt("reaction.swirl")}</ColorText>,
        fields: [{
          node: infoMut(anemo_dmg_disp, { key: "anemo_dmg_", variant: "anemo", isTeamBuff: true }),
        }, {
          node: infoMut(electro_dmg_disp, { key: "electro_dmg_", variant: "electro", isTeamBuff: true }),
        }, {
          text: sgt("duration"),
          value: 6,
          unit: "s"
        }]
      },
      cryo: {
        name: <ColorText color="superconduct">{sgt("reaction.superconduct")}</ColorText>,
        fields: [{
          node: infoMut(cryo_dmg_disp, { key: "cryo_dmg_", variant: "cryo", isTeamBuff: true }),
        }, {
          node: infoMut(electro_dmg_disp, { key: "electro_dmg_", variant: "electro", isTeamBuff: true }),
        }, {
          text: sgt("duration"),
          value: 6,
          unit: "s"
        }]
      },
      geo: {
        name: <ColorText color="crystallize">{sgt("reaction.crystallize")}</ColorText>,
        fields: [{
          node: infoMut(geo_dmg_disp, { key: "geo_dmg_", variant: "geo", isTeamBuff: true }),
        }, {
          node: infoMut(electro_dmg_disp, { key: "electro_dmg_", variant: "electro", isTeamBuff: true }),
        }, {
          text: sgt("duration"),
          value: 6,
          unit: "s"
        }]
      },
      pyro: {
        name: <ColorText color="overloaded">{sgt("reaction.overloaded")}</ColorText>,
        fields: [{
          node: infoMut(pyro_dmg_disp, { key: "pyro_dmg_", variant: "pyro", isTeamBuff: true }),
        }, {
          node: infoMut(electro_dmg_disp, { key: "electro_dmg_", variant: "electro", isTeamBuff: true }),
        }, {
          text: sgt("duration"),
          value: 6,
          unit: "s"
        }]
      },
      hydro: {
        name: <ColorText color="electrocharged">{sgt("reaction.electrocharged")}</ColorText>,
        fields: [{
          node: infoMut(hydro_dmg_disp, { key: "hydro_dmg_", variant: "hydro", isTeamBuff: true }),
        }, {
          node: infoMut(electro_dmg_disp, { key: "electro_dmg_", variant: "electro", isTeamBuff: true }),
        }, {
          text: sgt("duration"),
          value: 6,
          unit: "s"
        }]
      },
      dendro: {
        name: <ColorText color="aggravate">{sgt("reaction.aggravate")}</ColorText>,
        fields: [{
          node: infoMut(dendro_dmg_disp, { key: "dendro_dmg_", variant: "dendro", isTeamBuff: true }),
        }, {
          node: infoMut(electro_dmg_disp, { key: "electro_dmg_", variant: "electro", isTeamBuff: true }),
        }, {
          text: sgt("duration"),
          value: 6,
          unit: "s"
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
