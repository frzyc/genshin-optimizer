import { StatIconEle } from "../Components/StatIcon"
import ElementalData from "../Data/ElementalData"
import Stat from "../Stat"
import { IFieldDisplay } from "../Types/IFieldDisplay"

function modifiersToFields(modifiers, stats = {}): IFieldDisplay[] {
  return Object.entries(modifiers).map(([mStatKey, modifier]) => ({
    text: Stat.getStatName(mStatKey),
    variant: Stat.getStatVariant(mStatKey),
    canShow: () => true,
    value: Object.entries(modifier as any ?? {}).reduce((accu, [mkey, multiplier]) => accu + stats[mkey as any] * (multiplier as any), 0),
    formulaText: <span>{Object.entries(modifier as any ?? {}).map(([mkey, multiplier], i) => <span key={i} >{i !== 0 ? " + " : ""}{Stat.printStat(mkey, stats)} * {(multiplier as any)?.toFixed?.(3) ?? multiplier}</span>)}</span>,
    fixed: Stat.fixedUnit(mStatKey),
    unit: Stat.getStatUnit(mStatKey)
  }))
}
export default function statsToFields(statVals, stats = {}): IFieldDisplay[] {
  return Object.entries(statVals).map(([statKey, statVal]) => {
    switch (statKey) {
      case "infusionSelf":
        return {
          text: <span className={`text-${statVal}`}>{ElementalData[statVal as any]?.name} Infusion</span>,
          canShow: () => true,
        }
      case "modifiers":
        return modifiersToFields(statVal, stats)
      default:
        return {
          text: <span>{StatIconEle(statKey)}{Stat.getStatName(statKey)}</span>,
          variant: Stat.getStatVariant(statKey),
          canShow: () => true,
          value: statVal as number,
          fixed: Stat.fixedUnit(statKey),
          unit: Stat.getStatUnit(statKey)
        }
    }
  }
  ).flat()
}

export function fieldProcessing(field) {
  //attach the field prop to the formulas for reverse search
  if (field.formula) field.formula.field = field
  if (typeof field.canShow !== "function") field.canShow = () => true
}