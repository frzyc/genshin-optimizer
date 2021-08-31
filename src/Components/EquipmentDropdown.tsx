import { faBriefcase } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import CharacterSheet from "../Character/CharacterSheet";
import { CharacterKey } from "../Types/consts";
import { usePromise } from "../Util/ReactUtil";
import { CharacterSelectionDropdownList } from "./CharacterSelection";

export default function EquipmentDropdown({ location, onEquip }: { location: CharacterKey | "", onEquip: (charKey: CharacterKey | "") => void }) {
  const { t } = useTranslation(["artifact"]);
  const characterSheet = usePromise(CharacterSheet.get(location), [location])
  const locationName = characterSheet?.name ? characterSheet.nameWIthIcon : <span><FontAwesomeIcon icon={faBriefcase} /> {t`filterLocation.inventory`}</span>

  return <Dropdown>
    <Dropdown.Toggle className="text-left">{locationName}</Dropdown.Toggle>
    <Dropdown.Menu>
      <Dropdown.Item onClick={() => onEquip("")}><FontAwesomeIcon icon={faBriefcase} /> Inventory</Dropdown.Item>
      <Dropdown.Divider />
      <CharacterSelectionDropdownList onSelect={onEquip} />
    </Dropdown.Menu>
  </Dropdown>
}