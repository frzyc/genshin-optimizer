import { faTimes } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useReducer, useState } from "react"
import { Button, ButtonGroup, Card, Col, Image, Modal, Row } from "react-bootstrap"
import Assets from "../Assets/Assets"
import { Stars } from "../Components/StarDisplay"
import usePromise from "../ReactHooks/usePromise"
import { allWeaponKeys, allWeaponTypeKeys, WeaponKey } from "../Types/consts"

import WeaponSheet from "./WeaponSheet"
type WeaponSelectionModalProps = {
  show: boolean,
  onHide: () => void,
  onSelect: (wKey: WeaponKey) => void,
  filter?: (sheet: WeaponSheet) => boolean
}

function filterReducer(oldFilter, newFilter) {
  if (newFilter === oldFilter)
    return ""
  return newFilter
}

export function WeaponSelectionModal({ show, onHide, onSelect, filter = () => true }: WeaponSelectionModalProps) {
  const weaponSheets = usePromise(WeaponSheet.getAll(), [])
  const [weaponFilter, weaponFilterDispatch] = useReducer(filterReducer, "")

  const weaponIdList = !weaponSheets ? [] : [...new Set(allWeaponKeys)].filter(wKey => filter(weaponSheets[wKey]))
    .filter(wKey => {
      if (weaponFilter && weaponFilter !== weaponSheets?.[wKey]?.weaponType) return false
      return true
    })
    .sort((a, b) => (weaponSheets?.[b]?.rarity ?? 0) - (weaponSheets?.[a]?.rarity ?? 0))

  if (!weaponSheets) return null
  return <Modal show={show} size="xl" contentClassName="bg-transparent" onHide={onHide}>
    <Card bg="lightcontent" text={"lightfont" as any}>
      <Card.Header>
        <Row>
          <Col>
            <ButtonGroup >
              {allWeaponTypeKeys.map(weaponType =>
                <Button key={weaponType} variant={(!weaponFilter || weaponFilter === weaponType) ? "success" : "secondary"} className="py-1 px-2" onClick={() => weaponFilterDispatch(weaponType)}>
                  <h3 className="mb-0"><Image src={Assets.weaponTypes?.[weaponType]} className="inline-icon" /></h3></Button>)}
            </ButtonGroup>
          </Col>
          <Col xs="auto">
            <Button onClick={onHide} variant="danger"><FontAwesomeIcon icon={faTimes} /></Button>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <Row>
          {weaponIdList.map(weaponKey => {
            const weaponSheet = weaponSheets[weaponKey]
            return <Col key={weaponKey} lg={3} md={4} className="mb-2">
              <Button className="w-100 h-100 align-top" variant="darkcontent" onClick={() => { onHide(); onSelect(weaponKey) }}>
                <Row className="h-100">
                  <Col xs="auto" className="pr-0">
                    <Image src={weaponSheet.img} className={`thumb-big grad-${weaponSheet.rarity}star p-0`} thumbnail />
                  </Col>
                  <Col>
                    <h5 className="mb-0"><Image src={Assets.weaponTypes?.[weaponSheet.weaponType]} className="inline-icon" /> {weaponSheet.name}</h5>
                    <h6 className="mb-0"><Stars stars={weaponSheet.rarity} colored /></h6>
                  </Col>
                </Row>
              </Button>
            </Col>
          })}
        </Row>
      </Card.Body>
    </Card>
  </Modal>
}

export function WeaponSelectionButton({ weaponSheet, onSelect, filter }: { weaponSheet?: WeaponSheet, onSelect: (wKey: WeaponKey) => void, filter?: (sheet: WeaponSheet) => boolean }) {
  const [show, setshow] = useState(false)
  return <>
    <Button as={ButtonGroup} onClick={() => setshow(true)} className="text-nowrap">{weaponSheet?.name ?? "Select a Weapon"}</Button>
    <WeaponSelectionModal show={show} onHide={() => setshow(false)} onSelect={onSelect} filter={filter} />
  </>
}