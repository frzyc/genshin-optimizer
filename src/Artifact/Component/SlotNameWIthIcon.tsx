import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTranslation } from "react-i18next"
import { faCirclet, faFlower, faGoblet, faPlume, faSands } from '../../faIcons'
import { SlotKey } from "../../Types/consts"

const SlotIcon: StrictDict<SlotKey, any> = {
  flower: faFlower,
  plume: faPlume,
  sands: faSands,
  goblet: faGoblet,
  circlet: faCirclet
}

export function artifactSlotIcon(slotKey: SlotKey) {
  return <FontAwesomeIcon icon={SlotIcon[slotKey]} key={slotKey} className="fa-fw" />
}
export default function SlotNameWithIcon({ slotKey }: { slotKey: SlotKey }) {
  const { t } = useTranslation("artifact")
  const icon = artifactSlotIcon(slotKey)
  return <span>{icon} {t(`slotName.${slotKey}`)}</span>
}