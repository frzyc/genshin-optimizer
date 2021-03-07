import Dropdown from "react-bootstrap/Dropdown";
import Character from "../Character/Character";
import CharacterDatabase from "../Character/CharacterDatabase";

function CharacterSelectionDropdownList({ onSelect }) {
  return CharacterDatabase.getCharacterKeyList().sort(((a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    // names must be equal
    return 0;
  })).map(characterKey =>
    <Dropdown.Item key={characterKey} onClick={() => onSelect(characterKey)}>
      {Character.getName(characterKey)}
    </Dropdown.Item>)
}
export {
  CharacterSelectionDropdownList,
};

