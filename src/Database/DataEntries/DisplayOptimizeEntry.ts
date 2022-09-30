import { allCharacterKeys, CharacterKey } from "../../Types/consts";
import { ArtCharDatabase } from "../Database";
import { DataEntry } from "../DataEntry";
import { validateArr } from "../validationUtil";

interface IDisplayOptimizeEntry {
  equipmentPriority: CharacterKey[],
  threads: number,
}
export const defThreads = navigator.hardwareConcurrency || 4
function initialTabOptimize(): IDisplayOptimizeEntry {
  return {
    equipmentPriority: [],
    threads: defThreads
  }
}

export class DisplayOptimizeEntry extends DataEntry<"display_optimize", "display_optimize", IDisplayOptimizeEntry, IDisplayOptimizeEntry>{
  constructor(database: ArtCharDatabase) {
    super(database, "display_optimize", initialTabOptimize, "display_optimize",)
  }
  validate(obj: any): IDisplayOptimizeEntry | undefined {
    if (typeof obj !== "object") return
    let { equipmentPriority, threads } = obj
    equipmentPriority = validateArr(equipmentPriority, allCharacterKeys, [])
    if (typeof threads !== "number" || !Number.isInteger(threads) || threads <= 0) threads = defThreads

    return { equipmentPriority, threads } as IDisplayOptimizeEntry
  }
}
