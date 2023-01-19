import { ascensionData, avatarCurveExcelConfigData, avatarExcelConfigData, AvatarSkillDepotExcelConfigData, avatarSkillDepotExcelConfigData, avatarSkillExcelConfigData, avatarTalentExcelConfigData, fetterInfoExcelConfigData, ProudSkillExcelConfigData, proudSkillExcelConfigData } from '@genshin-optimizer/dm'
import { CharacterData, CharacterGrowCurveKey, CharacterId, characterIdMap, CharacterKey, dumpFile, extrapolateFloat, propTypeMap, QualityTypeMap, weaponMap, WeaponTypeKey } from '@genshin-optimizer/pipeline'
import { layeredAssignment } from '@genshin-optimizer/util'
import { FORMULA_PATH } from './Util'

type FormulaCharacterData = {
  weaponType: WeaponTypeKey
  lvlCurves: { [key: string]: { base: number, curve: CharacterGrowCurveKey } }
  ascensionBonus: { [key: string]: number[] }

  // Do we need this?
  star: 1 | 2 | 3 | 4 | 5,
  birthday: { month?: number, day?: number }
}

export default function loadFormulas() {
  //parse baseStat/ascension/basic data
  const characterDataDump = Object.fromEntries(Object.entries(avatarExcelConfigData).map(([charid, charData]) => {
    const { weaponType, qualityType, avatarPromoteId, hpBase, attackBase, defenseBase, propGrowCurves } = charData
    const curves = Object.fromEntries(propGrowCurves.map(({ type, growCurve }) => [propTypeMap[type], growCurve])) as CharacterData["curves"]
    const { infoBirthDay, infoBirthMonth, } = fetterInfoExcelConfigData[charid as any as keyof typeof fetterInfoExcelConfigData]
    const ascensions = ascensionData[avatarPromoteId]
    const ascensionKeys = new Set(ascensions.flatMap(a => Object.keys(a.props)))
    const result: FormulaCharacterData = {
      weaponType: weaponMap[weaponType],
      lvlCurves: {
        hp: { base: hpBase, curve: curves.hp },
        atk: { base: attackBase, curve: curves.atk },
        def: { base: defenseBase, curve: curves.def },
      },
      ascensionBonus: Object.fromEntries([...ascensionKeys].map(k => [k, ascensions.map(a => a.props[k]! ?? 0)])),
      star: QualityTypeMap[qualityType] ?? 5,
      birthday: { month: infoBirthMonth, day: infoBirthDay },
    }
    const charKey = characterIdMap[charid as unknown as CharacterId]
    return [charKey.startsWith("Traveler") ? "Traveler" : charKey, result]
  })) as Record<CharacterKey, FormulaCharacterData>

  //dump data file to respective character directory.
  Object.entries(characterDataDump).forEach(([characterKey, data]) =>
    dumpFile(`${FORMULA_PATH}/character/${characterKey}/data.gen.json`, data))

  const characterSkillParamDump = {} as Record<CharacterKey, CharacterData>
  function genTalentHash(keys: string[], depot: AvatarSkillDepotExcelConfigData) {
    const { energySkill: burst, skills: [normal, skill, sprint], talents, inherentProudSkillOpens: [passive1, passive2, passive3, , passive] } = depot

    function parseSkillParams(keys: string[], skillArr: ProudSkillExcelConfigData[]) {
      const skillParamBase = skillArr.map(proud => proud.paramList)

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
      const skillParam = skillParamUntrimmed.filter(arr => !arr.every(i => !i))
      layeredAssignment(characterSkillParamDump, keys, skillParam)
    }
    parseSkillParams([...keys, "auto"], proudSkillExcelConfigData[avatarSkillExcelConfigData[normal].proudSkillGroupId])

    parseSkillParams([...keys, "skill"], proudSkillExcelConfigData[avatarSkillExcelConfigData[skill].proudSkillGroupId])
    parseSkillParams([...keys, "burst"], proudSkillExcelConfigData[avatarSkillExcelConfigData[burst].proudSkillGroupId])

    if (sprint)
      parseSkillParams([...keys, "sprint"], proudSkillExcelConfigData[avatarSkillExcelConfigData[sprint].proudSkillGroupId])

    passive1.proudSkillGroupId && parseSkillParams([...keys, "passive1"], proudSkillExcelConfigData[passive1.proudSkillGroupId])
    passive2.proudSkillGroupId && parseSkillParams([...keys, "passive2"], proudSkillExcelConfigData[passive2.proudSkillGroupId])
    if (passive3?.proudSkillGroupId)
      parseSkillParams([...keys, "passive3"], proudSkillExcelConfigData[passive3.proudSkillGroupId])
    //seems to be only used by sangonomiyaKokomi
    if (passive?.proudSkillGroupId)
      parseSkillParams([...keys, "passive"], proudSkillExcelConfigData[passive.proudSkillGroupId])

    talents.forEach((skId, i) =>
      layeredAssignment(characterSkillParamDump, [...keys, `constellation${i + 1}`], avatarTalentExcelConfigData[skId].paramList.filter(i => i).map(value => extrapolateFloat(value))))
  }
  Object.entries(avatarExcelConfigData).forEach(([ci, charData]) => {
    const charid: CharacterId = ci as unknown as CharacterId
    const { candSkillDepotIds, skillDepotId } = charData

    if (candSkillDepotIds.length) { //Traveler
      const [_1, _2, _3, anemo, _5, geo, electro, dendro] = candSkillDepotIds
      const gender = characterIdMap[charid] === "TravelerF" ? "F" : "M"
      genTalentHash(["TravelerAnemo" + gender], avatarSkillDepotExcelConfigData[anemo])
      genTalentHash(["TravelerGeo" + gender], avatarSkillDepotExcelConfigData[geo])
      genTalentHash(["TravelerElectro" + gender], avatarSkillDepotExcelConfigData[electro])
      genTalentHash(["TravelerDendro" + gender], avatarSkillDepotExcelConfigData[dendro])
    } else {
      genTalentHash([characterIdMap[charid]], avatarSkillDepotExcelConfigData[skillDepotId])
    }
  })
  //dump data file to respective character directory.
  Object.entries(characterSkillParamDump).forEach(([characterKey, data]) =>
    dumpFile(`${FORMULA_PATH}/character/${characterKey}/skillParam.gen.json`, data))

  // TODO Update DM to export better structure so that we don't need to do this restructuring shenanigans
  const expCurve = Object.fromEntries(Object.entries(avatarCurveExcelConfigData).map(([k, v]) => {
    const result = [0]
    Object.entries(v).forEach(([lvl, v]) => result[+lvl] = v)
    return [k, result]
  }))
  dumpFile(`${FORMULA_PATH}/character/expCurve.gen.json`, expCurve)
}
