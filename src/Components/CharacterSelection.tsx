import Dropdown from "react-bootstrap/Dropdown";
import CharacterSheet from "../Character/CharacterSheet";
import CharacterDatabase from "../Database/CharacterDatabase";
import { usePromise } from "../Util/ReactUtil";

function CharacterSelectionDropdownList({ onSelect }) {
  return <>{CharacterDatabase.getCharacterKeyList().sort(((a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    // names must be equal
    return 0;
  })).map(characterKey => <DropDownItem key={characterKey} characterKey={characterKey} onSelect={onSelect} />)}</>
}
function DropDownItem({ characterKey, onSelect }) {
  const characterSheet = usePromise(CharacterSheet.get(characterKey), [characterKey])
  if (!characterSheet) return null
  return <Dropdown.Item onClick={() => onSelect(characterKey)}>
    {characterSheet.name}
  </Dropdown.Item>
}
export {
  CharacterSelectionDropdownList,
};

