import Dropdown from "react-bootstrap/Dropdown";
import CharacterSheet from "../Character/CharacterSheet";
import { database } from "../Database/Database";
import { usePromise } from "../Util/ReactUtil";

export function CharacterSelectionDropdownList({ onSelect }) {
  return <>{database._getCharKeys().sort(((a, b) => {
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

