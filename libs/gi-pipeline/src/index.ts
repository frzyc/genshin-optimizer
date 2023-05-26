import type { WeaponKey } from '@genshin-optimizer/consts'
import {
  artifactMainstatData,
  artifactSubstatData,
  artifactSubstatRollCorrection,
  artifactSubstatRollData,
} from '@genshin-optimizer/dm'
import { dumpFile } from '@genshin-optimizer/pipeline'
import type { CharacterDataGen, CharacterDatas } from './characterData'
import characterData from './characterData'
import type { SkillParamData } from './characterSkillParam'
import characterSkillParam from './characterSkillParam'
import { charExpCurve, weaponExpCurve } from './curves'
import materialData from './materialData'
import type { WeaponDataGen } from './weaponData'
import weaponData from './weaponData'

export type { CharacterDataGen, WeaponDataGen }
export type { WeaponDataGen as WeaponData }

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

//exp curve to generate  stats at every level
dumpFile(`${path}/Weapons/expCurve.json`, weaponExpCurve)
dumpFile(`${path}/Characters/expCurve.json`, charExpCurve)

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
    expCurve: typeof charExpCurve
    skillParam: SkillParamData
    data: CharacterDatas
  }
  weapon: {
    expCurve: typeof weaponExpCurve
    data: Record<WeaponKey, WeaponDataGen>
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
    expCurve: charExpCurve,
    skillParam: characterSkillParamDump,
    data: characterDataDump,
  },
  weapon: {
    expCurve: weaponExpCurve,
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
