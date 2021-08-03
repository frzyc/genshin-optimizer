import { faEdit, faLock, faLockOpen, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import Image from 'react-bootstrap/Image';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Row from 'react-bootstrap/Row';
import Tooltip from 'react-bootstrap/Tooltip';
import CharacterSheet from '../Character/CharacterSheet';
import { CharacterSelectionDropdownList } from '../Components/CharacterSelection';
import { Stars } from '../Components/StarDisplay';
import { database } from '../Database/Database';
import Stat from '../Stat';
import { allSubstats, IArtifact, Substat, SubstatKey } from '../Types/artifact';
import { CharacterKey } from '../Types/consts';
import { usePromise } from '../Util/ReactUtil';
import { valueString } from '../Util/UIUtil';
import Artifact from './Artifact';
import { ArtifactSheet } from './ArtifactSheet';
import SlotNameWithIcon from './Component/SlotNameWIthIcon';
import PercentBadge from './PercentBadge';

type Data = { artifactId?: string, artifactObj?: IArtifact, onEdit?: () => void, onDelete?: () => void, mainStatAssumptionLevel?: number, effFilter?: Set<SubstatKey> }
const allSubstatFilter = new Set(allSubstats)

export default function ArtifactCard({ artifactId, artifactObj, onEdit, onDelete, mainStatAssumptionLevel = 0, effFilter = allSubstatFilter }: Data): JSX.Element | null {
  const [databaseArtifact, updateDatabaseArtifact] = useState(undefined as IArtifact | undefined)
  useEffect(() =>
    artifactId ? database.followArt(artifactId, updateDatabaseArtifact) : undefined,
    [artifactId, updateDatabaseArtifact])
  const sheet = usePromise(ArtifactSheet.get((artifactObj ?? (artifactId ? database._getArt(artifactId) : undefined))?.setKey), [artifactObj, artifactId])
  const equipOnChar = (charKey: CharacterKey | "") => database.setLocation(artifactId!, charKey)

  const editable = !artifactObj // dont allow edit for flex artifacts
  const art = artifactObj ?? databaseArtifact
  const characterSheet = usePromise(CharacterSheet.get(art?.location ?? ""), [art?.location])
  if (!art) return null
  if (art.substats[0].rolls === undefined) Artifact.substatsValidation(art)

  const { id, slotKey, numStars, level, mainStatKey, substats, lock } = art
  const mainStatLevel = Math.max(Math.min(mainStatAssumptionLevel, numStars * 4), level)
  const mainStatVal = <span className={mainStatLevel !== level ? "text-orange" : ""}>{valueString(Artifact.mainStatValue(mainStatKey, numStars, mainStatLevel) ?? 0, Stat.getStatUnit(mainStatKey))}</span>
  const { currentEfficiency, maxEfficiency } = Artifact.getArtifactEfficiency(art, effFilter)
  const artifactValid = maxEfficiency !== 0
  const locationName = characterSheet?.name ?? "Inventory"
  return (<Card className="h-100" border={`${numStars}star`} bg="lightcontent" text={"lightfont" as any}>
    <Card.Header className="p-0">
      <Row>
        <Col xs={2} md={3}>
          <Image src={sheet?.slotIcons[slotKey] ?? ""} className={`w-100 h-auto grad-${numStars}star m-1`} thumbnail />
        </Col>
        <Col className="pt-3">
          <h6><b>{sheet?.getSlotName(slotKey) ?? "Unknown Piece Name"}</b></h6>
          <div><SlotNameWithIcon slotKey={slotKey} />{` +${level}`}</div>
        </Col>
      </Row>
    </Card.Header>
    <Card.Body className="d-flex flex-column py-2">
      <Card.Title>
        <div>{sheet?.name ?? "Artifact Set"}</div>
        <small className="text-halfsize"><Stars stars={numStars} /></small>
      </Card.Title>
      <h5 className="mb-1">
        <b>{Stat.getStatName(mainStatKey)} {mainStatVal}</b>
      </h5>
      <Row className="mb-0">
        {substats.map((stat: Substat, i) => {
          if (!stat.value) return null
          let numRolls = stat.rolls?.length ?? 0
          let efficiency = stat.efficiency ?? 0
          let effOpacity = 0.3 + efficiency * 0.7
          let statName = Stat.getStatName(stat.key)
          return (<Col key={i} xs={12}>
            <Badge variant={numRolls ? `${numRolls}roll` : "danger"} className="text-darkcontent"><b>{numRolls ? numRolls : "?"}</b></Badge>{" "}
            <span className={`text-${numRolls}roll`}>{statName}{`+${valueString(stat.value, Stat.getStatUnit(stat.key))}`}</span>
            <span className="float-right" style={{ opacity: effOpacity }}>{stat.key && effFilter.has(stat.key) ? valueString(efficiency, "eff") : "-"}</span>
          </Col>)
        })}
      </Row>
      <Row className="mt-auto">
        <Col>Current SS Eff.: <PercentBadge value={currentEfficiency} valid={artifactValid} {...{ className: "float-right" }} /></Col>
        {currentEfficiency !== maxEfficiency && <Col className="text-right">Max SS Eff.: <PercentBadge value={maxEfficiency} valid={artifactValid} /></Col>}
      </Row>
    </Card.Body>

    <Card.Footer className="pr-3">
      <Row className="d-flex justify-content-between no-gutters">
        {editable ? <Col xs="auto">
          <Dropdown>
            <Dropdown.Toggle size="sm" className="text-left">{locationName}</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => equipOnChar("")}>Inventory</Dropdown.Item>
              <Dropdown.Divider />
              <CharacterSelectionDropdownList onSelect={equipOnChar} />
            </Dropdown.Menu>
          </Dropdown>
        </Col> : <Col xs="auto"><b>{locationName}</b></Col>}
        <Col xs="auto">
          <ButtonGroup>
            {editable ? <OverlayTrigger placement="top"
              overlay={<Tooltip id="lock-artifact-tip">Locking a artifact will prevent the build generator from picking it for builds.</Tooltip>}>
              <span className="d-inline-block">
                <Button size="sm" onClick={() => database.lockArtifact(id, !lock)}>
                  <FontAwesomeIcon icon={lock ? faLock : faLockOpen} className="fa-fw" />
                </Button>
              </span>
            </OverlayTrigger> : null}
            {!!onEdit && <Button variant="info" size="sm"
              onClick={onEdit}>
              <FontAwesomeIcon icon={faEdit} className="fa-fw" />
            </Button>}
            {!!onDelete && <Button variant="danger" size="sm"
              onClick={onDelete}>
              <FontAwesomeIcon icon={faTrashAlt} className="fa-fw" />
            </Button>}
          </ButtonGroup>
        </Col>
      </Row>
    </Card.Footer>
  </Card>)
}
