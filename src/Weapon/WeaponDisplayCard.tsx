import { faExchangeAlt, faTimes } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { useCallback, useEffect, useReducer } from "react"
import { Badge, Button, ButtonGroup, Card, Col, Dropdown, Image, InputGroup, Row } from "react-bootstrap"
import CharacterSheet from "../Character/CharacterSheet"
import CustomFormControl from "../Components/CustomFormControl"
import DocumentDisplay from "../Components/DocumentDisplay"
import EquipmentDropdown from "../Components/EquipmentDropdown"
import { Stars } from "../Components/StarDisplay"
import { ascensionMaxLevel, milestoneLevels } from "../Data/CharacterData"
import { database } from "../Database/Database"
import { ICharacter } from "../Types/character"
import { WeaponKey, WeaponTypeKey } from "../Types/consts"
import { ICalculatedStats } from "../Types/stats"
import { IWeapon } from "../Types/weapon"
import { usePromise } from "../Util/ReactUtil"
import { clamp } from "../Util/Util"
import WeaponDropdown from "./WeaponDropdown"
import WeaponSheet from "./WeaponSheet"
import WeaponStatsCard from "./WeaponStatsCard"

export function defaultInitialWeaponKey(type: WeaponTypeKey): WeaponKey {
  switch (type) {
    case "sword":
      return "DullBlade"
    case "bow":
      return "DullBlade"
    case "claymore":
      return "WasterGreatsword"
    case "polearm":
      return "BeginnersProtector"
    case "catalyst":
      return "ApprenticesNotes"

    default:
      return "DullBlade"
  }
}

export const initialWeapon = (key): IWeapon => ({
  id: "",
  key: key ?? "",
  level: 1,
  ascension: 0,
  refineIndex: 0,
  location: ""
})

function weaponReducer(state: IWeapon, action: any) {
  return { ...state, ...action }
}
type WeaponStatsEditorCardProps = {
  weaponId?: string,
  weaponTypeKey?: WeaponTypeKey
  charData?: {
    character: ICharacter,
    characterSheet: CharacterSheet,
    equippedBuild?: ICalculatedStats
    newBuild?: ICalculatedStats,
    characterDispatch: (any) => void
  }
  editable?: boolean
  canSwap?: boolean
  onClose?: () => void
}
export default function WeaponDisplayCard({
  weaponId: propWeaponId,
  weaponTypeKey,
  // characterSheet,
  // weaponSheet,
  editable = false,
  charData,
  // character,
  // character: { weapon },
  // characterDispatch,
  // equippedBuild,
  // newBuild
  canSwap = false,
  onClose
}: WeaponStatsEditorCardProps) {
  const [weapon, weaponDispatch] = useReducer(weaponReducer, propWeaponId ? database._getWeapon(propWeaponId) : initialWeapon(weaponTypeKey ? defaultInitialWeaponKey(weaponTypeKey) : ""))
  const { key, level, refineIndex, location, ascension, id } = weapon
  const weaponSheet = usePromise(WeaponSheet.get(key), [key])

  //save weapons on edit
  useEffect(() => {
    if (weapon.key) {
      const newId = database.updateWeapon(weapon)
      if (newId !== weapon.id) weaponDispatch({ id: newId })
    }
  }, [weapon])

  //save weaponid if has charData
  useEffect(() => {
    if (charData && charData.character.equippedWeapon !== id)
      database.setWeaponLocation(id, charData.character.characterKey)
  }, [id, charData])

  useEffect(() => {
    if (!propWeaponId) return
    const weapon = { ...initialWeapon(""), ...database._getWeapon(propWeaponId) }
    weaponDispatch(weapon)
  }, [propWeaponId])

  const setLevel = useCallback((newLevel) => {
    newLevel = clamp(newLevel, 1, 90)
    const ascension = ascensionMaxLevel.findIndex(ascenML => newLevel <= ascenML)
    weaponDispatch({ level: newLevel, ascension })
  }, [weaponDispatch])

  const ambiguousLevel = ascensionMaxLevel.findIndex(ascenML => level !== 90 && level === ascenML) > 0
  const setAscension = useCallback(() => {
    const lowerAscension = ascensionMaxLevel.findIndex(ascenML => level !== 90 && level === ascenML)
    if (ascension === lowerAscension) weaponDispatch({ ascension: ascension + 1 })
    else weaponDispatch({ ascension: lowerAscension })
  }, [weaponDispatch, ascension, level])

  const build = { ...(charData ? (charData.newBuild ? charData.newBuild : charData.equippedBuild) : {}), weapon: { refineIndex: refineIndex, level, ascension } } as any

  return <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
    <Card.Header>
      <Row>
        <Col>
          {editable ? <InputGroup >
            <ButtonGroup as={InputGroup.Prepend}>
              <WeaponDropdown weaponKey={key} setWeaponKey={k => weaponDispatch({ key: k })} weaponTypeKey={weaponTypeKey} />
              <Dropdown as={ButtonGroup}>
                <Dropdown.Toggle as={Button}>Refinement {refineIndex + 1}</Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.ItemText>
                    <span>Select Weapon Refinement</span>
                  </Dropdown.ItemText>
                  <Dropdown.Divider />
                  {[...Array(5).keys()].map(key =>
                    <Dropdown.Item key={key} onClick={() => weaponDispatch({ refineIndex: key })}>
                      {`Refinement ${key + 1}`}
                    </Dropdown.Item>)}
                </Dropdown.Menu>
              </Dropdown>
            </ButtonGroup>
            <InputGroup.Prepend>
              <InputGroup.Text><strong>Lvl. </strong></InputGroup.Text>
            </InputGroup.Prepend>
            <InputGroup.Append>
              <CustomFormControl placeholder={undefined} onChange={setLevel} value={level} min={1} max={90} />
            </InputGroup.Append>
            <InputGroup.Append>
              <Button disabled={!ambiguousLevel} onClick={setAscension}><strong>/ {ascensionMaxLevel[ascension]}</strong></Button>
            </InputGroup.Append>
            <ButtonGroup as={InputGroup.Append}>
              <Dropdown as={ButtonGroup}>
                <Dropdown.Toggle as={Button}>Select Level</Dropdown.Toggle>
                <Dropdown.Menu>
                  {milestoneLevels.map(([lv, as]) => {
                    const sameLevel = lv === ascensionMaxLevel[as]
                    const lvlstr = sameLevel ? `Lv. ${lv}` : `Lv. ${lv}/${ascensionMaxLevel[as]}`
                    return <Dropdown.Item key={`${lv}/${as}`} onClick={() => weaponDispatch({ level: lv, ascension: as })}>{lvlstr}</Dropdown.Item>
                  })}
                </Dropdown.Menu>
              </Dropdown>
            </ButtonGroup>
          </InputGroup> : <span>Weapon</span>}
        </Col>
        {!!onClose && <Col xs="auto" >
          <Button variant="danger" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} /></Button>
        </Col>}
        {!!canSwap && <Col xs="auto">
          <Button variant="info" ><FontAwesomeIcon icon={faExchangeAlt} /> SWAP WEAPON</Button>
        </Col>
        }
      </Row>
    </Card.Header>
    <Card.Body >
      {(() => {
        if (!weaponSheet) return null
        const substatKey = weaponSheet.getSubStatKey()
        const weaponDisplayMainVal = weaponSheet.getMainStatValue(level, ascension)
        const weaponDisplaySubVal = weaponSheet.getSubStatValue(level, ascension)
        const weaponPassiveName = weaponSheet.passiveName
        const weaponBonusStats = weaponSheet.stats(build)
        const sections = weaponSheet.document

        return <Row className="mb-n2">
          <Col xs={12} md={3} lg={4}>
            <Image src={weaponSheet.img} className={`w-100 h-auto grad-${weaponSheet.rarity}star`} thumbnail />
            <small>{weaponSheet.description}</small>
          </Col>
          <Col>
            <h5 className="mb-0">{process.env.NODE_ENV === "development" && <span className="text-warning">{id || `""`} </span>}{weaponSheet.name} Lv. {WeaponSheet.getLevelString(weapon)} {weaponPassiveName && <Badge variant="info">Refinement {refineIndex + 1}</Badge>}</h5>
            <div className="mb-2"><Stars stars={weaponSheet.rarity} /></div>
            <h6>{weaponPassiveName}</h6>
            <div className="mb-2">{weaponPassiveName && weaponSheet.passiveDescription({ weapon: { refineIndex: refineIndex } } as any)}</div>
            <WeaponStatsCard title={"Main Stats"} statsVals={{ atk: weaponDisplayMainVal, [substatKey]: substatKey ? weaponDisplaySubVal : undefined }} stats={build} />
            <WeaponStatsCard title={"Bonus Stats"} statsVals={weaponBonusStats} stats={build} />
            {charData && sections ? (() => {
              const { equippedBuild, newBuild, characterDispatch } = charData
              return < DocumentDisplay  {...{ sections, equippedBuild, newBuild, characterDispatch, editable }} />
            })() : null}
          </Col>
        </Row>
      })()}
    </Card.Body>
    <Card.Footer><Row>
      <Col><EquipmentDropdown location={location} onEquip={cKey => database.setWeaponLocation(id, cKey)} /></Col>
      {!!onClose && <Col xs="auto"><Button variant="danger" onClick={onClose}>Close</Button></Col>}
    </Row></Card.Footer>
  </Card>
}
