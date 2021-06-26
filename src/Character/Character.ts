import Artifact from "../Artifact/Artifact";
import { ArtifactSheet } from "../Artifact/ArtifactSheet";
import Conditional from "../Conditional/Conditional";
import { characterStatBase, LevelsData } from "../Data/CharacterData";
import ElementalData from "../Data/ElementalData";
import ArtifactDatabase from "../Database/ArtifactDatabase";
import CharacterDatabase from "../Database/CharacterDatabase";
import Formula from "../Formula";
import { ElementToReactionKeys, PreprocessFormulas } from "../StatData";
import { GetDependencies } from "../StatDependency";
import { ICharacter } from "../Types/character";
import { allElements, allSlotKeys, CharacterKey, ElementKey, SlotKey } from "../Types/consts";
import ICalculatedStats from "../Types/ICalculatedStats";
import { deepClone, evalIfFunc } from "../Util/Util";
import Weapon from "../Weapon/Weapon";
import WeaponSheet from "../Weapon/WeaponSheet";
import CharacterSheet from "./CharacterSheet";

export default class Character {
  //do not instantiate.
  constructor() { if (this instanceof Character) throw Error('A static class cannot be instantiated.'); }

  static getElementalName = (elementalKey, defVal = "") => (ElementalData?.[elementalKey]?.name || defVal)

  //LEVEL
  static getlevelKeys = (): string[] => Object.keys(LevelsData)
  static getlevelTemplateName = (levelKey, defVal = "") => (LevelsData?.[levelKey]?.name || defVal)
  static getLevelString = (character: ICharacter, characterSheet: CharacterSheet, weaponSheet: WeaponSheet) => {
    const levelOverride = Character.getStatValueWithOverride(character, characterSheet, weaponSheet, "characterLevel")
    return Character.getLevel(character.levelKey) === levelOverride ? Character.getlevelTemplateName(character.levelKey) : `Lvl. ${levelOverride}`
  }
  static getIndexFromlevelkey = (levelKey) => Character.getlevelKeys().indexOf(levelKey);
  static getLevel = (levelKey, defVal = 1) => (LevelsData?.[levelKey]?.level || defVal)
  static getAscension = (levelKey, defVal = 0) => (LevelsData?.[levelKey]?.asend || defVal)

  static getTalentFieldValue = (field, key, stats = {}, defVal = "") => {
    if (!field?.[key]) return defVal
    return evalIfFunc(field?.[key], stats)
  }

  static hasOverride = (character, statKey) => {
    if (statKey === "finalHP")
      return Character.hasOverride(character, "hp") || Character.hasOverride(character, "hp_") || Character.hasOverride(character, "characterHP") || false
    else if (statKey === "finalDEF")
      return Character.hasOverride(character, "def") || Character.hasOverride(character, "def_") || Character.hasOverride(character, "characterDEF") || false
    else if (statKey === "finalATK")
      return Character.hasOverride(character, "atk") || Character.hasOverride(character, "atk_") || Character.hasOverride(character, "characterATK") || false
    return character?.baseStatOverrides ? (statKey in character.baseStatOverrides) : false;
  }

  static getBaseStatValue = (character: ICharacter, characetSheet: CharacterSheet, weaponSheet: WeaponSheet, statKey: string, defVal = 0) => {
    const { levelKey } = character
    if (statKey === "specializedStatKey") return characetSheet.specializeStat.key
    if (statKey === "specializedStatVal") return characetSheet.specializeStat.value[Character.getIndexFromlevelkey(levelKey)]
    if (statKey === "weaponATK") return Weapon.getWeaponMainStatValWithOverride(character?.weapon, weaponSheet)
    if (statKey === "characterLevel" || statKey === "enemyLevel") return Character.getLevel(levelKey)
    if (statKey.includes("enemyRes_")) return 10
    if (statKey in characterStatBase) return characterStatBase[statKey]
    if (statKey in characetSheet.baseStat) return characetSheet.baseStat[statKey][Character.getIndexFromlevelkey(levelKey)]
    return defVal
  }
  static getStatValueWithOverride = (character: ICharacter, characterSheet: CharacterSheet, weaponSheet: WeaponSheet, statKey: string, defVal = 0) => {
    if (Character.hasOverride(character, statKey)) return character?.baseStatOverrides?.[statKey] ?? defVal
    else return Character.getBaseStatValue(character, characterSheet, weaponSheet, statKey, defVal)
  }

  //equipment, with consideration on swapping equipped.
  static equipArtifacts = (characterKey: CharacterKey | "", artIds: StrictDict<SlotKey, string>) => {
    const character = CharacterDatabase.get(characterKey)
    if (!character) return;
    const artIdsOnCharacter = character.equippedArtifacts;

    //swap, by slot
    allSlotKeys.forEach(slotKey => {
      const artNotOnChar = ArtifactDatabase.get(artIds[slotKey])
      if (artNotOnChar?.location === characterKey) return; //it is already equipped
      const artOnChar = ArtifactDatabase.get(artIdsOnCharacter?.[slotKey])
      const notCharLoc = (artNotOnChar?.location ?? "")
      //move current art to other char
      if (artOnChar) ArtifactDatabase.moveToNewLocation(artOnChar.id, notCharLoc)
      //move current art to other char
      if (notCharLoc) CharacterDatabase.equipArtifactOnSlot(notCharLoc, slotKey, artOnChar?.id ?? "")
      //move other art to current char
      if (artNotOnChar) ArtifactDatabase.moveToNewLocation(artNotOnChar.id, characterKey)
    })
    //move other art to current char
    CharacterDatabase.equipArtifactBuild(characterKey, artIds);
  }
  static remove(characterKey) {
    const character = CharacterDatabase.get(characterKey)
    if (!character) return
    Object.values(character.equippedArtifacts).forEach(artid =>
      ArtifactDatabase.moveToNewLocation(artid, ""))
    CharacterDatabase.remove(characterKey)
  }

  static calculateBuild = (character: ICharacter, characterSheet: CharacterSheet, weaponSheet: WeaponSheet, artifactSheets, mainStatAssumptionLevel = 0): ICalculatedStats => {
    let artifacts
    if (character.artifacts) //from flex
      artifacts = Object.fromEntries(character.artifacts.map((art, i) => [i, art]))
    else if (character.equippedArtifacts)
      artifacts = Object.fromEntries(Object.entries(character.equippedArtifacts).map(([key, artid]) => [key, ArtifactDatabase.get(artid)]))
    const initialStats = Character.createInitialStats(character, characterSheet, weaponSheet)
    initialStats.mainStatAssumptionLevel = mainStatAssumptionLevel
    return Character.calculateBuildwithArtifact(initialStats, artifacts, artifactSheets)
  }

  static calculateBuildwithArtifact = (initialStats, artifacts, artifactSheets) => {
    const setToSlots = Artifact.setToSlots(artifacts)
    let artifactSetEffectsStats = ArtifactSheet.setEffectsStats(artifactSheets, initialStats, setToSlots)

    let stats = deepClone(initialStats)
    //add artifact and artifactsets
    Object.values(artifacts).forEach((art: any) => {
      if (!art) return
      //main stats
      stats[art.mainStatKey] = (stats[art.mainStatKey] || 0) + Artifact.mainStatValue(art.mainStatKey, art.numStars, Math.max(Math.min(stats.mainStatAssumptionLevel, art.numStars * 4), art.level))
      //substats
      art.substats.forEach((substat) =>
        substat && substat.key && (stats[substat.key] = (stats[substat.key] || 0) + substat.value))
    })
    //setEffects
    artifactSetEffectsStats.forEach(stat => stats[stat.key] = (stats[stat.key] || 0) + stat.value)
    //setEffects conditionals
    Conditional.parseConditionalValues({ artifact: stats?.conditionalValues?.artifact }, (conditional, conditionalValue, [, setKey]) => {
      const { setNumKey } = conditional
      if (parseInt(setNumKey) > (setToSlots?.[setKey]?.length ?? 0)) return
      const { stats: condStats } = Conditional.resolve(conditional, stats, conditionalValue)
      Object.entries(condStats).forEach(([statKey, val]) => stats[statKey] = (stats[statKey] || 0) + val)
    })

    stats.equippedArtifacts = Object.fromEntries(Object.entries(artifacts).map(([key, val]: any) => [key, val?.id]))
    stats.setToSlots = setToSlots
    let dependencies = GetDependencies(stats?.modifiers)
    PreprocessFormulas(dependencies, stats).formula(stats)
    return stats
  }
  static mergeStats = (initialStats, stats) => stats && Object.entries(stats).forEach(([key, val]: any) => {
    if (key === "modifiers") {
      initialStats.modifiers = initialStats.modifiers ?? {}
      for (const [statKey, modifier] of (Object.entries(val) as any)) {
        initialStats.modifiers[statKey] = initialStats.modifiers[statKey] ?? {}
        for (const [mkey, multiplier] of (Object.entries(modifier) as any))
          initialStats.modifiers[statKey][mkey] = (initialStats.modifiers[statKey][mkey] ?? 0) + multiplier
      }
    } else {
      if (initialStats[key] === undefined) initialStats[key] = val
      else if (typeof initialStats[key] === "number") initialStats[key] += val
    }
  })

  static createInitialStats = (character: ICharacter, characterSheet: CharacterSheet, weaponSheet: WeaponSheet): ICalculatedStats => {
    character = deepClone(character)
    const { characterKey, elementKey, levelKey, hitMode, infusionAura, reactionMode, talentLevelKeys, constellation, equippedArtifacts, conditionalValues = {}, weapon = { key: "", refineIndex: 0 } } = character
    const ascension = Character.getAscension(levelKey)

    //generate the initalStats obj with data from Character & overrides
    const statKeys = ["characterHP", "characterATK", "characterDEF", "weaponATK", "characterLevel", "enemyLevel", "physical_enemyRes_", "physical_enemyImmunity", ...Object.keys(characterStatBase)]
    const initialStats = Object.fromEntries(statKeys.map(key => [key, Character.getStatValueWithOverride(character, characterSheet, weaponSheet, key)])) as ICalculatedStats
    initialStats.characterEle = characterSheet.elementKey ?? elementKey ?? "anemo";
    initialStats.characterKey = characterKey
    initialStats.hitMode = hitMode;
    initialStats.infusionAura = infusionAura
    initialStats.reactionMode = reactionMode;
    initialStats.conditionalValues = conditionalValues
    initialStats.weaponType = characterSheet.weaponTypeKey
    initialStats.tlvl = talentLevelKeys;
    initialStats.constellation = constellation
    initialStats.ascension = ascension
    const { key: weapon_key, refineIndex: weapon_refineIndex } = weapon
    initialStats.weapon = { key: weapon_key, refineIndex: weapon_refineIndex }
    initialStats.equippedArtifacts = equippedArtifacts;

    //enemy stuff
    ["physical", ...allElements].forEach(eleKey => {
      let statKey = `${eleKey}_enemyRes_`
      initialStats[statKey] = Character.getStatValueWithOverride(character, characterSheet, weaponSheet, statKey);
      statKey = `${eleKey}_enemyImmunity`
      initialStats[statKey] = Character.getStatValueWithOverride(character, characterSheet, weaponSheet, statKey);
    })

    //all the rest of the overrides
    let overrides = character?.baseStatOverrides || {}
    Object.entries(overrides).forEach(([statKey, val]: any) => {
      if (statKey === "specializedStatKey" || statKey === "specializedStatVal") return
      if (!initialStats.hasOwnProperty(statKey)) initialStats[statKey] = val
    })

    //add specialized stat
    let specializedStatVal = Character.getStatValueWithOverride(character, characterSheet, weaponSheet, "specializedStatVal")
    let specialStatKey = Character.getStatValueWithOverride(character, characterSheet, weaponSheet, "specializedStatKey")
    Character.mergeStats(initialStats, { [specialStatKey]: specializedStatVal })

    //add stats from all talents
    characterSheet.getTalentStatsAll(initialStats as ICalculatedStats, initialStats.characterEle).forEach(s => Character.mergeStats(initialStats, s))

    //add levelBoosts, from Talent stats.
    for (const key in initialStats.tlvl)
      initialStats.tlvl[key] += initialStats[`${key}Boost`] ?? 0

    //add stats from weapons
    const weaponSubKey = Weapon.getWeaponSubstatKey(weaponSheet)
    if (weaponSubKey) Character.mergeStats(initialStats, { [weaponSubKey]: Weapon.getWeaponSubstatValWithOverride(character?.weapon, weaponSheet) })
    Character.mergeStats(initialStats, weaponSheet.stats(initialStats as ICalculatedStats))


    //Handle conditionals, without artifact, since the pipeline for that comes later.
    const { artifact: artifactCond, weapon: weaponCond, ...otherCond } = conditionalValues

    //handle conditionals. only the conditional applicable to the equipped weapon is parsed.
    Conditional.parseConditionalValues({ ...weapon.key && { weapon: { [weapon.key]: weaponCond?.[weapon.key] } }, ...otherCond }, (conditional, conditionalValue, keys) => {
      if (!Conditional.canShow(conditional, initialStats)) return
      const { stats: condStats } = Conditional.resolve(conditional, initialStats, conditionalValue)
      Character.mergeStats(initialStats, condStats)
    })
    return initialStats as ICalculatedStats
  }
  static getDisplayStatKeys = (stats: ICalculatedStats, characterSheet: CharacterSheet) => {
    const eleKey = stats.characterEle
    const basicKeys = ["finalHP", "finalATK", "finalDEF", "eleMas", "critRate_", "critDMG_", "heal_", "enerRech_", `${eleKey}_dmg_`]
    const isAutoElemental = characterSheet.isAutoElemental
    if (!isAutoElemental) basicKeys.push("physical_dmg_")

    //show elemental interactions
    const transReactions = deepClone(ElementToReactionKeys[eleKey])
    const weaponTypeKey = characterSheet.weaponTypeKey
    if (!transReactions.includes("shattered_hit") && weaponTypeKey === "claymore") transReactions.push("shattered_hit")
    const charFormulas = {}
    const talentSheet = characterSheet.getTalent(eleKey)
    talentSheet && Object.entries(talentSheet.formula).forEach(([talentKey, formulas]: any) => {
      Object.values(formulas as any).forEach((formula: any) => {
        if (!formula.field.canShow(stats)) return
        if (talentKey === "normal" || talentKey === "charged" || talentKey === "plunging") talentKey = "auto"
        const formKey = `talentKey_${talentKey}`
        if (!charFormulas[formKey]) charFormulas[formKey] = []
        charFormulas[formKey].push(formula.keys)
      })
    })

    const weaponFormulas = Formula.formulas.weapon[stats.weapon.key]

    if (weaponFormulas) {
      Object.values(weaponFormulas as any).forEach((formula: any) => {
        if (!formula.field.canShow(stats)) return
        const formKey = `weapon_${stats.weapon.key}`
        if (!charFormulas[formKey]) charFormulas[formKey] = []
        charFormulas[formKey].push(formula.keys)
      })
    }
    return { basicKeys, ...charFormulas, transReactions }
  }
  static getDisplayHeading(key: string, characterSheet: CharacterSheet, weaponSheet: WeaponSheet, eleKey: ElementKey = "anemo") {
    if (key === "basicKeys") return "Basic Stats"
    else if (key === "genericAvgHit") return "Generic Optimization Values"
    else if (key === "transReactions") return "Transformation Reaction"
    else if (key.startsWith("talentKey_")) {
      const subkey = key.split("talentKey_")[1]
      return (characterSheet?.getTalentOfKey(subkey, eleKey)?.name ?? subkey)
    } else if (key.startsWith("weapon_")) {
      const subkey = key.split("weapon_")[1]
      return (weaponSheet?.name ?? subkey)
    }
    return ""
  }
}