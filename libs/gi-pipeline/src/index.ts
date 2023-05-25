import type { WeaponKey } from '@genshin-optimizer/consts'
import type {
  CharacterExpCurveData,
  WeaponExpCurveData,
} from '@genshin-optimizer/dm'
import {
  artifactMainstatData,
  artifactSubstatData,
  artifactSubstatRollCorrection,
  artifactSubstatRollData,
  avatarCurveExcelConfigData,
  weaponCurveExcelConfigData,
} from '@genshin-optimizer/dm'
import { dumpFile } from '@genshin-optimizer/pipeline'
import type { CharacterDatas } from './characterData'
import characterData from './characterData'
import type { SkillParamData } from './characterSkillParam'
import characterSkillParam from './characterSkillParam'
import materialData from './materialData'
import type { WeaponData } from './weaponData'
import weaponData from './weaponData'

const path = `${process.env['NX_WORKSPACE_ROOT']}/libs/gi-stats/Data`

console.log('Running Pipeline to generate files using dm.')

//parse baseStat/ascension/basic data
const characterDataDump = characterData()

//dump data file to respective character directory.
Object.entries(characterDataDump).forEach(([characterKey, data]) =>
  dumpFile(`${path}/Characters/${characterKey}/data.json`, data)
)

const characterSkillParamDump = characterSkillParam()
dumpFile(`${__dirname}/allChar_gen.json`, characterSkillParamDump)
//dump data file to respective character directory.
Object.entries(characterSkillParamDump).forEach(([characterKey, data]) =>
  dumpFile(`${path}/Characters/${characterKey}/skillParam.json`, data)
)

//dump data file to respective weapon directory.
const weaponDataDump = weaponData()
Object.entries(weaponDataDump).forEach(([weaponKey, data]) =>
  dumpFile(
    `${path}/Weapons/${
      data.weaponType[0].toUpperCase() + data.weaponType.slice(1)
    }/${weaponKey}/data.json`,
    data
  )
)
export type { WeaponData }

//exp curve to generate  stats at every level
dumpFile(`${path}/Weapons/expCurve.json`, weaponCurveExcelConfigData)
dumpFile(`${path}/Characters/expCurve.json`, avatarCurveExcelConfigData)

//dump artifact data
dumpFile(`${path}/Artifacts/artifact_sub.json`, artifactSubstatData)
dumpFile(`${path}/Artifacts/artifact_main.json`, artifactMainstatData)
dumpFile(`${path}/Artifacts/artifact_sub_rolls.json`, artifactSubstatRollData)
dumpFile(
  `${path}/Artifacts/artifact_sub_rolls_correction.json`,
  artifactSubstatRollCorrection
)

const materialDataDump = materialData()
dumpFile(`${path}/Materials/material.json`, materialDataDump)

export type AllStats = {
  char: {
    expCurve: CharacterExpCurveData
    skillParam: SkillParamData
    data: CharacterDatas
  }
  weapon: {
    expCurve: WeaponExpCurveData
    data: Record<WeaponKey, WeaponData>
  }
  art: {
    subRoll: any
    subRollCorrection: any
    main: any
    sub: any
  }
  material: any
}

const allStat: AllStats = {
  char: {
    expCurve: avatarCurveExcelConfigData,
    skillParam: characterSkillParamDump,
    data: characterDataDump,
  },
  weapon: {
    expCurve: weaponCurveExcelConfigData,
    data: weaponDataDump,
  },
  art: {
    subRoll: artifactSubstatRollData,
    subRollCorrection: artifactSubstatRollCorrection,
    main: artifactMainstatData,
    sub: artifactSubstatData,
  },
  material: materialDataDump,
}

dumpFile(
  `${process.env['NX_WORKSPACE_ROOT']}/libs/gi-stats/src/allStat_gen.json`,
  allStat
)
