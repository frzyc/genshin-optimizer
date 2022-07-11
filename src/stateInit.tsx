import { allSubstatKeys } from "./Types/artifact"

export function initGlobalSettings() {
  return { tcMode: false }
}

export function initCharMeta() {
  return {
    rvFilter: [...allSubstatKeys],
    favorite: false
  }
}
