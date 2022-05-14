import useDBState from "../../../../ReactHooks/useDBState";
import { CharacterKey } from "../../../../Types/consts";

export const defThreads = navigator.hardwareConcurrency || 4

export function initialTabOptimizeDBState(): {
  equipmentPriority: CharacterKey[],
  threads: number,
} {
  return {
    equipmentPriority: [],
    threads: defThreads
  }
}

export function useOptimizeDBState() {
  return useDBState("TabOptimize", initialTabOptimizeDBState)
}
