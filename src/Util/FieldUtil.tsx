import ColorText from "../Components/ColoredText"
import StatIcon from "../Components/StatIcon"
import ElementalData from "../Data/ElementalData"
import Stat from "../Stat"
import { IFieldDisplay } from "../Types/IFieldDisplay"

export default function statsToFields(statVals, stats = {}): IFieldDisplay[] {
  return Object.entries(statVals).filter(([statKey]) => statKey !== "modifiers").map(([statKey, statVal]) => {
    switch (statKey) {
      case "infusionSelf":
        return {
          text: <ColorText color={statVal as any}>{ElementalData[statVal as any]?.name} Infusion</ColorText>,
          canShow: () => true,
        }
      default:
        return {
          text: <span>{StatIcon[statKey as any]} {Stat.getStatName(statKey)}</span>,
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