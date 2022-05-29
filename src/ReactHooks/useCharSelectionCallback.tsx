import { useCallback, useContext } from "react";
import { useNavigate, useMatch } from "react-router";
import CharacterSheet from "../Data/Characters/CharacterSheet";
import { initialCharacter } from "../Util/CharacterUtil";
import { DatabaseContext } from "../Database/Database";
import { CharacterKey } from "../Types/consts";
import { defaultInitialWeapon } from "../Util/WeaponUtil";

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
      const character = database._getChar(characterKey)
      let navTab = tab
      // Create a new character + weapon, with linking if char isnt in db.
      if (!character) {
        const newChar = initialCharacter(characterKey)
        database.updateChar(newChar)
        const characterSheet = await CharacterSheet.get(characterKey)
        if (!characterSheet) return
        const weapon = defaultInitialWeapon(characterSheet.weaponTypeKey)
        const weaponId = database.createWeapon(weapon)
        database.setWeaponLocation(weaponId, characterKey)
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
