import React from "react"
import { Button, ButtonGroup, Dropdown } from "react-bootstrap"
import { Stars } from "../Components/StarDisplay"
import { allRarities, WeaponKey } from "../Types/consts"
import { usePromise } from "../Util/ReactUtil"
import WeaponSheet from "./WeaponSheet"

export default function WeaponDropdown({ weaponKey, weaponTypeKey, setWeaponKey }: { weaponKey: WeaponKey, weaponTypeKey?: string, setWeaponKey: (key: WeaponKey) => void }) {
  const weaponSheets = usePromise(WeaponSheet.getAll(), [])
  if (!weaponSheets) return null
  const name = weaponSheets[weaponKey]?.name ?? "Select a weapon"
  return <Dropdown as={ButtonGroup}>
    <Dropdown.Toggle as={Button}>
      {name}
    </Dropdown.Toggle>
    <Dropdown.Menu>
      {allRarities.map((stars, i, arr) => <React.Fragment key={stars}>
        <Dropdown.ItemText key={"star" + stars}><Stars stars={stars} /></Dropdown.ItemText>
        {Object.entries(weaponTypeKey ? WeaponSheet.getWeaponsOfType(weaponSheets, weaponTypeKey) : weaponSheets).filter(([, weaponObj]: any) => weaponObj.rarity === stars).map(([key, weaponObj]: any) =>
          <Dropdown.Item key={key} onClick={() => setWeaponKey(key)}>
            {weaponObj.name}
          </Dropdown.Item>
        )}
        {(i !== arr.length - 1) && < Dropdown.Divider />}
      </React.Fragment>)}
    </Dropdown.Menu>
  </Dropdown>
}