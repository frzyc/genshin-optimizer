import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTranslation } from "react-i18next"
import { faCirclet, faFlower, faGoblet, faPlume, faSands } from '../faIcons'
import { SlotKey } from "../../Types/consts"
import { SizeProp } from "@fortawesome/fontawesome-svg-core"

export const SlotIconSVG: StrictDict<SlotKey, any> = {
  flower: faFlower,
  plume: faPlume,
  sands: faSands,
  goblet: faGoblet,
  circlet: faCirclet
}

export function artifactSlotIcon(slotKey: SlotKey, size?: SizeProp) {
  return <FontAwesomeIcon icon={SlotIconSVG[slotKey]} key={slotKey} className="fa-fw" size={size} />
}

export default function SlotNameWithIcon({ slotKey }: { slotKey: SlotKey }) {
  const { t } = useTranslation("artifact")
  const icon = artifactSlotIcon(slotKey)
  return <span>{icon} {t<string>(`slotName.${slotKey}`)}</span>
}
