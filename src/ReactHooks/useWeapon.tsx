import { useContext, useEffect, useState } from "react";
import { DatabaseContext } from "../Database/Database";

export default function useWeapon(weaponID: string | undefined) {
  const database = useContext(DatabaseContext)
  const [weapon, setWeapon] = useState(weaponID ? database._getWeapon(weaponID) : undefined)
  useEffect(() => setWeapon(weaponID ? database._getWeapon(weaponID) : undefined), [database, weaponID])
  useEffect(() =>
    weaponID ? database.followWeapon(weaponID, setWeapon) : undefined,
    [weaponID, setWeapon, database])
  return weapon
}