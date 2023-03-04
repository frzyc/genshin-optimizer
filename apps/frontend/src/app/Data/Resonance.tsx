import { allElementKeys, allElementWithPhyKeys } from "@genshin-optimizer/consts";
import ElementCycle from "../Components/ElementCycle";
import { Translate } from "../Components/Translate";
import { input, tally } from "../Formula";
import { inferInfoMut } from "../Formula/api";
import { UIData } from "../Formula/uiData";
import { equal, greaterEq, infoMut, percent, sum } from "../Formula/utils";
import KeyMap from "../KeyMap";
import { iconInlineProps } from "../SVGIcons";
import AnemoIcon from "../SVGIcons/Element/AnemoIcon";
import CryoIcon from "../SVGIcons/Element/CryoIcon";
import DendroIcon from "../SVGIcons/Element/DendroIcon";
import ElectroIcon from "../SVGIcons/Element/ElectroIcon";
import GeoIcon from "../SVGIcons/Element/GeoIcon";
import HydroIcon from "../SVGIcons/Element/HydroIcon";
import PyroIcon from "../SVGIcons/Element/PyroIcon";
import { DocumentSection } from "../Types/sheet";
import { objectKeyValueMap } from "../Util/Util";
import { condReadNode, st, stg } from "./SheetUtil";
const tr = (strKey: string) => <Translate ns="elementalResonance_gen" key18={strKey} />
const trm = (strKey: string) => <Translate ns="elementalResonance" key18={strKey} />

type IResonance = {
  name: Displayable,
  desc: Displayable,
  icon: Displayable,
  canShow: (data: UIData) => boolean
  sections: DocumentSection[]
}

const teamSize = sum(...allElementKeys.map(ele => tally[ele]))

// Protective Canopy
const pcNodes = objectKeyValueMap(allElementWithPhyKeys, e => [
  `${e}_res_`,
  equal(input.activeCharKey, input.charKey,
    greaterEq(tally.ele, 4, percent(0.15))
  )
])

const protectiveCanopy: IResonance = {
  name: tr("ProtectiveCanopy.name"),
  desc: tr("ProtectiveCanopy.desc"),
  icon: <span><ElementCycle iconProps={iconInlineProps} /> x4</span>,
  canShow: (data: UIData) => allElementKeys.filter(e => data.get(tally[e]).value >= 1).length === 4,
  sections: [{
    teamBuff: true,
    fields: Object.values(pcNodes).map(node => ({ node }))
  }]
}

// Fervent Flames
const ffNode = equal(input.activeCharKey, input.charKey,
  greaterEq(teamSize, 4,
    greaterEq(tally.pyro, 2, percent(0.25))
  )
)
const ferventFlames: IResonance = {
  name: tr("FerventFlames.name"),
  desc: tr("FerventFlames.desc"),
  icon: <span><PyroIcon {...iconInlineProps} /> <PyroIcon {...iconInlineProps} /></span>,
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
const swNode = equal(input.activeCharKey, input.charKey,
  greaterEq(teamSize, 4,
    greaterEq(tally.hydro, 2, percent(0.25))
  )
)
const soothingWaters: IResonance = {
  name: tr("SoothingWater.name"),
  desc: tr("SoothingWater.desc"),
  icon: <span><HydroIcon {...iconInlineProps} /> <HydroIcon {...iconInlineProps} /></span>,
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
const siNode = equal(input.activeCharKey, input.charKey,
  greaterEq(teamSize, 4,
    greaterEq(tally.cryo, 2,
      equal(condSI, "on", percent(0.15))
    )
  )
)
const shatteringIce: IResonance = {
  name: tr("ShatteringIce.name"),
  desc: tr("ShatteringIce.desc"),
  icon: <span><CryoIcon {...iconInlineProps} /> <CryoIcon {...iconInlineProps} /></span>,
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
    name: st("enemyAffected.frozenOrCryo"),
    header: {
      title: tr("ShatteringIce.name"),
      icon: <CryoIcon />,
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
  icon: <span><ElectroIcon {...iconInlineProps} /> <ElectroIcon {...iconInlineProps} /></span>,
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
const iwNodeStam = equal(input.activeCharKey, input.charKey,
  greaterEq(teamSize, 4,
    greaterEq(tally.anemo, 2, percent(-0.15))
  )
)
const iwNodeMove = equal(input.activeCharKey, input.charKey,
  greaterEq(teamSize, 4,
    greaterEq(tally.anemo, 2, percent(0.1))
  )
)
const iwNodeCD = equal(input.activeCharKey, input.charKey,
  greaterEq(teamSize, 4,
    greaterEq(tally.anemo, 2, percent(-0.05))
  )
)
const impetuousWinds: IResonance = {
  name: tr("ImpetuousWinds.name"),
  desc: tr("ImpetuousWinds.desc"),
  icon: <span><AnemoIcon {...iconInlineProps} /> <AnemoIcon {...iconInlineProps} /></span>,
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
const condERShieldPath = ["resonance", "EnduringRock"]
const condERShield = condReadNode(condERShieldPath)
const condERHitPath = ["resonance", "EnduringRockHit"]
const condERHit = condReadNode(condERHitPath)
const erNodeshield_ = equal(input.activeCharKey, input.charKey,
  greaterEq(teamSize, 4,
    greaterEq(tally.geo, 2, percent(0.15))
  )
)
const erNodeDMG_ = equal(input.activeCharKey, input.charKey,
  greaterEq(teamSize, 4,
    greaterEq(tally.geo, 2,
      equal(condERShield, "on", percent(0.15))
    )
  )
)
const erNodeRes_ = equal(input.activeCharKey, input.charKey,
  greaterEq(teamSize, 4,
    greaterEq(tally.geo, 2,
      equal(condERHit, "on", percent(-0.2))
    )
  )
)
const enduringRock: IResonance = {
  name: tr("EnduringRock.name"),
  desc: tr("EnduringRock.desc"),
  icon: <span><GeoIcon {...iconInlineProps} /> <GeoIcon {...iconInlineProps} /></span>,
  canShow: (data: UIData) => data.get(tally.geo).value >= 2 && data.get(teamSize).value >= 4,
  sections: [{
    teamBuff: true,
    text: tr("EnduringRock.desc"),
    fields: [{
      node: erNodeshield_
    }]
  }, {
    teamBuff: true,
    path: condERShieldPath,
    value: condERShield,
    header: {
      title: tr("EnduringRock.name"),
      icon: <GeoIcon />,
    },
    name: st("protectedByShield"),
    states: {
      on: {
        fields: [{
          node: erNodeDMG_
        }]
      }
    }
  }, {
    teamBuff: true,
    path: condERHitPath,
    value: condERHit,
    header: {
      title: tr("EnduringRock.name"),
      icon: <GeoIcon />,
    },
    name: trm("EnduringRock.hitCond"),
    states: {
      on: {
        fields: [{
          node: erNodeRes_
        }, {
          text: stg("duration"),
          value: 15,
          unit: "s"
        }]
      }
    }
  }]
}

// Sprawling Greenery
const condSG2elePath = ["resonance", "SprawlingCanopy2ele"]
const condSG2ele = condReadNode(condSG2elePath)
const condSG3elePath = ["resonance", "SprawlingCanopy3ele"]
const condSG3ele = condReadNode(condSG3elePath)
const sgBase_eleMas = equal(input.activeCharKey, input.charKey,
  greaterEq(teamSize, 4,
    greaterEq(tally.dendro, 2, 50, { ...KeyMap.info("eleMas"), isTeamBuff: true })
  )
)
const sg2ele_eleMas = equal(input.activeCharKey, input.charKey,
  greaterEq(teamSize, 4,
    greaterEq(tally.dendro, 2,
      equal(condSG2ele, "on", 30, { ...KeyMap.info("eleMas"), isTeamBuff: true })
    )
  )
)
const sg3ele_eleMas = equal(input.activeCharKey, input.charKey,
  greaterEq(teamSize, 4,
    greaterEq(tally.dendro, 2,
      equal(condSG3ele, "on", 20, { ...KeyMap.info("eleMas"), isTeamBuff: true })
    )
  )
)
const sprawlingGreenery: IResonance = {
  name: tr("SprawlingGreenery.name"),
  desc: tr("SprawlingGreenery.desc"),
  icon: <span><DendroIcon {...iconInlineProps} /> <DendroIcon {...iconInlineProps} /></span>,
  canShow: (data: UIData) => data.get(tally.dendro).value >= 2 && data.get(teamSize).value >= 4,
  sections: [{
    teamBuff: true,
    text: tr("SprawlingGreenery.desc"),
    fields: [{ node: sgBase_eleMas }]
  }, {
    teamBuff: true,
    path: condSG2elePath,
    value: condSG2ele,
    header: {
      title: tr("SprawlingGreenery.name"),
      icon: <DendroIcon />,
    },
    name: trm("SprawlingGreenery.cond2ele"),
    states: {
      on: {
        fields: [{
          node: sg2ele_eleMas
        }, {
          text: stg("duration"),
          value: 6,
          unit: "s"
        }]
      }
    }
  }, {
    teamBuff: true,
    path: condSG3elePath,
    value: condSG3ele,
    header: {
      title: tr("SprawlingGreenery.name"),
      icon: <DendroIcon />,
    },
    name: trm("SprawlingGreenery.cond3ele"),
    states: {
      on: {
        fields: [{
          node: sg3ele_eleMas
        }, {
          text: stg("duration"),
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
  teamBuff: {
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
      eleMas: infoMut(sum(sgBase_eleMas, sg2ele_eleMas, sg3ele_eleMas), { pivot: true }),
    },
    total: {
      // TODO: this crit rate is on-hit. Might put it in a `hit.critRate_` namespace later.
      critRate_: siNode
    }
  }
})
