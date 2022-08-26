import StatIcon from "../Components/StatIcon";
import { Translate } from "../Components/Translate";
import { tally } from "../Formula";
import { inferInfoMut } from "../Formula/api";
import { UIData } from "../Formula/uiData";
import { equal, greaterEq, infoMut, percent, sum } from "../Formula/utils";
import { allElements, allElementsWithPhy } from "../Types/consts";
import { DocumentSection } from "../Types/sheet";
import { objectKeyValueMap } from "../Util/Util";
import { condReadNode, sgt, st } from "./SheetUtil";
const tr = (strKey: string) => <Translate ns="elementalResonance_gen" key18={strKey} />
const trm = (strKey: string) => <Translate ns="elementalResonance" key18={strKey} />

type IResonance = {
  name: Displayable,
  desc: Displayable,
  icon: Displayable,
  canShow: (data: UIData) => boolean
  sections: DocumentSection[]
}

const teamSize = sum(...allElements.map(ele => tally[ele]))

// Protective Canopy
const pcNodes = objectKeyValueMap(allElementsWithPhy, e => [`${e}_res_`, greaterEq(tally.ele, 4, percent(0.15))])

const protectiveCanopy: IResonance = {
  name: tr("ProtectiveCanopy.name"),
  desc: tr("ProtectiveCanopy.desc"),
  icon: <span>{StatIcon.anemo} {StatIcon.geo} {StatIcon.pyro} {StatIcon.hydro} {StatIcon.cryo} {StatIcon.electro} x4</span>,
  canShow: (data: UIData) => allElements.filter(e => data.get(tally[e]).value >= 1).length === 4,
  sections: [{
    teamBuff: true,
    fields: Object.values(pcNodes).map(node => ({ node }))
  }]
}

// Fervent Flames
const ffNode = greaterEq(teamSize, 4, greaterEq(tally.pyro, 2, percent(0.25)))
const ferventFlames: IResonance = {
  name: tr("FerventFlames.name"),
  desc: tr("FerventFlames.desc"),
  icon: <span>{StatIcon.pyro} {StatIcon.pyro}</span>,
  canShow: (data: UIData) => data.get(tally.pyro).value >= 2 && data.get(teamSize).value >= 4,
  sections: [{
    teamBuff: true,
    fields: [{
      text: st("effectDuration.cryo"),
      value: -40,
      unit: "%"
    }, {
      node: ffNode
    }]
  }]
}

// Soothing Waters
const swNode = greaterEq(teamSize, 4, greaterEq(tally.hydro, 2, percent(0.25)))
const soothingWaters: IResonance = {
  name: tr("SoothingWater.name"),
  desc: tr("SoothingWater.desc"),
  icon: <span>{StatIcon.hydro} {StatIcon.hydro}</span>,
  canShow: (data: UIData) => data.get(tally.hydro).value >= 2 && data.get(teamSize).value >= 4,
  sections: [{
    teamBuff: true,
    fields: [{
      text: st("effectDuration.pyro"),
      value: -40,
      unit: "%"
    }, {
      node: swNode
    }]
  }]
}

//ShatteringIce
const condSIPath = ["resonance", "ShatteringIce"]
const condSI = condReadNode(condSIPath)
const siNode = greaterEq(teamSize, 4, greaterEq(tally.cryo, 2, equal(condSI, "on", percent(0.15))))
const shatteringIce: IResonance = {
  name: tr("ShatteringIce.name"),
  desc: tr("ShatteringIce.desc"),
  icon: <span>{StatIcon.cryo} {StatIcon.cryo}</span>,
  canShow: (data: UIData) => data.get(tally.cryo).value >= 2 && data.get(teamSize).value >= 4,
  sections: [{
    teamBuff: true,
    fields: [{
      text: st("effectDuration.electro"),
      value: -40,
      unit: "%"
    }]
  }, {
    teamBuff: true,
    path: condSIPath,
    value: condSI,
    name: trm("ShatteringIce.cond"),
    header: {
      title: tr("ShatteringIce.name"),
      icon: StatIcon.cryo,
    },
    states: {
      on: {
        fields: [{
          node: siNode
        }]
      }
    }
  }]
}

// High Voltage
const highVoltage: IResonance = {
  name: tr("HighVoltage.name"),
  desc: tr("HighVoltage.desc"),
  icon: <span>{StatIcon.electro} {StatIcon.electro}</span>,
  canShow: (data: UIData) => data.get(tally.electro).value >= 2 && data.get(teamSize).value >= 4,
  sections: [{
    teamBuff: true,
    fields: [{
      text: st("effectDuration.hydro"),
      value: -40,
      unit: "%"
    }]
  }]
}

// Impetuous Winds
const iwNodeStam = greaterEq(teamSize, 4, greaterEq(tally.anemo, 2, percent(-0.15)))
const iwNodeMove = greaterEq(teamSize, 4, greaterEq(tally.anemo, 2, percent(0.1)))
const iwNodeCD = greaterEq(teamSize, 4, greaterEq(tally.anemo, 2, percent(-0.05)))
const impetuousWinds: IResonance = {
  name: tr("ImpetuousWinds.name"),
  desc: tr("ImpetuousWinds.desc"),
  icon: <span>{StatIcon.anemo} {StatIcon.anemo}</span>,
  canShow: (data: UIData) => data.get(tally.anemo).value >= 2 && data.get(teamSize).value >= 4,
  sections: [{
    teamBuff: true,
    fields: [{
      node: iwNodeStam
    }, {
      node: iwNodeMove
    }, {
      node: iwNodeCD
    }]
  }]
}

// Enduring Rock
const condERPath = ["resonance", "EnduringRock"]
const condER = condReadNode(condERPath)
const erNodeshield_ = greaterEq(teamSize, 4, greaterEq(tally.geo, 2, percent(0.15)))
const erNodeDMG_ = greaterEq(teamSize, 4, greaterEq(tally.geo, 2, equal(condER, "on", percent(0.15))))
const erNodeRes_ = greaterEq(teamSize, 4, greaterEq(tally.geo, 2, equal(condER, "on", percent(-0.2))))
const enduringRock: IResonance = {
  name: tr("EnduringRock.name"),
  desc: tr("EnduringRock.desc"),
  icon: <span>{StatIcon.geo} {StatIcon.geo}</span>,
  canShow: (data: UIData) => data.get(tally.geo).value >= 2 && data.get(teamSize).value >= 4,
  sections: [{
    teamBuff: true,
    text: tr("EnduringRock.desc"),
    fields: [{
      node: erNodeshield_
    }]
  }, {
    teamBuff: true,
    path: condERPath,
    value: condER,
    header: {
      title: tr("EnduringRock.name"),
      icon: StatIcon.geo,
    },
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
  }]
}

// Sprawling Canopy
const condSC2elePath = ["resonance", "SprawlingCanopy2ele"]
const condSC2ele = condReadNode(condSC2elePath)
const condSC3elePath = ["resonance", "SprawlingCanopy3ele"]
const condSC3ele = condReadNode(condSC3elePath)
const scBase_eleMas = greaterEq(teamSize, 4, greaterEq(tally.dendro, 2, 50, { key: "eleMas" }))
const sc2ele_eleMas = greaterEq(teamSize, 4, greaterEq(tally.dendro, 2, equal(condSC2ele, "on", 30, { key: "eleMas" })))
const sc3ele_eleMas = greaterEq(teamSize, 4, greaterEq(tally.dendro, 2, equal(condSC3ele, "on", 20, { key: "eleMas" })))
const sprawlingGreenery: IResonance = {
  name: tr("SprawlingGreenery.name"),
  desc: tr("SprawlingGreenery.desc"),
  icon: <span>{StatIcon.dendro} {StatIcon.dendro}</span>,
  canShow: (data: UIData) => data.get(tally.dendro).value >= 2 && data.get(teamSize).value >= 4,
  sections: [{
    teamBuff: true,
    text: tr("SprawlingGreenery.desc"),
    fields: [{ node: scBase_eleMas }]
  }, {
    teamBuff: true,
    path: condSC2elePath,
    value: condSC2ele,
    header: {
      title: tr("SprawlingGreenery.name"),
      icon: StatIcon.dendro,
    },
    name: trm("SprawlingGreenery.cond2ele"),
    states: {
      on: {
        fields: [{
          node: sc2ele_eleMas
        }, {
          text: sgt("duration"),
          value: 6,
          unit: "s"
        }]
      }
    }
  }, {
    teamBuff: true,
    path: condSC3elePath,
    value: condSC3ele,
    header: {
      title: tr("SprawlingGreenery.name"),
      icon: StatIcon.dendro,
    },
    name: trm("SprawlingGreenery.cond3ele"),
    states: {
      on: {
        fields: [{
          node: sc3ele_eleMas
        }, {
          text: sgt("duration"),
          value: 6,
          unit: "s"
        }]
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
  sprawlingGreenery,
]

export const resonanceData = inferInfoMut({
  premod: {
    ...pcNodes,
    atk_: ffNode,
    hp_: swNode,
    staminaDec_: iwNodeStam,
    moveSPD_: iwNodeMove,
    cdRed_: iwNodeCD,
    shield_: erNodeshield_,
    all_dmg_: erNodeDMG_,
    geo_enemyRes_: erNodeRes_,
    eleMas: infoMut(sum(scBase_eleMas, sc2ele_eleMas, sc3ele_eleMas), { pivot: true }),
  },
  total: {
    // TODO: this crit rate is on-hit. Might put it in a `hit.critRate_` namespace later.
    critRate_: siNode
  }
})
