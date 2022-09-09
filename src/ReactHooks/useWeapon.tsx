import { useContext, useEffect, useState } from "react";
import { DatabaseContext } from "../Database/Database";

export default function useWeapon(weaponID: string | undefined = "") {
  const { database } = useContext(DatabaseContext)
  const [weapon, setWeapon] = useState(database.weapons.get(weaponID))
  useEffect(() => setWeapon(database.weapons.get(weaponID)), [database, weaponID])
  useEffect(() =>
    weaponID ? database.weapons.follow(weaponID, (k, r, v) => r === "update" && setWeapon(v)) : undefined,
    [weaponID, setWeapon, database])
  return weapon
}
