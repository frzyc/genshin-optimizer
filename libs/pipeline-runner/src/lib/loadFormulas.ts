import type {
  CharacterKey,
  ElementKey,
  RegionKey,
  WeaponKey,
} from '@genshin-optimizer/consts'
import type {
  AvatarSkillDepotExcelConfigData,
  ProudSkillExcelConfigData,
} from '@genshin-optimizer/dm'
import {
  ascensionData,
  avatarCurveExcelConfigData,
  avatarExcelConfigData,
  avatarSkillDepotExcelConfigData,
  avatarSkillExcelConfigData,
  avatarTalentExcelConfigData,
  equipAffixExcelConfigData,
  fetterInfoExcelConfigData,
  proudSkillExcelConfigData,
  weaponCurveExcelConfigData,
  weaponExcelConfigData,
  weaponPromoteExcelConfigData,
} from '@genshin-optimizer/dm'
import type {
  CharacterData,
  CharacterGrowCurveKey,
  CharacterId,
  WeaponGrowCurveKey,
  WeaponTypeKey,
} from '@genshin-optimizer/pipeline'
import {
  characterIdMap,
  dumpFile,
  elementMap,
  extrapolateFloat,
  propTypeMap,
  regionMap,
  weaponIdMap,
  weaponMap,
} from '@genshin-optimizer/pipeline'
import { layeredAssignment } from '@genshin-optimizer/util'
import { FORMULA_PATH } from './Util'

type FormulaCharacterData = {
  charKey: CharacterKey
  ele?: ElementKey
  weaponType: WeaponTypeKey
  region?: RegionKey
  lvlCurves: { key: string; base: number; curve: CharacterGrowCurveKey }[]
  ascensionBonus: { key: string; values: number[] }[]
}
export type FormulaWeaponData = {
  weaponKey: WeaponKey
  weaponType: WeaponTypeKey
  lvlCurves: { key: string; base: number; curve: WeaponGrowCurveKey }[]
  refinementBonus: { key: string; values: number[] }[]
  ascensionBonus: { key: string; values: number[] }[]
}

export default function loadFormulas() {
  //parse baseStat/ascension/basic data
  const characterDataDump = Object.fromEntries(
    Object.entries(avatarExcelConfigData).map(([charid, charData]) => {
      const {
        weaponType,
        avatarPromoteId,
        hpBase,
        attackBase,
        defenseBase,
        propGrowCurves,
        skillDepotId,
      } = charData
      const curves = Object.fromEntries(
        propGrowCurves.map(({ type, growCurve }) => [
          propTypeMap[type],
          growCurve,
        ])
      ) as CharacterData['curves']
      const ascensions = ascensionData[avatarPromoteId]
      const ascensionKeys = new Set(
        ascensions.flatMap((a) => Object.keys(a.props))
      )
      const fetter = fetterInfoExcelConfigData[+charid as CharacterId]
      const skillDepot = avatarSkillDepotExcelConfigData[skillDepotId]
      const burstInfo = avatarSkillExcelConfigData[skillDepot.energySkill]
      const result: FormulaCharacterData = {
        charKey: characterIdMap[+charid], // Will be incorrect for traveler, oh well
        ele: burstInfo ? elementMap[burstInfo.costElemType] : undefined, // TODO: Traveler handling
        weaponType: weaponMap[weaponType],
        region: regionMap[fetter.avatarAssocType],
        lvlCurves: [
          { key: 'hp', base: hpBase, curve: curves.hp },
          { key: 'atk', base: attackBase, curve: curves.atk },
          { key: 'def', base: defenseBase, curve: curves.def },
        ],
        ascensionBonus: [...ascensionKeys].map((key) => ({
          key,
          values: ascensions.map((a) => a.props[key] ?? 0),
        })),
      }
      const charKey = characterIdMap[charid as unknown as CharacterId]
      return [charKey.startsWith('Traveler') ? 'Traveler' : charKey, result]
    })
  ) as Record<CharacterKey, FormulaCharacterData>

  //dump data file to respective character directory.
  Object.entries(characterDataDump).forEach(([characterKey, data]) =>
    dumpFile(`${FORMULA_PATH}/char/${characterKey}/data.gen.json`, data)
  )

  const characterSkillParamDump = {} as Record<CharacterKey, CharacterData>
  function genTalentHash(
    keys: string[],
    depot: AvatarSkillDepotExcelConfigData
  ) {
    const {
      energySkill: burst,
      skills: [normal, skill, sprint],
      talents,
      inherentProudSkillOpens: [passive1, passive2, passive3, , passive],
    } = depot

    function parseSkillParams(
      keys: string[],
      skillArr: ProudSkillExcelConfigData[]
    ) {
      const skillParamBase = skillArr.map((proud) => proud.paramList)

      //need to transpose the skillParam
      const skillParamUntrimmed: Array<Array<number>> = []
      skillParamBase.forEach((arr, i) => {
        arr.forEach((value, j) => {
          if (!skillParamUntrimmed[j]) skillParamUntrimmed[j] = []
          //The assumption is that any value >10 is a "flat" value that is not a percent.
          skillParamUntrimmed[j][i] = extrapolateFloat(value)
        })
      })
      //filter out empty entries
      const skillParam = skillParamUntrimmed.filter(
        (arr) => !arr.every((i) => !i)
      )
      layeredAssignment(characterSkillParamDump, keys, skillParam)
    }
    parseSkillParams(
      [...keys, 'auto'],
      proudSkillExcelConfigData[
        avatarSkillExcelConfigData[normal].proudSkillGroupId
      ]
    )

    parseSkillParams(
      [...keys, 'skill'],
      proudSkillExcelConfigData[
        avatarSkillExcelConfigData[skill].proudSkillGroupId
      ]
    )
    parseSkillParams(
      [...keys, 'burst'],
      proudSkillExcelConfigData[
        avatarSkillExcelConfigData[burst].proudSkillGroupId
      ]
    )

    if (sprint)
      parseSkillParams(
        [...keys, 'sprint'],
        proudSkillExcelConfigData[
          avatarSkillExcelConfigData[sprint].proudSkillGroupId
        ]
      )

    passive1.proudSkillGroupId &&
      parseSkillParams(
        [...keys, 'passive1'],
        proudSkillExcelConfigData[passive1.proudSkillGroupId]
      )
    passive2.proudSkillGroupId &&
      parseSkillParams(
        [...keys, 'passive2'],
        proudSkillExcelConfigData[passive2.proudSkillGroupId]
      )
    if (passive3?.proudSkillGroupId)
      parseSkillParams(
        [...keys, 'passive3'],
        proudSkillExcelConfigData[passive3.proudSkillGroupId]
      )
    //seems to be only used by sangonomiyaKokomi
    if (passive?.proudSkillGroupId)
      parseSkillParams(
        [...keys, 'passive'],
        proudSkillExcelConfigData[passive.proudSkillGroupId]
      )

    talents.forEach((skId, i) =>
      layeredAssignment(
        characterSkillParamDump,
        [...keys, `constellation${i + 1}`],
        avatarTalentExcelConfigData[skId].paramList
          .filter((i) => i)
          .map((value) => extrapolateFloat(value))
      )
    )
  }
  Object.entries(avatarExcelConfigData).forEach(([ci, charData]) => {
    const charid: CharacterId = ci as unknown as CharacterId
    const { candSkillDepotIds, skillDepotId } = charData

    if (candSkillDepotIds.length) {
      //Traveler
      const [, , , anemo, , geo, electro, dendro] = candSkillDepotIds
      const gender = characterIdMap[charid] === 'TravelerF' ? 'F' : 'M'
      genTalentHash(
        ['TravelerAnemo' + gender],
        avatarSkillDepotExcelConfigData[anemo]
      )
      genTalentHash(
        ['TravelerGeo' + gender],
        avatarSkillDepotExcelConfigData[geo]
      )
      genTalentHash(
        ['TravelerElectro' + gender],
        avatarSkillDepotExcelConfigData[electro]
      )
      genTalentHash(
        ['TravelerDendro' + gender],
        avatarSkillDepotExcelConfigData[dendro]
      )
    } else {
      genTalentHash(
        [characterIdMap[charid]],
        avatarSkillDepotExcelConfigData[skillDepotId]
      )
    }
  })
  //dump data file to respective character directory.
  Object.entries(characterSkillParamDump).forEach(([characterKey, data]) =>
    dumpFile(`${FORMULA_PATH}/char/${characterKey}/skillParam.gen.json`, data)
  )

  // TODO Update DM to export better structure so that we don't need to do this restructuring shenanigans
  const charExpCurve = Object.fromEntries(
    Object.entries(avatarCurveExcelConfigData).map(([k, v]) => {
      const result = [-1]
      Object.entries(v).forEach(([lvl, v]) => (result[+lvl] = v))
      return [k, result]
    })
  )
  dumpFile(`${FORMULA_PATH}/char/expCurve.gen.json`, charExpCurve)

  const weaponDataDump = Object.fromEntries(
    Object.entries(weaponExcelConfigData).map(([weaponid, weaponData]) => {
      const { weaponType, weaponProp, skillAffix, weaponPromoteId } = weaponData
      const [main, sub] = weaponProp
      const [refinementDataId] = skillAffix

      const refData = refinementDataId
        ? equipAffixExcelConfigData[refinementDataId]
        : []
      const refKeys = new Set(
        refData
          .filter((x) => x)
          .flatMap((ref) =>
            ref.addProps
              .filter((a) => a.value && a.propType)
              .map((p) => p.propType)
          )
      )

      const ascData = weaponPromoteExcelConfigData[weaponPromoteId]
      const ascKeys = new Set(
        ascData
          .filter((x): x is NonNullable<typeof x> => x != null)
          .flatMap((asc) =>
            asc.addProps
              .filter((a) => a.value && a.propType)
              .map((a) => a.propType)
          )
      )

      const result: FormulaWeaponData = {
        weaponKey: weaponIdMap[+weaponid],
        weaponType: weaponMap[weaponType],
        lvlCurves: [
          {
            key: propTypeMap[main.propType],
            base: extrapolateFloat(main.initValue),
            curve: main.type,
          },
          ...(sub.propType
            ? [
                {
                  key: propTypeMap[sub.propType],
                  base: extrapolateFloat(sub.initValue),
                  curve: sub.type,
                },
              ]
            : []),
        ],
        refinementBonus: [...refKeys].map((key) => ({
          key: propTypeMap[key],
          values: [
            -1,
            ...refData.map(
              (x) =>
                x.addProps.reduce(
                  (accu, x) =>
                    x.propType === key
                      ? accu + extrapolateFloat(x.value)
                      : accu,
                  0
                ) ?? 0
            ),
          ],
        })),
        ascensionBonus: [...ascKeys].map((key) => ({
          key: propTypeMap[key],
          values: ascData.map(
            (x) =>
              x?.addProps.reduce(
                (accu, x) =>
                  x.propType === key ? accu + extrapolateFloat(x.value) : accu,
                0
              ) ?? 0
          ),
        })),
      }
      return [weaponIdMap[weaponid], result]
    })
  ) as Record<WeaponKey, FormulaWeaponData>

  //dump data file to respective weapon directory.
  Object.entries(weaponDataDump).forEach(([weaponKey, data]) =>
    dumpFile(`${FORMULA_PATH}/weapon/${weaponKey}/data.gen.json`, data)
  )

  //exp curve to generate  stats at every level
  const weaponExpCurve = Object.fromEntries(
    Object.entries(weaponCurveExcelConfigData).map(([k, v]) => {
      const result = [-1]
      Object.entries(v).forEach(([lvl, v]) => (result[+lvl] = v))
      return [k, result]
    })
  )
  dumpFile(`${FORMULA_PATH}/weapon/expCurve.gen.json`, weaponExpCurve)
}
