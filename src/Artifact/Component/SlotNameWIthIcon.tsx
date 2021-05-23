import { faBahai, faCrown, faFeatherAlt, faHourglass, faWineGlass, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTranslation } from "react-i18next"
import { SlotKey } from "../../Types/consts"

const SlotIcon: StrictDict<SlotKey, IconDefinition> = {
  flower: faBahai,
  plume: faFeatherAlt,
  sands: faHourglass,
  goblet: faWineGlass,
  circlet: faCrown
}

export function artifactSlotIcon(slotKey: SlotKey) {
  return <FontAwesomeIcon icon={SlotIcon[slotKey]} key={slotKey} className="fa-fw" />
}
export default function SlotNameWithIcon({ slotKey }: { slotKey: SlotKey }) {
  const { t } = useTranslation("artifact")
  const icon = artifactSlotIcon(slotKey)
  return <span>{icon} {t(`slotName.${slotKey}`)}</span>
}