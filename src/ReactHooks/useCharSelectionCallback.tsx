import { useCallback, useContext } from "react";
import { useHistory } from "react-router";
import CharacterSheet from "../Character/CharacterSheet_WR";
import { initialCharacter } from "../Character/CharacterUtil";
import { DatabaseContext } from "../Database/Database";
import { CharacterKey } from "../Types/consts";
import { defaultInitialWeapon } from "../Weapon/WeaponUtil";

/**
 * Basically a history hook to go to the dedicated character page. Will create the character if it doesn't exist.
 * @returns
 */
export default function useCharSelectionCallback() {
  const database = useContext(DatabaseContext)
  const history = useHistory()
  const cb = useCallback(
    async (characterKey: CharacterKey) => {
      const character = database._getChar(characterKey)
      // Create a new character + weapon, with linking if char isnt in db.
      if (!character) {
        const newChar = initialCharacter(characterKey)
        database.updateChar(newChar)
        const characterSheet = await CharacterSheet.get(characterKey)
        if (!characterSheet) return
        const weapon = defaultInitialWeapon(characterSheet.weaponTypeKey)
        const weaponId = database.createWeapon(weapon)
        database.setWeaponLocation(weaponId, characterKey)
      }
      history.push(`/character/${characterKey}`)
    },
    [history],
  )
  return cb
}
