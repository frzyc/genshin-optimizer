import type { Language } from '@genshin-optimizer/common/pipeline'
import { dumpFile, nameToKey } from '@genshin-optimizer/common/pipeline'
import { crawlObject, layeredAssignment } from '@genshin-optimizer/common/util'
import type {
  ElementKey,
  LocationGenderedCharacterKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { allGenderKeys } from '@genshin-optimizer/gi/consts'
import type { AvatarSkillDepotExcelConfigData } from '@genshin-optimizer/gi/dm'
import {
  TextMapEN,
  artifactIdMap,
  artifactSlotMap,
  avatarExcelConfigData,
  avatarSkillDepotExcelConfigData,
  avatarSkillExcelConfigData,
  avatarTalentExcelConfigData,
  characterIdMap,
  equipAffixExcelConfigData,
  fetterInfoExcelConfigData,
  languageMap,
  materialExcelConfigData,
  proudSkillExcelConfigData,
  reliquaryExcelConfigData,
  reliquarySetExcelConfigData,
  weaponExcelConfigData,
  weaponIdMap,
} from '@genshin-optimizer/gi/dm'
import { mapHashData, mapHashDataOverride } from './lib/Data'
import { parsingFunctions, preprocess } from './lib/parseUtil'
import type { GenLocaleExecutorSchema } from './schema'

export default async function runExecutor(_options: GenLocaleExecutorSchema) {
  //generate the MapHashes for localization for characters
  Object.entries(avatarExcelConfigData).forEach(([charid, charData]) => {
    const {
      nameTextMapHash,
      descTextMapHash,
      skillDepotId,
      candSkillDepotIds,
    } = charData
    const { avatarTitleTextMapHash, avatarConstellationBeforTextMapHash } =
      fetterInfoExcelConfigData[charid]

    const charKey = characterIdMap[charid]
    mapHashData.charNames[charKey] = nameTextMapHash
    layeredAssignment(mapHashData, ['char', charKey, 'name'], nameTextMapHash)
    layeredAssignment(
      mapHashData,
      ['char', charKey, 'title'],
      avatarTitleTextMapHash
    )
    layeredAssignment(
      mapHashData,
      ['char', charKey, 'description'],
      descTextMapHash
    )
    // layeredAssignment(mapHashData, [...keys, "descriptionDetail"], avatarDetailTextMapHash)
    // Don't override constellation name if manually specified. For Zhongli
    !mapHashData.char[characterIdMap[charid]]?.['constellationName'] &&
      layeredAssignment(
        mapHashData,
        ['char', charKey, 'constellationName'],
        avatarConstellationBeforTextMapHash
      )
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
      layeredAssignment(
        mapHashData,
        [...keys, 'auto', 'name'],
        [avatarSkillExcelConfigData[normal].nameTextMapHash, 'autoName']
      )
      layeredAssignment(
        mapHashData,
        [...keys, 'auto', 'fields'],
        [avatarSkillExcelConfigData[normal].descTextMapHash, 'autoFields']
      )
      layeredAssignment(
        mapHashData,
        [...keys, 'auto', 'skillParams'],
        proudSkillExcelConfigData[
          avatarSkillExcelConfigData[normal].proudSkillGroupId
        ][0].paramDescList.map((id) => [id, 'skillParam'])
      )

      layeredAssignment(
        mapHashData,
        [...keys, 'skill', 'name'],
        avatarSkillExcelConfigData[skill].nameTextMapHash
      )
      layeredAssignment(
        mapHashData,
        [...keys, 'skill', 'description'],
        [avatarSkillExcelConfigData[skill].descTextMapHash, 'paragraph']
      )
      layeredAssignment(
        mapHashData,
        [...keys, 'skill', 'skillParams'],
        proudSkillExcelConfigData[
          avatarSkillExcelConfigData[skill].proudSkillGroupId
        ][0].paramDescList.map((id) => [id, 'skillParam'])
      )

      layeredAssignment(
        mapHashData,
        [...keys, 'burst', 'name'],
        avatarSkillExcelConfigData[burst].nameTextMapHash
      )
      layeredAssignment(
        mapHashData,
        [...keys, 'burst', 'description'],
        [avatarSkillExcelConfigData[burst].descTextMapHash, 'paragraph']
      )
      layeredAssignment(
        mapHashData,
        [...keys, 'burst', 'skillParams'],
        proudSkillExcelConfigData[
          avatarSkillExcelConfigData[burst].proudSkillGroupId
        ][0].paramDescList.map((id) => [id, 'skillParam'])
      )

      if (sprint) {
        layeredAssignment(
          mapHashData,
          [...keys, 'sprint', 'name'],
          avatarSkillExcelConfigData[sprint].nameTextMapHash
        )
        layeredAssignment(
          mapHashData,
          [...keys, 'sprint', 'description'],
          [avatarSkillExcelConfigData[sprint].descTextMapHash, 'paragraph']
        )
      }

      passive1.proudSkillGroupId &&
        layeredAssignment(
          mapHashData,
          [...keys, 'passive1', 'name'],
          proudSkillExcelConfigData[passive1.proudSkillGroupId][0]
            .nameTextMapHash
        )
      passive1.proudSkillGroupId &&
        layeredAssignment(
          mapHashData,
          [...keys, 'passive1', 'description'],
          [
            proudSkillExcelConfigData[passive1.proudSkillGroupId][0]
              .descTextMapHash,
            'paragraph',
          ]
        )

      passive2.proudSkillGroupId &&
        layeredAssignment(
          mapHashData,
          [...keys, 'passive2', 'name'],
          proudSkillExcelConfigData[passive2.proudSkillGroupId][0]
            .nameTextMapHash
        )
      passive2.proudSkillGroupId &&
        layeredAssignment(
          mapHashData,
          [...keys, 'passive2', 'description'],
          [
            proudSkillExcelConfigData[passive2.proudSkillGroupId][0]
              .descTextMapHash,
            'paragraph',
          ]
        )

      if (passive3?.proudSkillGroupId) {
        layeredAssignment(
          mapHashData,
          [...keys, 'passive3', 'name'],
          proudSkillExcelConfigData[passive3.proudSkillGroupId][0]
            .nameTextMapHash
        )
        layeredAssignment(
          mapHashData,
          [...keys, 'passive3', 'description'],
          [
            proudSkillExcelConfigData[passive3.proudSkillGroupId][0]
              .descTextMapHash,
            'paragraph',
          ]
        )
      }
      //seems to be only used by SangonomiyaKokomi
      if (passive?.proudSkillGroupId) {
        layeredAssignment(
          mapHashData,
          [...keys, 'passive', 'name'],
          proudSkillExcelConfigData[passive.proudSkillGroupId][0]
            .nameTextMapHash
        )
        layeredAssignment(
          mapHashData,
          [...keys, 'passive', 'description'],
          [
            proudSkillExcelConfigData[passive.proudSkillGroupId][0]
              .descTextMapHash,
            'paragraph',
          ]
        )
      }

      talents.forEach((skId, i) => {
        layeredAssignment(
          mapHashData,
          [...keys, `constellation${i + 1}`, 'name'],
          avatarTalentExcelConfigData[skId].nameTextMapHash
        )
        layeredAssignment(
          mapHashData,
          [...keys, `constellation${i + 1}`, 'description'],
          [avatarTalentExcelConfigData[skId].descTextMapHash, 'paragraph']
        )
      })
    }

    if (candSkillDepotIds.length) {
      //Traveler
      const [_1, _2, hydro, anemo, _5, geo, electro, dendro] = candSkillDepotIds
      const gender = characterIdMap[charid] === 'TravelerF' ? 'F' : 'M'
      genTalentHash(
        ['char', 'TravelerAnemo' + gender],
        avatarSkillDepotExcelConfigData[anemo]
      )
      genTalentHash(
        ['char', 'TravelerGeo' + gender],
        avatarSkillDepotExcelConfigData[geo]
      )
      genTalentHash(
        ['char', 'TravelerElectro' + gender],
        avatarSkillDepotExcelConfigData[electro]
      )
      genTalentHash(
        ['char', 'TravelerDendro' + gender],
        avatarSkillDepotExcelConfigData[dendro]
      )
      genTalentHash(
        ['char', 'TravelerHydro' + gender],
        avatarSkillDepotExcelConfigData[hydro]
      )
    } else {
      genTalentHash(
        ['char', charKey],
        avatarSkillDepotExcelConfigData[skillDepotId]
      )
    }
  })

  //generate the MapHashes for localization for artifacts
  Object.entries(reliquarySetExcelConfigData).forEach(([setId, data]) => {
    const { EquipAffixId, setNeedNum, containsList } = data
    if (!EquipAffixId) return

    const setEffects = Object.fromEntries(
      setNeedNum.map((setNeed, i) => {
        const equipAffixData = equipAffixExcelConfigData[EquipAffixId]?.[i]
        if (!equipAffixData)
          throw `No data for EquipAffixId ${EquipAffixId} for setEffect ${setNeed}`
        return [setNeed, equipAffixData.descTextMapHash]
      })
    )

    const pieces = Object.fromEntries(
      containsList.map((pieceId) => {
        const pieceData = reliquaryExcelConfigData[pieceId]
        if (!pieceData)
          throw `No piece data with id ${pieceId} in setId ${setId}`
        const { equipType, nameTextMapHash, descTextMapHash } = pieceData
        return [
          artifactSlotMap[equipType],
          {
            name: nameTextMapHash,
            desc: descTextMapHash,
          },
        ]
      })
    )

    const setName =
      equipAffixExcelConfigData[EquipAffixId]?.[0]?.nameTextMapHash

    mapHashData.artifactNames[artifactIdMap[setId]] = setName
    mapHashData.artifact[artifactIdMap[setId]] = {
      setName,
      setEffects,
      pieces,
    }
  })

  //generate the MapHashes for localization for weapons
  Object.entries(weaponExcelConfigData).forEach(([weaponid, weaponData]) => {
    const { nameTextMapHash, descTextMapHash, skillAffix } = weaponData
    const [ascensionDataId] = skillAffix
    const ascData =
      ascensionDataId && equipAffixExcelConfigData[ascensionDataId]
    const weaponKey = weaponIdMap[weaponid]

    mapHashData.weaponNames[weaponKey] = nameTextMapHash
    mapHashData.weapon[weaponKey] = {
      name: nameTextMapHash,
      description: [descTextMapHash, 'paragraph'],
      passiveName: ascData ? ascData[0].nameTextMapHash : 0,
      passiveDescription: ascData
        ? ascData.map(
            (asc) => [asc.descTextMapHash, 'paragraph'] as [number, string]
          )
        : [0, 0, 0, 0, 0],
    }
  })

  //generate the MapHashes for localization for materials

  Object.entries(materialExcelConfigData).forEach(([_id, material]) => {
    const { nameTextMapHash, descTextMapHash } = material
    const key = nameToKey(TextMapEN[nameTextMapHash])
    if (!key || mapHashData.material[key]) return
    mapHashData.material[key] = {
      name: nameTextMapHash,
      description: [descTextMapHash, 'paragraph'],
    }
  })

  // Override
  mapHashDataOverride()

  //Main localization dumping
  const languageData = {} as Record<
    Language,
    {
      charNames: Record<LocationGenderedCharacterKey, string>
      weaponNames: Record<WeaponKey, string>
      sheet: {
        element: Record<ElementKey, string>
      }
    }
  >
  Object.entries(languageMap).forEach(([lang, langStrings]) => {
    crawlObject(
      mapHashData,
      [],
      (v) =>
        typeof v === 'number' ||
        (Array.isArray(v) &&
          v?.length === 2 &&
          typeof v[0] === 'number' &&
          typeof v[1] === 'string'),
      (value: number | [id: number, processing: string], keys) => {
        // const [type, characterKey, skill, field] = keys
        if (value === 0) layeredAssignment(languageData, [lang, ...keys], '')
        if (typeof value === 'number') value = [value, 'string']
        const [stringID, processing] = value
        let rawString = langStrings[stringID]

        //manually fix bad strings that breaks pipeline, seem to be only in russian translations
        if (
          processing === 'autoFields' &&
          lang === 'ru' &&
          rawString.split('\\n\\n').length === 2
        ) {
          const ind = rawString.indexOf('n<color=#FFD780FF>') + 1
          rawString = rawString.slice(0, ind) + '\\n' + rawString.slice(ind)
        }
        const string = parsingFunctions[processing](
          lang as Language,
          preprocess(rawString),
          keys
        )
        if (string === undefined)
          throw `Invalid string in ${keys}, for lang:${lang} (${stringID}:${processing})`
        layeredAssignment(languageData, [lang, ...keys], string)
      }
    )

    // Add the traveler variants to charNames_gen
    allGenderKeys.forEach((gender) => {
      ;(['Anemo', 'Geo', 'Electro', 'Dendro'] as const).forEach((ele) => {
        const transLocGenKey =
          languageData[lang as Language].charNames[
            `Traveler${gender}` as LocationGenderedCharacterKey
          ]
        const transEleKey =
          languageData[lang as Language].sheet.element[
            ele.toLowerCase() as ElementKey
          ]
        layeredAssignment(
          languageData,
          [lang, 'charNames', `Traveler${ele}${gender}`],
          `${transLocGenKey} (${transEleKey})`
        )
      })
    })

    // Add the Somnia and QuantumCatalyst
    languageData[lang as Language].charNames['Somnia'] = 'Somnia'
    languageData[lang as Language].weaponNames['QuantumCatalyst'] =
      'Quantum Cat-alyst'
  })

  //dump the language data to files
  Object.entries(languageData).forEach(([lang, data]) => {
    const fileDir = `${process.env['NX_WORKSPACE_ROOT']}/libs/gi/dm-localization/assets/locales/${lang}`

    Object.entries(data).forEach(([type, typeData]) => {
      //general manual localization namespaces
      if (
        [
          'sheet',
          'weaponKey',
          'elementalResonance',
          'material',
          'charNames',
          'weaponNames',
          'artifactNames',
          'statKey',
        ].includes(type)
      )
        return dumpFile(`${fileDir}/${type}_gen.json`, typeData)

      //weapons/characters/artifacts
      Object.entries(typeData as any).forEach(([itemKey, data]) =>
        dumpFile(`${fileDir}/${type}_${itemKey}_gen.json`, data)
      )
    })
  })
  return { success: true }
}
