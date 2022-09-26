import { useCallback, useContext } from "react";
import { useNavigate, useMatch } from "react-router";
import CharacterSheet from "../Data/Characters/CharacterSheet";
import { DatabaseContext } from "../Database/Database";
import { allSlotKeys, CharacterKey, charKeyToLocCharKey } from "../Types/consts";
import { defaultInitialWeapon } from "../Util/WeaponUtil";
import { ICachedCharacter } from "../Types/character";
import { objectKeyMap } from "../Util/Util";

/**
 * Basically a history hook to go to the dedicated character page. Will create the character if it doesn't exist.
 * @returns
 */
export default function useCharSelectionCallback() {
  const { database } = useContext(DatabaseContext)
  const navigate = useNavigate()
  // Used to maintain the previous tab, if there is one
  let { params: { tab = "" } } = useMatch({ path: "/characters/:charKey/:tab", end: false }) ?? { params: { tab: "" } }
  const cb = useCallback(
    async (characterKey: CharacterKey) => {
      const character = database.chars.get(characterKey)
      let navTab = tab
      // Create a new character + weapon, with linking if char isnt in db.
      if (!character) {
        database.chars.set(characterKey, initialCharacter(characterKey))
        const newChar = database.chars.get(characterKey)
        if (!newChar?.equippedWeapon) {
          const characterSheet = await CharacterSheet.get(characterKey, database.gender)
          if (!characterSheet) return
          const weapon = defaultInitialWeapon(characterSheet.weaponTypeKey)
          const weaponId = database.weapons.new(weapon)
          database.weapons.set(weaponId, { location: charKeyToLocCharKey(characterKey) })
        }
        // If we are navigating to a new character,
        // redirect to Overview, regardless of previous tab.
        // Trying to enforce a certain UI flow when building new characters
        navTab = ""
      }
      navigate(`/characters/${characterKey}/${navTab}`)
    },
    [navigate, database, tab],
  )
  return cb
}

export function initialCharacter(key: CharacterKey): ICachedCharacter {
  return {
    key,
    level: 1,
    ascension: 0,
    hitMode: "avgHit",
    equippedArtifacts: objectKeyMap(allSlotKeys, () => ""),
    equippedWeapon: "",
    conditional: {},
    bonusStats: {},
    enemyOverride: {},
    talent: {
      auto: 1,
      skill: 1,
      burst: 1,
    },
    infusionAura: "",
    constellation: 0,
    team: ["", "", ""],
    teamConditional: {},
    compareData: false,
    customMultiTarget: []
  }
}
