import { CharacterKey } from "@genshin-optimizer/consts";
import { useCallback, useContext } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import { DatabaseContext } from "../Database/Database";

/**
 * Basically a history hook to go to the dedicated character page. Will create the character if it doesn't exist.
 * @returns
 */
export default function useCharSelectionCallback() {
  const { database } = useContext(DatabaseContext)
  const navigate = useNavigate()
  // Used to maintain the previous tab, if there is one
  const { params: { tab = "" } } = useMatch({ path: "/characters/:charKey/:tab", end: false }) ?? { params: { tab: "" } }
  const cb = useCallback((characterKey: CharacterKey) => {
    const character = database.chars.get(characterKey)
    let navTab = tab
    // Create a new character + weapon, with linking if char isnt in db.
    if (!character) {
      database.chars.getWithInitWeapon(characterKey)
      // If we are navigating to a new character,
      // redirect to Overview, regardless of previous tab.
      // Trying to enforce a certain UI flow when building new characters
      navTab = ""
    }
    navigate(`/characters/${characterKey}/${navTab}`)
  }, [navigate, database, tab])
  return cb
}
