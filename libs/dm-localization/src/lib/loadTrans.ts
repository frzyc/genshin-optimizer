import type { AvatarSkillDepotExcelConfigData } from '@genshin-optimizer/dm'
import {
  artifactPiecesData,
  avatarExcelConfigData,
  avatarSkillDepotExcelConfigData,
  avatarSkillExcelConfigData,
  avatarTalentExcelConfigData,
  equipAffixExcelConfigData,
  fetterInfoExcelConfigData,
  languageMap,
  materialExcelConfigData,
  nameToKey,
  proudSkillExcelConfigData,
  reliquarySetExcelConfigData,
  TextMapEN,
  weaponExcelConfigData,
} from '@genshin-optimizer/dm'
import type { Language } from '@genshin-optimizer/pipeline'
import {
  artifactIdMap,
  artifactSlotMap,
  characterIdMap,
  dumpFile,
  weaponIdMap,
} from '@genshin-optimizer/pipeline'
import { crawlObject, layeredAssignment } from '@genshin-optimizer/util'
import { existsSync, mkdirSync } from 'fs'
import { mapHashData, mapHashDataOverride } from './Data'
import { parsingFunctions, preprocess } from './parseUtil'

export default function loadTrans() {
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
    !mapHashData.char[characterIdMap[charid]].constellationName &&
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
      const [_1, _2, _3, anemo, _5, geo, electro, dendro] = candSkillDepotIds
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
        const pieceData = artifactPiecesData[pieceId]
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

    mapHashData.weaponNames[weaponIdMap[weaponid]] = nameTextMapHash
    mapHashData.weapon[weaponIdMap[weaponid]] = {
      name: nameTextMapHash,
      description: descTextMapHash,
      passiveName: ascData ? ascData[0].nameTextMapHash : 0,
      passiveDescription: ascData
        ? ascData.map((asc) => asc.descTextMapHash)
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
      description: descTextMapHash,
    }
  })

  // Override
  mapHashDataOverride()

  //Main localization dumping
  const languageData = {} as object
  Object.entries(languageMap).forEach(([lang, langStrings]) => {
    crawlObject(
      mapHashData,
      [],
      (v) =>
        typeof v === 'number' ||
        (v?.length === 2 &&
          Array.isArray(v) &&
          typeof v[0] === 'number' &&
          typeof v[1] === 'string'),
      (value, keys) => {
        // const [type, characterKey, skill, field] = keys
        if (value === 0)
          return layeredAssignment(languageData, [lang, ...keys], '')
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
    ;['F', 'M'].forEach((gender: string) => {
      ;['Anemo', 'Geo', 'Electro', 'Dendro'].forEach((ele: string) => {
        layeredAssignment(
          languageData,
          [lang, 'charNames', `Traveler${ele}${gender}`],
          `${languageData[lang].charNames[`Traveler${gender}`]} (${
            languageData[lang].sheet.element[ele.toLowerCase()]
          })`
        )
      })
    })
  })

  //dump the language data to files
  Object.entries(languageData).forEach(([lang, data]) => {
    const fileDir = `${__dirname}/../../assets/locales/${lang}`
    if (!existsSync(fileDir)) mkdirSync(fileDir, { recursive: true })

    Object.entries(data).forEach(([type, typeData]) => {
      //general manual localiation namespaces
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

  // Dump Nekara
  const nekara = {
    name: 'Nekara',
    title: 'Creation of Simulated Cognition',
    description:
      'A combination of an array of concepts. She exists in a variety of states and phases. Is she even real?',
    constellationName: 'Mathematica Felina',
    auto: {
      name: 'Astral Abacus',
      fields: {
        normal: {
          '0': '<strong><strong>Normal Attack</strong>',
          '1': 'Performs up to 4 consecutive attacks, launching beads that deal <electro>Electro DMG</electro> from her Astral Abacus.',
        },
        charged: {
          '0': '<strong>Charged Attack</strong>',
          '1': 'Consumes a certain amount of Stamina to charge and unleash a continuous stream of Electro beads, dealing <electro>Electro DMG</electro> to up to 4 targets every 0.3s',
          '2': 'Nekara gains resistance to interruption and is free to move while using her Charged Attack.',
        },
        plunging: {
          '0': '<strong>Plunging Attack</strong>',
          '1': 'Fires Electro beads at the ground, dealing <electro>AoE Electro DMG</electro> upon impact.',
        },
      },
      skillParams: {
        '0': '1-Hit DMG',
        '1': '2-Hit DMG',
        '2': '3-Hit DMG',
        '3': '4-Hit DMG',
        '4': 'Charged Attack Stream DMG',
        '5': 'Charged Attack Stamina Cost',
        '6': 'Plunge DMG',
        '7': 'Low/High Plunge DMG',
        '8': '',
        '9': '',
        '10': '',
        '11': '',
        '12': '',
        '13': '',
        '14': '',
        '15': '',
      },
    },
    skill: {
      name: 'Cosmic Calculator',
      description: {
        '0': 'Nekara condenses immense energy from her Astral Abacus to create an explosion that deals <electro>AoE Electro DMG</electro> and create a Self-Containing Sigil with undefinable contents above her head.',
        '1': 'The Self-Containing Sigil grants her the Schrödinger Superposition effect.',
        '2': '<br/>',
        '3': '<strong>Schrödinger Superposition</strong>',
        '4': "DMG dealt by Nekara's Normal and Charged Attacks is increased based on her Elemental Mastery.",
        '5': "Schrödinger Superposition expires after Self-Containing Sigil's duration ends or when Nekara leaves the field.",
      },
      skillParams: {
        '0': 'Skill DMG',
        '1': 'Duration',
        '2': 'CD',
        '3': '',
        '4': '',
        '5': '',
        '6': '',
        '7': '',
        '8': '',
        '9': '',
        '10': '',
        '11': '',
        '12': '',
        '13': '',
        '14': '',
        '15': '',
      },
    },
    burst: {
      name: 'Parallax Paws',
      description: {
        '0': 'Nekara summons a star-shaped Celestial Cyclone around her, unleashing a burst of <electro>Electro DMG</electro> as it expands. The field will linger and deal continuous <electro>AoE Electro DMG</electro> to enemies within every 1s.',
        '1': "While Celestial Cyclone is active, Nekara's Elemental Mastery will be increased multiplicatively.",
        '2': 'Additionally, while Celestial Cyclone is active, Nekara gains Stellar Statistics. While in this state, Nekara can set her Astral Abacus to the Multiplication, Addition or Subtraction modes, each granting her attacks and Celestial Cyclone different buffs. Only one Abacus mode from Stellar Statistics may be active simulatenously.',
        '3': '<br/>',
        '4': '<strong>Stellar Statistics</strong>',
        '5': [
          "<strong>Multiplication</strong>: Within Nekara's Celestial Cyclone, all Sword-, Claymore- and Polearm-wielding characters' weapons will be infused with <electro>Electro</electro>. Normal or Charged Attack hits within the field will trigger Star Sunder, a coordinated Electro blast that deals <electro>AoE Electro DMG</electro> based on Nekara's Elemental Mastery. Star Sunder can be triggered once every 1.5s.",
          "<strong>Addition</strong>: Celestial Cyclone's AoE and DMG are increased. Upon hitting an enemy, Nekara's Normal and Charged attacks will trigger a Supernova that deals <electro>AoE Electro DMG</electro> based on her Elemental Mastery. This effect can be triggered once every 0.75s.",
          '<strong>Subtraction</strong>: Celestial Cyclone has its AoE and DMG reduced, but applies the "Less Than Three" effect to enemies within it. "Less Than Three" reduces enemy Elemental and Physical RES based on Nekara\'s Elemental Mastery. Additionally, Nekara\'s Normal and Charged Attacks deal increased DMG based on her Elemental Mastery.',
        ],
      },
      skillParams: {
        '0': 'Skill DMG',
        '1': 'Elemental Mastery',
        '2': 'Celestial Cyclone DoT (Multiplication)',
        '3': 'Star Sunder DMG',
        '4': 'Celestial Cyclone DoT (Addition)',
        '5': 'Supernova DMG',
        '6': 'Celestial Cyclone DoT (Subtraction)',
        '7': '',
        '8': '',
        '9': '',
        '10': '',
        '11': '',
        '12': '',
        '13': '',
        '14': '',
        '15': '',
      },
    },
    passive1: {
      name: 'Quick Calculation',
      description: {
        '0': "Nekara's Charged Attacks consume 20% less Stamina and charge up 20% faster",
      },
    },
    passive2: {
      name: 'Math Whiz',
      description: {
        '0': "For the duration of Celestial Cyclone, Nekara's Elemental Mastery increases by 5% for every hit dealt by Celestial Cyclone, Star Sunder and Supernova, up to a maximum of 25%.",
      },
    },
    passive3: {
      name: 'Insomniac Iteration',
      description: {
        '0': 'At night (18:00 - 6:00), speeds up Genshin Optimizer build speed by 10%.',
      },
    },
    constellation1: {
      name: 'Decimal Point',
      description: {
        '0': "Nekara's Normal and Charged Attacks have a 25% chance to deal twice the DMG",
      },
    },
    constellation2: {
      name: 'Prime Number',
      description: {
        '0': 'When Nekara is under the Schrödinger Superposition effect, each Normal or Charged Attack hit will give Nekara a stack of Natural Number. When the amount of Natural Number stacks is prime, Nekara\'s next Normal or Charged Attack will receive twice the DMG increase from Schrödinger Superposition.',
      },
    },
    constellation3: {
      name: 'Infinite Series',
      description: {
        '0': 'Increases the Level of <strong>Parallax Paws</strong> by 3.',
        '1': 'Maximum upgrade level is 15.',
      },
    },
    constellation4: {
      name: 'Perfect Square',
      description: {
        '0': 'When Nekara triggers an Electro reaction, 4 Elemental Energy is restored to herself and all nearby party members of Elements involved in the reaction.',
        '1': 'This effect can trigger once every 4s.',
      },
    },
    constellation5: {
      name: 'The Leaves of Enlightening Speech',
      description: {
        '0': 'Increases the Level of <strong>Cosmic Calculator</strong> by 3.',
        '1': 'Maximum upgrade level is 15.',
      },
    },
    constellation6: {
      name: 'Golden Ratio',
      description: {
        '0': 'Upon dealing DMG from her Charged Attack increases her CRIT Rate and CRIT DMG by 3% and 5% respectively. This effect can be triggered once every 0.2s and stack up to 8 times. All Golden Ratio stacks are cleared 13s after the first stack was obtained.',
      },
    },
  }
  dumpFile(`${__dirname}/../../assets/locales/en/char_Nekara_gen.json`, nekara)

  // Dump Quantum Cat-alyst
  const quant = {
    name: 'Quantum Cat-alyst',
    description:
      'This advanced Catalyst weapon is infused with the mysterious power of Quantum Mechanics and bears the likeness of a curious cat, with glowing green eyes, a tail that flickers with Electro energy and the occasional spark arcing between the ears.',
    passiveName: 'Boundless Blessing',
    passiveDescription: {
      '0': 'Increases Energy Recharge by <cryo>18%</cryo>. Increases Normal and Charged Attack DMG by <cryo>6%</cryo> of Elemental Mastery. Upon triggering an <electro>Electro-related Elemental Reaction</electro>, gain <cryo>10</cryo> Elemental Mastery for 12 seconds. This effect can stack up to 5 times and stacks have their duration counted independently.',
      '1': 'Increases Energy Recharge by <cryo>22.5%</cryo>. Increases Normal and Charged Attack DMG by <cryo>7.5%</cryo> of Elemental Mastery. Upon triggering an <electro>Electro-related Elemental Reaction</electro>, gain <cryo>12</cryo> Elemental Mastery for 12 seconds. This effect can stack up to 5 times and stacks have their duration counted independently.',
      '2': 'Increases Energy Recharge by <cryo>27%</cryo>. Increases Normal and Charged Attack DMG by <cryo>9%</cryo> of Elemental Mastery. Upon triggering an <electro>Electro-related Elemental Reaction</electro>, gain <cryo>14</cryo> Elemental Mastery for 12 seconds. This effect can stack up to 5 times and stacks have their duration counted independently.',
      '3': 'Increases Energy Recharge by <cryo>31.5%</cryo>. Increases Normal and Charged Attack DMG by <cryo>10.5%</cryo> of Elemental Mastery. Upon triggering an <electro>Electro-related Elemental Reaction</electro>, gain <cryo>16</cryo> Elemental Mastery for 12 seconds. This effect can stack up to 5 times and stacks have their duration counted independently.',
      '4': 'Increases Energy Recharge by <cryo>36%</cryo>. Increases Normal and Charged Attack DMG by <cryo>12%</cryo> of Elemental Mastery. Upon triggering an <electro>Electro-related Elemental Reaction</electro>, gain <cryo>18</cryo> Elemental Mastery for 12 seconds. This effect can stack up to 5 times and stacks have their duration counted independently.',
    },
  }
  dumpFile(
    `${__dirname}/../../assets/locales/en/weapon_QuantumCatalyst_gen.json`,
    quant
  )
}
