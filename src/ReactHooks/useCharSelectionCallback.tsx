import { useCallback } from "react";
import { useHistory } from "react-router";
import { CharacterKey } from "../Types/consts";

/**
 * Basically a history hook to go to the dedicated character page.
 * @returns 
 */
export default function useCharSelectionCallback() {
  const history = useHistory()
  const cb = useCallback(
    (characterKey: CharacterKey) => history.push(`/character/${characterKey}`),
    [history],
  )
  return cb
}