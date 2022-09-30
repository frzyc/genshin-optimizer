import { RESIN_MAX } from "../../PageTools/ResinCounter";
import { TimeZoneKey, timeZones } from "../../PageTools/TeyvatTime";
import { ArtCharDatabase } from "../Database";
import { DataEntry } from "../DataEntry";

interface IDisplayToolEntry {
  resin: number,
  resinDate: number,
  timeZoneKey: TimeZoneKey
}
export const defThreads = navigator.hardwareConcurrency || 4
function initialTabOptimize(): IDisplayToolEntry {
  return {
    resin: RESIN_MAX,
    resinDate: new Date().getTime(),
    timeZoneKey: Object.keys(timeZones)[0] as TimeZoneKey,
  }
}

export class DisplayToolEntry extends DataEntry<"display_tool", "display_tool", IDisplayToolEntry, IDisplayToolEntry>{
  constructor(database: ArtCharDatabase) {
    super(database, "display_tool", initialTabOptimize, "display_tool")
  }
  validate(obj: any): IDisplayToolEntry | undefined {
    if (typeof obj !== "object") return
    let { timeZoneKey, resin, resinDate } = obj
    if (!Object.keys(timeZones).includes(timeZoneKey)) timeZoneKey = Object.keys(timeZones)[0]
    if (typeof resin !== "number" || resin < 0 || !Number.isInteger(resin)) resin = RESIN_MAX
    if (typeof resinDate !== "number" || resinDate < 0 || !Number.isInteger(resinDate)) resinDate = new Date().getTime()
    return { timeZoneKey, resin, resinDate } as IDisplayToolEntry
  }
}
