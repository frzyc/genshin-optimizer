import StatIcon from "../Components/StatIcon"
import { Translate } from "../Components/Translate"
import { sgt } from "../Data/Characters/SheetUtil"
import { allElements } from "../Types/consts"
import IConditional from "../Types/IConditional"
import { BasicStats } from "../Types/stats"
const tr = (strKey: string) => <Translate ns="resonance_gen" key18={strKey} />

type resonanceDoc = {
  header: IConditional["header"],
  description: Displayable,
  canShow: (stats: BasicStats) => boolean,
  conditionals: IConditional[]
}
const resonanceSheets: resonanceDoc[] = [{// Protective Canopy
  header: {
    title: tr("ProtectiveCanopy.name"),
    action: <span>{StatIcon.anemo} {StatIcon.geo} {StatIcon.pyro} {StatIcon.hydro} {StatIcon.cryo} {StatIcon.electro} x4</span>
  },
  description: tr("ProtectiveCanopy.desc"),
  canShow: stats => (new Set([...stats.teamStats.map(t => t?.characterEle ?? ""), stats.characterEle].filter(e => e))).size === 4,
  conditionals: [{
    key: "pc",
    partyBuff: "partyAll",
    canShow: stats => (new Set([...stats.teamStats.map(t => t?.characterEle ?? ""), stats.characterEle])).size === 4,
    maxStack: 0,
    stats: Object.fromEntries([...allElements, "physical"].map(ele => [`${ele}_res_`, 15]))
  }]
}, {// Fervent Flames
  header: {
    title: tr("FerventFlames.name"),
    action: <span>{StatIcon.pyro} {StatIcon.pyro}</span>,
  },
  description: tr("FerventFlames.desc"),
  canShow: stats => [...stats.teamStats.map(t => t?.characterEle ?? ""), stats.characterEle].filter(e => e === "pyro").length >= 2,
  conditionals: [{
    key: "ff",
    partyBuff: "partyAll",
    canShow: stats => [...stats.teamStats.map(t => t?.characterEle ?? ""), stats.characterEle].filter(e => e === "pyro").length >= 2,
    maxStack: 0,
    stats: {
      atk_: 25,
    },
    fields: [{
      text: "Cryo affect Duration",
      value: -40,
      unit: "%"
    }]
  }]
}, {// Soothing Waters
  header: {
    title: tr("SoothingWater.name"),
    action: <span>{StatIcon.hydro} {StatIcon.hydro}</span>,
  },
  canShow: stats => [...stats.teamStats.map(t => t?.characterEle ?? ""), stats.characterEle].filter(e => e === "hydro").length >= 2,
  description: tr("SoothingWater.desc"),
  conditionals: [{
    key: "sw",
    maxStack: 0,
    canShow: stats => [...stats.teamStats.map(t => t?.characterEle ?? ""), stats.characterEle].filter(e => e === "hydro").length >= 2,
    partyBuff: "partyAll",
    stats: {
      incHeal_: 30,
    },
    fields: [{
      text: "Pyro affect Duration",
      value: -40,
      unit: "%"
    }]
  }]
}, {
  header: {
    title: tr("ShatteringIce.name"),
    action: <span>{StatIcon.cryo} {StatIcon.cryo}</span>,
  },
  canShow: stats => [...stats.teamStats.map(t => t?.characterEle ?? ""), stats.characterEle].filter(e => e === "cryo").length >= 2,
  description: tr("ShatteringIce.desc"),
  conditionals: [{
    key: "si",// Shattering Ice
    name: "Against enemies that are Frozen or affected by Cryo",
    canShow: stats => [...stats.teamStats.map(t => t?.characterEle ?? ""), stats.characterEle].filter(e => e === "cryo").length >= 2,
    partyBuff: "partyAll",
    stats: {
      critRate_: 15,
    },
    fields: [{
      text: "Electro affect Duration",
      value: -40,
      unit: "%"
    }]
  },]
}, {
  header: {// High Voltage
    title: tr("HighVoltage.name"),
    action: <span>{StatIcon.electro} {StatIcon.electro}</span>,
  },
  description: tr("HighVoltage.desc"),
  canShow: stats => [...stats.teamStats.map(t => t?.characterEle ?? ""), stats.characterEle].filter(e => e === "electro").length >= 2,
  conditionals: [{
    key: "hv",
    partyBuff: "partyAll",
    maxStack: 0,
    canShow: stats => [...stats.teamStats.map(t => t?.characterEle ?? ""), stats.characterEle].filter(e => e === "electro").length >= 2,
    fields: [{
      text: "Hydro affect Duration",
      value: -40,
      unit: "%"
    }]
  }]
}, {
  header: {// Impetuous Winds
    title: tr("ImpetuousWinds.name"),
    action: <span>{StatIcon.anemo} {StatIcon.anemo}</span>,
  },
  description: tr("ImpetuousWinds.desc"),
  canShow: stats => [...stats.teamStats.map(t => t?.characterEle ?? ""), stats.characterEle].filter(e => e === "anemo").length >= 2,
  conditionals: [{
    key: "iw",
    partyBuff: "partyAll",
    canShow: stats => [...stats.teamStats.map(t => t?.characterEle ?? ""), stats.characterEle].filter(e => e === "anemo").length >= 2,
    maxStack: 0,
    stats: {
      staminaDec_: 15,
      moveSPD_: 10,
      skillCDRed_: 5,
    },
    fields: [{
      text: "Pyro affect Duration",
      value: -40,
      unit: "%"
    }]
  }]
}, {
  header: {
    title: tr("EnduringRock.name"),
    action: <span>{StatIcon.geo} {StatIcon.geo}</span>,
  },
  description: tr("EnduringRock.desc"),
  canShow: stats => [...stats.teamStats.map(t => t?.characterEle ?? ""), stats.characterEle].filter(e => e === "geo").length >= 2,
  conditionals: [{
    key: "er", // Enduring Rock
    name: "Increases shield strength",
    canShow: stats => [...stats.teamStats.map(t => t?.characterEle ?? ""), stats.characterEle].filter(e => e === "geo").length >= 2,
    partyBuff: "partyAll",
    stats: {
      shield_: 15,
    }
  }, {
    key: "ers", // Enduring Rock
    name: "characters protected by a shield",
    canShow: stats => [...stats.teamStats.map(t => t?.characterEle ?? ""), stats.characterEle].filter(e => e === "geo").length >= 2,
    partyBuff: "partyAll",
    stats: {
      dmg_: 15,
    }
  }, {
    key: "erd", // Enduring Rock
    name: "characters protected by a shield: dealing DMG to enemies",
    canShow: stats => [...stats.teamStats.map(t => t?.characterEle ?? ""), stats.characterEle].filter(e => e === "geo").length >= 2,
    partyBuff: "partyAll",
    stats: {
      geo_enemyRes_: -20,
    },
    fields: [{
      text: sgt("duration"),
      value: 15,
      unit: "s"
    }],
  }]
}]


export default resonanceSheets