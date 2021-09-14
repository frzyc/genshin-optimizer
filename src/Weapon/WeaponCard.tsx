import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useContext, useEffect, useState } from "react"
import { Button, Card, Col, Image, Row } from "react-bootstrap"
import Assets from "../Assets/Assets"
import EquipmentDropdown from "../Components/EquipmentDropdown"
import { Stars } from "../Components/StarDisplay"
import StatIcon from "../Components/StatIcon"
import { DatabaseContext } from "../Database/Database"
import Stat from "../Stat"
import { CharacterKey } from "../Types/consts"
import { ICachedWeapon } from "../Types/weapon"
import { usePromise } from "../Util/ReactUtil"
import WeaponSheet from "./WeaponSheet"

type WeaponCardProps = { weaponId: string, onEdit?: (weaponId: string) => void, onClick?: (weaponId: string) => void, onDelete?: (weaponId: string) => void, cardClassName: string, bg?: string, footer?: boolean }
export default function WeaponCard({ weaponId, onEdit, onDelete, onClick, cardClassName = "", bg = "", footer = false }: WeaponCardProps) {
  const database = useContext(DatabaseContext)
  const [databaseWeapon, updateDatabaseWeapon] = useState(undefined as ICachedWeapon | undefined)
  useEffect(() =>
    weaponId ? database.followWeapon(weaponId, updateDatabaseWeapon) : undefined,
    [weaponId, updateDatabaseWeapon, database])

  const weapon = databaseWeapon
  const weaponSheet = usePromise(weapon?.key && WeaponSheet.get(weapon.key), [weapon?.key])

  if (!weapon || !weaponSheet) return null;
  const { level, ascension, refine, id } = weapon
  const equipOnChar = (charKey: CharacterKey) => database.setWeaponLocation(weaponId, charKey)

  const weaponTypeKey = weaponSheet.weaponType
  const weaponMainVal = weaponSheet.getMainStatValue(level, ascension).toFixed(Stat.fixedUnit("atk"))
  const weaponSubKey = weaponSheet.getSubStatKey()
  const weaponSubVal = weaponSheet.getSubStatValue(level, ascension).toFixed(Stat.fixedUnit(weaponSubKey))
  const weaponLevelName = WeaponSheet.getLevelString(weapon)
  const weaponPassiveName = weaponSheet?.passiveName
  const statMap = [["weaponATK", weaponMainVal]]
  weaponPassiveName && statMap.push([weaponSubKey, weaponSubVal])

  return (<Card className={cardClassName} bg={bg ? bg : "darkcontent"} text={"lightfont" as any}>
    <Card.Header>
      <Image src={Assets.weaponTypes?.[weaponTypeKey]} className="inline-icon" /> <h5 className="d-inline">{weaponSheet.name}</h5>
    </Card.Header>
    <Card.Body onClick={() => onClick?.(weaponId)} className={onClick ? "cursor-pointer" : ""} >
      <Row>
        <Col xs="auto" className="pr-0">
          <Image src={weaponSheet.img} className={`thumb-big grad-${weaponSheet.rarity}star p-0`} thumbnail />
        </Col>
        <Col>
          <h5 className="mb-0">Level {weaponLevelName} </h5>
          <h5 >Refinement {refine}</h5>
          <h6 className="mb-0"><Stars stars={weaponSheet.rarity} colored /></h6>
          {/* <h3 className="mb-0"></h3> */}
        </Col>
      </Row>
      <Row>
        {statMap.map(([statKey, statVal]) => {
          let unit = Stat.getStatUnit(statKey)
          return <Col xs={12} key={statKey}>
            <h6 className="d-inline">{StatIcon[statKey]} {Stat.getStatName(statKey)}</h6>
            <span className={`float-right`}>
              {statVal + unit}
            </span>
          </Col>
        })}
      </Row>
      {process.env.NODE_ENV === "development" && <span className="text-warning">{id || `""`} </span>}
    </Card.Body>
    {footer && <Card.Footer>
      <Row>
        <Col >
          <EquipmentDropdown location={weapon?.location} onEquip={equipOnChar} weaponTypeKey={weaponTypeKey} disableUnequip={!!weapon.location} />
        </Col>
        <Col xs={"auto"}>
          <span className="float-right align-top ml-1">
            {onEdit && <Button variant="primary" size="sm" className="mr-1"
              onClick={() => onEdit(weaponId)}>
              <FontAwesomeIcon icon={faEdit} />
            </Button>}
            {onDelete && <Button variant="danger" size="sm"
              disabled={!!weapon.location}
              onClick={() => onDelete(weaponId)}>
              <FontAwesomeIcon icon={faTrashAlt} />
            </Button>}
          </span>
        </Col>
      </Row>

    </Card.Footer>}
  </Card>)
}