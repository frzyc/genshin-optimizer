import { StatIconEle } from "../Components/StatIcon"
import Stat from "../Stat"

function modifiersToFields(modifiers, stats = {}) {
  return Object.entries(modifiers).map(([mStatKey, modifier]) => ({
    text: Stat.getStatName(mStatKey),
    variant: Stat.getStatVariant(mStatKey),
    canShow: () => true,
    value: Object.entries(modifier ?? {}).reduce((accu, [mkey, multiplier]) => accu + stats[mkey] * multiplier, 0),
    formulaText: <span>{Object.entries(modifier ?? {}).map(([mkey, multiplier], i) => <span key={i} >{i !== 0 ? " + " : ""}{Stat.printStat(mkey, stats)} * {multiplier?.toFixed?.(3) ?? multiplier}</span>)}</span>,
    fixed: Stat.fixedUnit(mStatKey),
    unit: Stat.getStatUnit(mStatKey)
  }))
}
export default function statsToFields(statVals, stats = {}) {
  return Object.entries(statVals).map(([statKey, statVal]) =>
    statKey === "modifiers" ? modifiersToFields(statVal, stats) : {
      text: <span>{StatIconEle(statKey)}{Stat.getStatName(statKey)}</span>,
      variant: Stat.getStatVariant(statKey),
      canShow: () => true,
      value: statVal,
      fixed: Stat.fixedUnit(statKey),
      unit: Stat.getStatUnit(statKey)
    }
  ).flat()
}

export function fieldProcessing(field) {
  //attach the field prop to the formulas for reverse search
  if (field.formula) field.formula.field = field
  if (typeof field.canShow !== "function") field.canShow = () => true
}