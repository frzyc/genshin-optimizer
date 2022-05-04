import useDBState from "../../../../ReactHooks/useDBState";
import { CharacterKey } from "../../../../Types/consts";

export function initialTabOptimizeDBState(): {
  equipmentPriority: CharacterKey[]
} {
  return {
    equipmentPriority: []
  }
}

export function useOptimizeDBState() {
  return useDBState("TabOptimize", initialTabOptimizeDBState)
}
