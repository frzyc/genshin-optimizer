import { dumpPrettyFile } from '@genshin-optimizer/common/pipeline'
import {
  artifactMainstatData,
  artifactSubstatData,
  artifactSubstatRollCorrection,
  artifactSubstatRollData,
} from '@genshin-optimizer/gi/dm'
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

export type { CharacterDataGen, WeaponDataGen }

const proj_path = `${workspaceRoot}/libs/gi/stats`
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

export default async function runExecutor(_options: GenStatsExecutorSchema) {
  const promises: Promise<any>[] = []
  console.log(`Writing basic character data to ${path}/Characters`)
  Object.entries(characterDataDump).forEach(([characterKey, data]) =>
    promises.push(
      dumpPrettyFile(`${path}/Characters/${characterKey}/data.json`, data)
    )
  )

  // dumpPrettyFile(`${__dirname}/allChar_gen.json`, characterSkillParamDump)
  console.log(`Writing weapon data to ${path}/Weapons`)
  Object.entries(weaponDataDump).forEach(([weaponKey, data]) =>
    promises.push(
      dumpPrettyFile(
        `${path}/Weapons/${
          data.weaponType[0].toUpperCase() + data.weaponType.slice(1)
        }/${weaponKey}/data.json`,
        data
      )
    )
  )
  promises.push(dumpPrettyFile(`${path}/Weapons/expCurve.json`, weaponExpCurve))

  console.log(`Writing character data to ${path}/Characters`)
  Object.entries(characterSkillParamDump).forEach(([characterKey, data]) =>
    promises.push(
      dumpPrettyFile(`${path}/Characters/${characterKey}/skillParam.json`, data)
    )
  )
  promises.push(
    dumpPrettyFile(`${path}/Characters/expCurve.json`, charExpCurve)
  )

  console.log(`Writing artifact data to ${path}/Artifacts`)
  promises.push(
    dumpPrettyFile(`${path}/Artifacts/artifact_set.json`, artifactDataDump)
  )
  promises.push(
    dumpPrettyFile(`${path}/Artifacts/artifact_sub.json`, artifactSubstatData)
  )
  promises.push(
    dumpPrettyFile(`${path}/Artifacts/artifact_main.json`, artifactMainstatData)
  )
  promises.push(
    dumpPrettyFile(
      `${path}/Artifacts/artifact_sub_rolls.json`,
      artifactSubstatRollData
    )
  )
  promises.push(
    dumpPrettyFile(
      `${path}/Artifacts/artifact_sub_rolls_correction.json`,
      artifactSubstatRollCorrection
    )
  )

  console.log(`Writing material data to ${path}/Materials`)
  promises.push(
    dumpPrettyFile(`${path}/Materials/material.json`, materialDataDump)
  )

  console.log(`Writing combined data to ${proj_path}/src/allStats_gen.json`)
  promises.push(dumpPrettyFile(`${proj_path}/src/allStat_gen.json`, allStat))

  await Promise.all(promises)

  return { success: true }
}
