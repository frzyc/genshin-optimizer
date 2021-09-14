import { faBriefcase } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import CharacterSheet from "../Character/CharacterSheet";
import { CharacterKey, WeaponTypeKey } from "../Types/consts";
import { usePromise } from "../Util/ReactUtil";
import { CharacterSelectionDropdownList } from "../Character/CharacterSelection";

export default function EquipmentDropdown({ location, onEquip, weaponTypeKey, disableUnequip = false, disabled }: { location: CharacterKey | "", onEquip: (charKey: CharacterKey) => void, weaponTypeKey?: WeaponTypeKey, disableUnequip?: boolean, disabled?: boolean }) {
  const { t } = useTranslation(["artifact"]);
  const characterSheet = usePromise(CharacterSheet.get(location), [location])
  const locationName = characterSheet?.name ? characterSheet.nameWIthIcon : <span><FontAwesomeIcon icon={faBriefcase} /> {t`filterLocation.inventory`}</span>

  return !disabled ? <Dropdown>
    <Dropdown.Toggle className="text-left">{locationName}</Dropdown.Toggle>
    <Dropdown.Menu>
      {!disableUnequip && <><Dropdown.Item onClick={() => { /* TODO */ }}><FontAwesomeIcon icon={faBriefcase} /> Inventory</Dropdown.Item>
        <Dropdown.Divider /></>}
      <CharacterSelectionDropdownList onSelect={onEquip} weaponTypeKey={weaponTypeKey} />
    </Dropdown.Menu>
  </Dropdown> : locationName
}