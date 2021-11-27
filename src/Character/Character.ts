import Artifact from "../Artifact/Artifact";
import { ArtifactSheet } from "../Artifact/ArtifactSheet";
import Conditional from "../Conditional/Conditional";
import { ascensionMaxLevel } from "../Data/LevelData";
import { ArtCharDatabase } from "../Database/Database";
import finalStatProcess from "../ProcessFormula";
import { Sheets } from "../ReactHooks/useSheets";
import { ElementToReactionKeys } from "../StatData";
import { ICachedArtifact, StatKey } from "../Types/artifact";
import { DocumentSection, ICachedCharacter } from "../Types/character";
import { ArtifactSetKey, SlotKey } from "../Types/consts";
import { IFieldDisplay } from "../Types/IFieldDisplay";
import { ICalculatedStats } from "../Types/stats";
import { characterBaseStats, mergeCalculatedStats, mergeStats, overrideStatKeys } from "../Util/StatUtil";
import { deepClone, evalIfFunc } from "../Util/Util";
import { defaultInitialWeapon } from "../Weapon/WeaponUtil";

export default class Character {
  //do not instantiate.
  constructor() { if (this instanceof Character) throw Error('A static class cannot be instantiated.'); }

  static getLevelString = (character: ICachedCharacter): string =>
    `${character.level}/${ascensionMaxLevel[character.ascension]}`

  static getTalentFieldValue = (field: IFieldDisplay, key: keyof IFieldDisplay, stats = {}, defVal = ""): any => {
    if (!field[key]) return defVal
    return evalIfFunc(field[key] as any, stats!)
  }

  static hasBonusStats = (character: ICachedCharacter, statKey): boolean => {
    if (statKey === "finalHP")
      return Character.hasBonusStats(character, "hp") || Character.hasBonusStats(character, "hp_") || Character.hasBonusStats(character, "characterHP")
    if (statKey === "finalDEF")
      return Character.hasBonusStats(character, "def") || Character.hasBonusStats(character, "def_") || Character.hasBonusStats(character, "characterDEF")
    if (statKey === "finalATK")
      return Character.hasBonusStats(character, "atk") || Character.hasBonusStats(character, "atk_") || Character.hasBonusStats(character, "characterATK")
    return character?.bonusStats ? (statKey in character.bonusStats) : false;
  }

  static getStatValueWithBonus = (character: ICachedCharacter, statKey: string) => {
    if (overrideStatKeys.includes(statKey))
      return character.bonusStats?.[statKey] ?? characterBaseStats(character)[statKey] ?? 0
    else
      return character.bonusStats?.[statKey] ?? 0
  }

  static calculateBuild = (character: ICachedCharacter, database: ArtCharDatabase, sheets: Sheets, mainStatAssumptionLevel = 0): ICalculatedStats => {
    const initialStats = this.calculatePreBuild(character, database, sheets, mainStatAssumptionLevel)
    return finalStatProcess(initialStats)
  }
  static calculatePreBuild = (character: ICachedCharacter, database: ArtCharDatabase, sheets: Sheets, mainStatAssumptionLevel = 0): ICalculatedStats => {
    const artifacts = Object.fromEntries(Object.entries(character.equippedArtifacts).map(([key, artid]) => [key, database._getArt(artid)]))
    const initialStats = Character.createInitialStats(character, database, sheets)
    initialStats.mainStatAssumptionLevel = mainStatAssumptionLevel
    Character.calculateBuildwithArtifact(initialStats, artifacts, sheets.artifactSheets)
    return initialStats
  }

  static calculateBuildwithArtifact = (stats: ICalculatedStats, artifacts: Dict<SlotKey, ICachedArtifact>, artifactSheets: StrictDict<ArtifactSetKey, ArtifactSheet>): ICalculatedStats => {
    const setToSlots = Artifact.setToSlots(artifacts)
    const artifactSetEffectsStats = ArtifactSheet.setEffectsStats(artifactSheets, stats, setToSlots)
    stats.equippedArtifacts = Object.fromEntries(Object.entries(artifacts).map(([key, val]: any) => [key, val?.id]))
    stats.setToSlots = setToSlots
    //add artifact and artifactsets
    Object.values(artifacts).forEach(art => {
      if (!art) return
      //main stats
      stats[art.mainStatKey] = (stats[art.mainStatKey] ?? 0) + Artifact.mainStatValue(art.mainStatKey, art.rarity, Math.max(Math.min(stats.mainStatAssumptionLevel ?? 20, art.rarity * 4), art.level))
      //substats
      art.substats.forEach((substat) =>
        substat && substat.key && (stats[substat.key] = (stats[substat.key] || 0) + substat.value))
    })
    //setEffects
    mergeStats(stats, artifactSetEffectsStats)
    //setEffects conditionals
    Conditional.parseConditionalValues({ artifact: stats?.conditionalValues?.artifact }, (conditional, conditionalValue, [, setKey, setNumKey]) => {
      if (!Conditional.canShow(conditional, stats)) return
      const { stats: condStats } = Conditional.resolve(conditional, stats, conditionalValue)
      mergeCalculatedStats(stats, condStats)
    })
    return stats
  }

  static createInitialStatsWithoutConds = (character: ICachedCharacter, database: ArtCharDatabase, sheets: Sheets, activeCharacter = true): ICalculatedStats => {
    const { characterSheets, weaponSheets } = sheets
    const { key: characterKey, bonusStats = {}, elementKey, level, ascension, hitMode, infusionAura, reactionMode, talent,
      constellation, equippedArtifacts, conditionalValues = {}, equippedWeapon, team } = character
    const characterSheet = characterSheets[characterKey]
    const weapon = database._getWeapon(equippedWeapon) ?? defaultInitialWeapon(characterSheet.weaponTypeKey) // need to ensure all characters have a weapon
    const weaponSheet = weaponSheets[weapon.key]
    const overrideStats = Object.fromEntries(Object.entries(bonusStats).filter(([s]) => overrideStatKeys.includes(s)))
    const additionalStats = Object.fromEntries(Object.entries(bonusStats).filter(([s]) => !overrideStatKeys.includes(s)))
    //generate the initalStats obj with data from Character
    let initialStats = characterBaseStats(character)
    initialStats.characterKey = characterKey
    initialStats.characterLevel = level
    initialStats.characterHP = characterSheet.getBase("characterHP", level, ascension)
    initialStats.characterDEF = characterSheet.getBase("characterDEF", level, ascension)
    initialStats.characterATK = characterSheet.getBase("characterATK", level, ascension)
    initialStats.characterEle = characterSheet.elementKey ?? elementKey ?? "anemo";
    initialStats.hitMode = hitMode;
    if (infusionAura)
      initialStats.infusionAura = infusionAura
    initialStats.reactionMode = reactionMode;
    initialStats.conditionalValues = conditionalValues
    initialStats.weaponType = characterSheet.weaponTypeKey
    initialStats.tlvl = Object.fromEntries(Object.entries(talent ?? {}).map(([key, value]) => [key, value - 1])) as any;
    initialStats.constellation = constellation
    initialStats.ascension = ascension
    initialStats.weapon = { key: weapon.key, refineIndex: weapon.refinement - 1 }
    initialStats.equippedArtifacts = equippedArtifacts;
    initialStats.team = team
    initialStats = { ...initialStats, ...overrideStats }
    mergeStats(initialStats, additionalStats)

    initialStats.partyBuff = {}
    // This stores any party stats from this character.
    initialStats.partyAllModifiers = {}
    initialStats.partyOnlyModifiers = {}
    initialStats.partyActiveModifiers = {}

    //add specialized stat
    const specialStatKey = characterSheet.getSpecializedStat(ascension)
    if (specialStatKey) {
      const specializedStatVal = characterSheet.getSpecializedStatVal(ascension)
      mergeStats(initialStats, { [specialStatKey]: specializedStatVal })
    }

    //add stats from weapons
    const weaponATK = weaponSheet.getMainStatValue(weapon.level, weapon.ascension)
    initialStats.weaponATK = weaponATK
    const weaponSubKey = weaponSheet.getSubStatKey()
    if (weaponSubKey) mergeStats(initialStats, { [weaponSubKey]: weaponSheet.getSubStatValue(weapon.level, weapon.ascension) })
    mergeStats(initialStats, weaponSheet.stats(initialStats as ICalculatedStats))

    initialStats.activeCharacter = activeCharacter

    // Team stuff
    if (activeCharacter) {
      // initiate Team stats.
      initialStats.teamStats = team.map(tCharKey => {
        if (!tCharKey) return null
        const tChar = database._getChar(tCharKey)
        if (!tChar) return null
        // Empty teammate's team in calculation to stop recursion
        const x = tChar.team
        tChar.team = ["", "", ""] // Whatever this is, we're sooooooo not supposed to edit ICharacter objects in-place like this.
        const stats = Character.createInitialStatsWithoutConds(tChar, database, sheets, false)
        tChar.team = x
        return stats
      }) as ICalculatedStats["teamStats"]

      const allTeam = [characterKey, ...initialStats.team]
      const allTeamStats = [initialStats, ...initialStats.teamStats]
      initialStats.teamStats.forEach((tStats, tindex) => {
        if (!tStats) return
        tStats.team = allTeam.filter((_, i) => i !== (tindex + 1)) as ICalculatedStats["team"]
        tStats.teamStats = allTeamStats.filter((_, i) => i !== (tindex + 1)) as ICalculatedStats["teamStats"]
      });
    }

    Object.entries(initialStats).forEach(([key, val]) => {
      if (Number.isNaN(val)) debugger
    })
    return initialStats
  }

  static createInitialStats = (character: ICachedCharacter, database: ArtCharDatabase, sheets: Sheets): ICalculatedStats => {
    //generate the initalStats obj with data from Character
    const initialStats = Character.createInitialStatsWithoutConds(character, database, sheets)
    this.calculateBuildWithConditionalsWithoutArtifacts(initialStats, database, sheets)

    return initialStats
  }
  static calculateBuildWithConditionalsWithoutArtifacts(initialStats: ICalculatedStats, database: ArtCharDatabase, sheets: Sheets) {
    const { characterKey, characterEle: elementKey, conditionalValues = {} } = initialStats
    // Handle maxStack:0 conditionals. This is mainly skill boosts.
    Object.entries(Conditional.conditionals.character?.[characterKey === "Traveler" ? `Traveler_${elementKey}` : characterKey] ?? {}).map(([cKey, conditional]) =>
      !("states" in conditional) && conditional.maxStack === 0 && Conditional.canShow(conditional, initialStats) && mergeCalculatedStats(initialStats, Conditional.resolve(conditional, initialStats).stats))
    // Add levelBoosts, from Talent stats.
    for (const key in initialStats.tlvl)
      initialStats.tlvl[key] += initialStats[`${key}Boost`] ?? 0

    // Handle conditionals.
    Conditional.parseConditionalValues(conditionalValues, (conditional, conditionalValue, keys) => {
      // Ignore artifact conditionals.
      if (conditional.keys![0] === "artifact") return
      if (!Conditional.canShow(conditional, initialStats)) return
      const { stats: condStats } = Conditional.resolve(conditional, initialStats, conditionalValue)
      mergeCalculatedStats(initialStats, condStats)
    })
    // Handle Teammate's conditional
    if (initialStats.activeCharacter) {
      initialStats.teamStats.forEach(tstats => {
        if (!tstats) return
        // Calculate Teammate's build with artifacts, since the manual step of calculating artifacts is skipped in the builder path.
        const tChar = database._getChar(tstats.characterKey)
        if (!tChar) return
        const artifacts = Object.fromEntries(Object.entries(tChar.equippedArtifacts).map(([key, artid]) => [key, database._getArt(artid)]))
        this.calculateBuildWithConditionalsWithoutArtifacts(tstats, database, sheets)
        Character.calculateBuildwithArtifact(tstats, artifacts, sheets.artifactSheets)
      })
    }
    Object.entries(initialStats).forEach(([key, val]) => {
      if (Number.isNaN(val)) debugger
    })
    return initialStats
  }

  static getDisplayStatKeys = (stats: ICalculatedStats, sheets: Sheets) => {
    const eleKey = stats.characterEle
    const basicKeys = ["finalHP", "finalATK", "finalDEF", "eleMas", "critRate_", "critDMG_", "heal_", "enerRech_", `${eleKey}_dmg_`] as StatKey[]
    const characterSheet = sheets.characterSheets[stats.characterKey]
    const weaponSheet = sheets.weaponSheets[stats.weapon.key]
    const isAutoElemental = characterSheet.isAutoElemental
    if (!isAutoElemental) basicKeys.push("physical_dmg_")

    //show elemental interactions
    const transReactions = deepClone(ElementToReactionKeys[eleKey])
    const weaponTypeKey = characterSheet.weaponTypeKey
    if (!transReactions.includes("shattered_hit") && weaponTypeKey === "claymore") transReactions.push("shattered_hit")
    const charFormulas = {}
    const talentSheet = characterSheet.getTalent(eleKey)
    const addFormula = (fields: IFieldDisplay[], key: string) => fields.forEach(field => {
      if (!field.formula || !field?.canShow?.(stats)) return
      if (!charFormulas[key]) charFormulas[key] = []
      charFormulas[key].push((field.formula as any).keys)
    })
    const parseSection = (section: DocumentSection, key: string) => {
      //conditional
      if (section.conditional && Conditional.canShow(section.conditional, stats)) {
        const { fields } = Conditional.resolve(section.conditional, stats)
        fields && addFormula(fields, key)
      }
      //fields
      if (section.fields) addFormula(section.fields, key)
    }
    talentSheet && Object.entries(talentSheet.sheets).forEach(([talentKey, { sections }]) =>
      sections.forEach(section => parseSection(section, `talentKey_${talentKey}`)))

    const formKey = `weapon_${stats.weapon.key}`
    weaponSheet.document && weaponSheet.document.map(section => parseSection(section, formKey))

    stats.setToSlots && Object.entries(stats.setToSlots).map(([setKey, slots]) => [setKey, slots.length]).forEach(([setKey, num]) => {
      const artifactSheet: ArtifactSheet = sheets.artifactSheets[setKey]
      if (!artifactSheet) return
      Object.entries(artifactSheet.setEffects).forEach(([setNum, { document }]) => {
        if (num < parseInt(setNum)) return
        document && document.map(section => parseSection(section, `artifact_${setKey}_${setNum}`))
      })
    })
    return { basicKeys, ...charFormulas, transReactions }
  }
}