import StatIcon from "../Components/StatIcon";
import { Translate } from "../Components/Translate";
import { tally } from "../Formula";
import { UIData } from "../Formula/uiData";
import { equal, greaterEq, min, percent, sum } from "../Formula/utils";
import { allElements, allElementsWithPhy } from "../Types/consts";
import { DocumentSection } from "../Types/sheet";
import { objectKeyValueMap } from "../Util/Util";
import { condReadNode, sgt, st } from "./SheetUtil";
const tr = (strKey: string) => <Translate ns="resonance_gen" key18={strKey} />
const trm = (strKey: string) => <Translate ns="resonance" key18={strKey} />

type IResonance = {
  name: Displayable,
  icon: Displayable,
  canShow: (data: UIData) => boolean
  sections: DocumentSection[]
}

// TODO: need to create data object of all the resonance, and hook it up

// Protective Canopy
const pcNodes = objectKeyValueMap(allElementsWithPhy, e => [`${e}_res_`,
greaterEq(4, sum(...allElementsWithPhy.map(i => min(1, tally[i]))), percent(0.15))])

const protectiveCanopy: IResonance = {
  name: tr("ProtectiveCanopy.name"),
  icon: <span>{StatIcon.anemo} {StatIcon.geo} {StatIcon.pyro} {StatIcon.hydro} {StatIcon.cryo} {StatIcon.electro} x4</span>,
  canShow: (data: UIData) => allElements.filter(e => data.get(tally[e]).value >= 1).length === 4,
  sections: [{
    teamBuff:true,
    text: tr("ProtectiveCanopy.desc"),
    fields: Object.values(pcNodes).map(node => ({ node }))
  }]
}

// Fervent Flames
const ffNode = greaterEq(2, tally.pyro, percent(0.25))
const ferventFlames: IResonance = {
  name: tr("FerventFlames.name"),
  icon: <span>{StatIcon.pyro} {StatIcon.pyro}</span>,
  canShow: (data: UIData) => data.get(tally.pyro).value >= 2,
  sections: [{
    teamBuff:true,
    text: tr("FerventFlames.desc"),
    fields: [{
      node: ffNode
    }, {
      text: st("affectDuration.cryo"),
      value: -40,
      unit: "%"
    }]
  }]
}

// Soothing Waters
const swNode = greaterEq(2, tally.hydro, percent(0.25))
const soothingWaters: IResonance = {
  name: tr("SoothingWater.name"),
  icon: <span>{StatIcon.hydro} {StatIcon.hydro}</span>,
  canShow: (data: UIData) => data.get(tally.hydro).value >= 2,
  sections: [{
    teamBuff:true,
    text: tr("SoothingWater.desc"),
    fields: [{
      node: swNode
    }, {
      text: st("affectDuration.pyro"),
      value: -40,
      unit: "%"
    }]
  }]
}

//ShatteringIce
const condSIPath = ["resonance", "ShatteringIce"]
const condSI = condReadNode(condSIPath)
const siNode = greaterEq(2, tally.cryo, equal(condSI, "on", percent(0.15)))
const shatteringIce: IResonance = {
  name: tr("ShatteringIce.name"),
  icon: <span>{StatIcon.cryo} {StatIcon.cryo}</span>,
  canShow: (data: UIData) => data.get(tally.cryo).value >= 2,
  sections: [{
    teamBuff:true,
    text: tr("ShatteringIce.desc"),
    fields: [{
      text: st("affectDuration.electro"),
      value: -40,
      unit: "%"
    }],
    conditional: {
      path: condSIPath,
      value: condSI,
      name: trm("ShatteringIce.cond"),
      states: {
        on: {
          fields: [{
            node: siNode
          }]
        }
      }
    }
  }]
}

// High Voltage
const highVoltage: IResonance = {
  name: tr("HighVoltage.name"),
  icon: <span>{StatIcon.electro} {StatIcon.electro}</span>,
  canShow: (data: UIData) => data.get(tally.electro).value >= 2,
  sections: [{
    teamBuff:true,
    text: tr("HighVoltage.desc"),
    fields: [{
      text: st("affectDuration.hydro"),
      value: -40,
      unit: "%"
    }]
  }]
}

// Impetuous Winds
const swNodeStam = greaterEq(2, tally.anemo, percent(0.15))
const swNodeMove = greaterEq(2, tally.anemo, percent(0.1))
const swNodeCD = greaterEq(2, tally.anemo, percent(0.5))
const impetuousWinds: IResonance = {
  name: tr("ImpetuousWinds.name"),
  icon: <span>{StatIcon.hydro} {StatIcon.hydro}</span>,
  canShow: (data: UIData) => data.get(tally.hydro).value >= 2,
  sections: [{
    teamBuff:true,
    text: tr("ImpetuousWinds.desc"),
    fields: [{
      node: swNodeStam
    }, {
      node: swNodeMove
    }, {
      node: swNodeCD
    }]
  }]
}

// Enduring Rock
const condERPath = ["resonance", "EnduringRock"]
const condER = condReadNode(condSIPath)
const erNodeshield_ = greaterEq(2, tally.anemo, percent(0.15))
const erNodeDMG_ = greaterEq(2, tally.anemo, percent(0.15))
const erNodeRes_ = greaterEq(2, tally.anemo, percent(0.2))
const enduringRock: IResonance = {
  name: tr("EnduringRock.name"),
  icon: <span>{StatIcon.geo} {StatIcon.geo}</span>,
  canShow: (data: UIData) => data.get(tally.geo).value >= 2,
  sections: [{
    teamBuff:true,
    text: tr("EnduringRock.desc"),
    fields: [{
      node: erNodeshield_
    }],
    conditional: {
      path: condERPath,
      value: condER,
      name: st("protectedByShield"),
      states: {
        on: {
          fields: [{
            node: erNodeDMG_
          }, {
            node: erNodeRes_
          }, {
            text: sgt("duration"),
            value: 15,
            unit: "s"
          }]
        }
      }
    }
  }]
}

export const resonanceSheets: IResonance[] = [
  protectiveCanopy,
  ferventFlames,
  soothingWaters,
  shatteringIce,
  highVoltage,
  impetuousWinds,
  enduringRock,
]
