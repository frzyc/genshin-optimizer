import { faEdit, faLock, faLockOpen, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
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
import Character from '../Character/Character';
import { CharacterSelectionDropdownList } from '../Components/CharacterSelection';
import { Stars } from '../Components/StarDisplay';
import Stat from '../Stat';
import Artifact from './Artifact';
import ArtifactDatabase from './ArtifactDatabase';
import PercentBadge from './PercentBadge';
export default function ArtifactCard({ artifactId, artifactObj, forceUpdate, onEdit, onDelete, assumeFull = false }) {
  if (!artifactId && !artifactObj) return null;
  const art = artifactObj ? artifactObj : ArtifactDatabase.get(artifactId);
  if (!art) return null;
  let { setKey, slotKey, numStars = 0, level = 0, mainStatKey, substats = [], location = "", lock, currentEfficiency = 0, maximumEfficiency = 0 } = art
  let mainStatLevel = assumeFull ? numStars * 4 : level
  let assFullColor = assumeFull && level !== numStars * 4
  let mainStatVal = <span className={assFullColor ? "text-orange" : ""}>{Artifact.getMainStatValue(mainStatKey, numStars, mainStatLevel, "")}{Stat.getStatUnit(mainStatKey)}</span>
  let artifactValid = substats.every(sstat => (!sstat.key || (sstat.key && sstat.value && sstat?.rolls?.length)))
  const equipOnChar = (charKey) => {
    Artifact.equipArtifactOnChar(artifactId, charKey)
    forceUpdate?.()
  }
  return (<Card className="h-100" border={`${numStars}star`} bg="lightcontent" text="lightfont">
    <Card.Header className="p-0">
      <Row>
        <Col xs={2} md={3}>
          <Image src={Artifact.getPieceIcon(setKey, slotKey)} className={`w-100 h-auto grad-${numStars}star m-1`} thumbnail />
        </Col>
        <Col className="pt-3">
          <h6><b>{Artifact.getPieceName(setKey, slotKey, "Unknown Piece Name")}</b></h6>
          <div>{Artifact.getSlotNameWithIcon(slotKey)}{` +${level}`}</div>
        </Col>
      </Row>
    </Card.Header>
    <Card.Body className="d-flex flex-column py-2">
      <Card.Title>
        <div>{Artifact.getSetName(setKey, "Artifact Set")}</div>
        <small className="text-halfsize"><Stars stars={numStars} /></small>
      </Card.Title>
      <h5 className="mb-1">
        <b>{Stat.getStatName(mainStatKey)} {mainStatVal}</b>
      </h5>
      <Row className="mb-0">
        {substats.map((stat, i) => {
          if (!stat || !stat.value) return null
          let numRolls = stat?.rolls?.length || 0
          let efficiency = stat?.efficiency || 0
          let effOpacity = 0.3 + efficiency * 0.7
          let statName = Stat.getStatName(stat.key)
          return (<Col key={i} xs={12}>
            <Badge variant={numRolls ? `${numRolls}roll` : "danger"} className="text-darkcontent"><b>{numRolls ? numRolls : "?"}</b></Badge>{" "}
            <span className={`text-${numRolls}roll`}>{statName}{`+${Stat.getStatUnit(stat.key) ? stat.value.toFixed(1) : stat.value}${Stat.getStatUnit(stat.key)}`}</span>
            <span className="float-right" style={{ opacity: effOpacity }}>{efficiency.toFixed(1)}%</span>
          </Col>)
        })}
      </Row>
      <div className="mt-auto">
        <span className="mb-0 mr-1">Substat Eff.:</span>
        <PercentBadge percent={currentEfficiency} valid={artifactValid}>
          {currentEfficiency?.toFixed(2) ?? currentEfficiency + "%"}
        </PercentBadge>
        <b>{" < "}</b>
        <PercentBadge percent={maximumEfficiency} valid={artifactValid}>
          {maximumEfficiency?.toFixed(2) ?? maximumEfficiency + "%"}
        </PercentBadge>
      </div>
    </Card.Body>

    <Card.Footer className="pr-3">
      <Row className="d-flex justify-content-between no-gutters">
        {forceUpdate ? <Col xs="auto">
          <Dropdown>
            <Dropdown.Toggle size="sm" className="text-left">{Character.getName(location, "Inventory")}</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => equipOnChar("")}>Inventory</Dropdown.Item>
              <Dropdown.Divider />
              <CharacterSelectionDropdownList onSelect={ckey => equipOnChar(ckey)} />
            </Dropdown.Menu>
          </Dropdown>
        </Col> : <Col xs="auto"><b>{Character.getName(location)}</b></Col>}
        <Col xs="auto">
          <ButtonGroup>
            {forceUpdate ? <OverlayTrigger placement="top"
              overlay={<Tooltip>Locking a artifact will prevent the build generator from picking it for builds. Artifacts on characters are locked by default.</Tooltip>}>
              <span className="d-inline-block">
                <Button size="sm"
                  disabled={location}
                  style={location ? { pointerEvents: 'none' } : {}}
                  onClick={() => {
                    art.lock = !lock
                    ArtifactDatabase.updateArtifact(art);
                    forceUpdate?.();
                  }}>
                  <FontAwesomeIcon icon={(lock || location) ? faLock : faLockOpen} className="fa-fw" />
                </Button>
              </span>
            </OverlayTrigger> : null}
            {Boolean(onEdit) && <Button variant="info" size="sm"
              onClick={() => onEdit()}>
              <FontAwesomeIcon icon={faEdit} className="fa-fw" />
            </Button>}
            {Boolean(onDelete) && <Button variant="danger" size="sm"
              onClick={() => onDelete()}>
              <FontAwesomeIcon icon={faTrashAlt} className="fa-fw" />
            </Button>}
          </ButtonGroup>
        </Col>
      </Row>
    </Card.Footer>
  </Card>)
}
