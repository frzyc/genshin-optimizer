import {
  artifactMainstatData,
  artifactSubstatData,
  artifactSubstatRollCorrection,
  artifactSubstatRollData,
} from '@genshin-optimizer/dm'
import { dumpFile } from '@genshin-optimizer/pipeline'
import { workspaceRoot } from '@nx/devkit'
import type { GenStatsExecutorSchema } from './schema'
import artifactData from './src/artifactData'
import type { CharacterDataGen } from './src/characterData'
import characterData from './src/characterData'
import characterSkillParam from './src/characterSkillParam'
import { charExpCurve, weaponExpCurve } from './src/curves'
import materialData from './src/materialData'
import type { WeaponDataGen } from './src/weaponData'
import weaponData from './src/weaponData'

export type { CharacterDataGen, WeaponDataGen as WeaponData, WeaponDataGen }

const proj_path = `${workspaceRoot}/libs/gi-stats`
const path = `${proj_path}/Data`

const characterDataDump = characterData()
const characterSkillParamDump = characterSkillParam()
const weaponDataDump = weaponData()
const artifactDataDump = artifactData()
const materialDataDump = materialData()

const allStat = {
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
    data: artifactDataDump,
    subRoll: artifactSubstatRollData,
    subRollCorrection: artifactSubstatRollCorrection,
    main: artifactMainstatData,
    sub: artifactSubstatData,
  },
  material: materialDataDump,
} as const

export type AllStats = typeof allStat

export default async function runExecutor(options: GenStatsExecutorSchema) {
  console.log('Writing basic character data')
  Object.entries(characterDataDump).forEach(([characterKey, data]) =>
    dumpFile(`${path}/Characters/${characterKey}/data.json`, data)
  )

  // dumpFile(`${__dirname}/allChar_gen.json`, characterSkillParamDump)
  console.log('Writing weapon data')
  Object.entries(weaponDataDump).forEach(([weaponKey, data]) =>
    dumpFile(
      `${path}/Weapons/${
        data.weaponType[0].toUpperCase() + data.weaponType.slice(1)
      }/${weaponKey}/data.json`,
      data
    )
  )

  console.log('Writing character data')
  Object.entries(characterSkillParamDump).forEach(([characterKey, data]) =>
    dumpFile(`${path}/Characters/${characterKey}/skillParam.json`, data)
  )

  console.log('Writing exp curves')
  dumpFile(`${path}/Weapons/expCurve.json`, weaponExpCurve)
  dumpFile(`${path}/Characters/expCurve.json`, charExpCurve)

  console.log('Writing artifact data')
  dumpFile(`${path}/Artifacts/artifact_set.json`, artifactDataDump)
  dumpFile(`${path}/Artifacts/artifact_sub.json`, artifactSubstatData)
  dumpFile(`${path}/Artifacts/artifact_main.json`, artifactMainstatData)
  dumpFile(`${path}/Artifacts/artifact_sub_rolls.json`, artifactSubstatRollData)
  dumpFile(
    `${path}/Artifacts/artifact_sub_rolls_correction.json`,
    artifactSubstatRollCorrection
  )

  console.log('Writing material data')
  dumpFile(`${path}/Materials/material.json`, materialDataDump)

  console.log('Writing all data')
  dumpFile(`${proj_path}/src/allStat_gen.json`, allStat)

  return { success: true }
}
