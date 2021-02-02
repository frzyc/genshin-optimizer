import Dropdown from "react-bootstrap/Dropdown";
import Character from "../Character/Character";
import CharacterDatabase from "../Character/CharacterDatabase";

function CharacterSelectionDropdownList({ onSelect }) {
  return Object.entries(CharacterDatabase.getCharacterDatabase()).map(([id, char]) =>
    <Dropdown.Item key={id} onClick={() => onSelect(id)}>
      <span>
        <div className="mb-n2"><b>{Character.getName(char.characterKey)}</b></div>
        <small>{char.name}</small>
      </span>
    </Dropdown.Item>)
}
function CharacterNameDisplay({ id, flat = false }) {
  let locationChar = CharacterDatabase.getCharacter(id)
  if (locationChar) {
    if (flat) {
      return <span><b>{Character.getName(locationChar.characterKey)}</b> <small>{locationChar?.name}</small></span>
    } else {
      return <span>
        <div className="mb-n2"><b>{Character.getName(locationChar.characterKey)}</b></div>
        <small>{locationChar.name}</small>
      </span>
    }

  } else {
    return <b>Inventory</b>
  }
}
export {
  CharacterSelectionDropdownList,
  CharacterNameDisplay
};

