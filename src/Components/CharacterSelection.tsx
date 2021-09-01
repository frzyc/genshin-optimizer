import { useContext } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import CharacterSheet from "../Character/CharacterSheet";
import { DatabaseContext } from "../Database/Database";
import { CharacterKey, WeaponTypeKey } from "../Types/consts";
import { usePromise } from "../Util/ReactUtil";

export function CharacterSelectionDropdownList({ onSelect, weaponTypeKey }: { onSelect: (ckey: CharacterKey) => void, weaponTypeKey?: WeaponTypeKey }) {
  const database = useContext(DatabaseContext)
  const characterSheets = usePromise(CharacterSheet.getAll(), [])
  return <>{database._getCharKeys().filter(cKey =>
    weaponTypeKey ? (characterSheets?.[cKey]?.weaponTypeKey === weaponTypeKey) : true
  ).sort(((a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    // names must be equal
    return 0;
  })).map(characterKey => <DropDownItem key={characterKey} characterKey={characterKey} onSelect={onSelect} />)}</>
}
function DropDownItem({ characterKey, onSelect }) {
  const characterSheet = usePromise(CharacterSheet.get(characterKey), [characterKey])
  if (!characterSheet) return null
  return <Dropdown.Item onClick={() => onSelect(characterKey)}>{characterSheet.nameWIthIcon}</Dropdown.Item>
}

