import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { nameToKey } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type { CharacterData } from '@genshin-optimizer/zzz/dm'
import {
  charactersDetailedJSONData,
  filterUnbuffedKits,
} from '@genshin-optimizer/zzz/dm'
import { processText } from './util'

export function dumpChars(fileDir: string) {
  const charNames = {} as Record<CharacterKey, string>

  Object.entries(charactersDetailedJSONData).forEach(([charKey, charData]) => {
    charNames[charKey] = charData.name

    dumpFile(`${fileDir}/char_${charKey}_gen.json`, {
      name: charData.name,
      fullName: charData.fullname,
      ...getSkillStrings(charData.skills),
      core: getCoreStrings(charData.cores),
      ability: getAbilityStrings(charData.cores),
      mindscapes: getMindscapeStrings(charData.mindscapes),
      potential: getPotentialStrings(charData.potential),
    })
  })
  dumpFile(`${fileDir}/charNames_gen.json`, charNames)
}

function getSkillStrings(data: CharacterData['skills']) {
  const skillExceptions = new Set([
    'StanceJougen',
    'StanceKagen',
    'DashAttackTigerSevenFormsMountainKingsGameMomentum',
    'BasicAttackFallingPetalsDownfallFirstForm',
    'BasicAttackFallingPetalsDownfallSecondForm',
    'ChasingThunder',
  ])
  return Object.fromEntries(
    Object.entries(data).map(([key, skill]) => [
      `${key.charAt(0).toLowerCase()}${key.slice(1)}`,
      Object.fromEntries(
        skill.Description.filter(
          (ability) =>
            !!ability.Desc || skillExceptions.has(nameToKey(ability.Name))
        )
          .filter(filterUnbuffedKits)
          .map((ability) => {
            return [
              nameToKey(ability.Name),
              {
                name: ability.Name,
                desc: processText(ability.Desc || ''),
                // Copy param text by iterating again and finding the param details
                params: skill.Description.filter(
                  (ability2) =>
                    ability2.Name === ability.Name && !!ability2.Param
                )
                  .filter(filterUnbuffedKits)
                  .flatMap((ability2) => [
                    ...new Set(
                      ability2.Param!.map((param) =>
                        processParamText(param.Name)
                      )
                    ),
                  ]),
              },
            ]
          })
      ),
    ])
  )
}

function processParamText(text: string) {
  return text.replace(/\s*(DMG Multiplier|Daze Multiplier)/, '').trim() + ' '
}

function getCoreStrings(data: CharacterData['cores']) {
  return {
    name: Object.values(data.Level).filter(filterUnbuffedKits)[1].Name[0],
    desc: Object.values(data.Level)
      .filter(filterUnbuffedKits)
      .map((level) => processText(level.Desc[0])),
  }
}

function getAbilityStrings(data: CharacterData['cores']) {
  return {
    name: Object.values(data.Level).filter(filterUnbuffedKits)[1].Name[1],
    desc: processText(
      Object.values(data.Level).filter(filterUnbuffedKits)[1].Desc[1]
    ),
  }
}

function getMindscapeStrings(data: CharacterData['mindscapes']) {
  return Object.fromEntries(
    Object.values(data).map((ms) => [
      ms.Level,
      {
        name: ms.Name,
        desc: processText(ms.Desc),
        flavor: processText(ms.Desc2),
      },
    ])
  )
}

function getPotentialStrings(data: CharacterData['potential']) {
  if (Object.keys(data).length === 0) {
    return {}
  }
  return {
    name: Object.values(data).filter((_, i) => i > 0)[0].Name,
    desc: Object.values(data).map((pot) => processText(pot.Desc)),
  }
}
