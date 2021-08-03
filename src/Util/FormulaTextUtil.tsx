import { getTalentStatKey } from "../Build/Build";
import Stat from "../Stat";
import { ElementKey } from "../Types/consts";
import { BasicStats } from "../Types/stats";

export function basicDMGFormulaText(percent: number, stats: BasicStats, skillKey: string, elemental?: "physical" | ElementKey) {
  return <span>{percent} % {Stat.printStat(getTalentStatKey(skillKey, stats, elemental), stats)} </span>
}