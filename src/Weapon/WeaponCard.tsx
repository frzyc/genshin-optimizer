import { faBriefcase, faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"
import { Button, Card, Col, Dropdown, Image, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import Assets from "../Assets/Assets"
import CharacterSheet from "../Character/CharacterSheet"
import { CharacterSelectionDropdownList } from "../Components/CharacterSelection"
import { Stars } from "../Components/StarDisplay"
import StatIcon from "../Components/StatIcon"
import { database } from "../Database/Database"
import Stat from "../Stat"
import { CharacterKey } from "../Types/consts"
import { IWeapon } from "../Types/weapon"
import { usePromise } from "../Util/ReactUtil"
import WeaponSheet from "./WeaponSheet"

type CharacterCardProps = { weaponId: string, onEdit?: (weaponId: string) => void, onDelete?: (weaponId: string) => void, cardClassName: string, header?: JSX.Element, bg?: string, footer?: boolean }
export default function WeaponCard({ weaponId, onEdit, onDelete, cardClassName = "", bg = "", header, footer = false }: CharacterCardProps) {
  const { t } = useTranslation(["artifact"]);
  const [databaseWeapon, updateDatabaseWeapon] = useState(undefined as IWeapon | undefined)
  useEffect(() =>
    weaponId ? database.followWeapon(weaponId, updateDatabaseWeapon) : undefined,
    [weaponId, updateDatabaseWeapon])

  const weapon = databaseWeapon
  const weaponSheet = usePromise(weapon?.key && WeaponSheet.get(weapon.key), [weapon?.key])

  // const stats = useMemo(() => weapon && weaponSheet && weaponSheet && artifactSheets && Character.calculateBuild(weapon, weaponSheet, weaponSheet, artifactSheets), [weapon, weaponSheet, weaponSheet, artifactSheets])

  const characterSheet = usePromise(CharacterSheet.get(weapon?.location), [weapon?.location])
  if (!weapon || !weaponSheet) return null;
  const { level, ascension, refineIndex, id } = weapon
  const locationName = characterSheet?.name ? characterSheet.nameWIthIcon : <span><FontAwesomeIcon icon={faBriefcase} /> {t`filterLocation.inventory`}</span>
  const equipOnChar = (charKey: CharacterKey | "") => database.setWeaponLocation(weaponId, charKey)

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
      <Image src={Assets.weaponTypes?.[weaponTypeKey]} className="inline-icon" /> {process.env.NODE_ENV === "development" && <span className="text-warning">{id || `""`} </span>}<h5 className="d-inline">{weaponSheet.name}</h5>
    </Card.Header>
    <Card.Body onClick={() => onEdit?.(weaponId)} className={onEdit ? "cursor-pointer" : ""} >
      <Row>
        <Col xs="auto" className="pr-0">
          <Image src={weaponSheet.img} className={`thumb-big grad-${weaponSheet.rarity}star p-0`} thumbnail />
        </Col>
        <Col>
          <h5 className="mb-0">Level {weaponLevelName} </h5>
          <h5 >Refinement {refineIndex + 1}</h5>
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
    </Card.Body>
    {footer && <Card.Footer>
      <Row>
        <Col >
          <Dropdown>
            <Dropdown.Toggle size="sm" className="text-left">{locationName}</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => equipOnChar("")}><FontAwesomeIcon icon={faBriefcase} /> Inventory</Dropdown.Item>
              <Dropdown.Divider />
              <CharacterSelectionDropdownList onSelect={equipOnChar} />
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col xs={"auto"}>
          <span className="float-right align-top ml-1">
            {onEdit && <Button variant="primary" size="sm" className="mr-1"
              onClick={() => onEdit(weaponId)}>
              <FontAwesomeIcon icon={faEdit} />
            </Button>}
            {onDelete && <Button variant="danger" size="sm"
              onClick={() => onDelete(weaponId)}>
              <FontAwesomeIcon icon={faTrashAlt} />
            </Button>}
          </span>
        </Col>
      </Row>

    </Card.Footer>}
  </Card>)
}