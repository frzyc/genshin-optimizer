import { faEdit, faLock, faLockOpen, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Badge, ButtonGroup, Dropdown, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import CharacterDatabase from '../Character/CharacterDatabase';
import { Stars } from '../Components/StarDisplay';
import Stat from '../Stat';
import Artifact from './Artifact';
import ArtifactDatabase from './ArtifactDatabase';
import PercentBadge from './PercentBadge';
export default function ArtifactCard({ artifactId, forceUpdate, onEdit, onDelete, assumeFull = false }) {
  if (!artifactId) return null;
  const equipOnChar = (charId) => {
    Artifact.equipArtifactOnChar(artifactId, charId)
    forceUpdate?.()
  }

  let art = ArtifactDatabase.getArtifact(artifactId);
  let artifactValidation = Artifact.artifactValidation(art)
  let locationChar = CharacterDatabase.getCharacter(art.location)
  let location = locationChar ? locationChar.name : "Inventory"
  let mainStatLevel = assumeFull ? art.numStars * 4 : art.level
  let assFullColor = assumeFull && art.level !== art.numStars * 4
  let mainStatVal = <span className={assFullColor ? "text-orange" : ""}>{Artifact.getMainStatValue(art.mainStatKey, art.numStars, mainStatLevel, "")}{Stat.getStatUnit(art.mainStatKey)}</span>
  return (<Card className="h-100" border={`${art.numStars}star`} bg="lightcontent" text="lightfont">
    <Card.Header className="p-0">
      <Row>
        <Col xs={2} md={3}>
          <Image src={Artifact.getPieceIcon(art.setKey, art.slotKey)} className={`w-100 h-auto grad-${art.numStars}star m-1`} thumbnail />
        </Col>
        <Col className="pt-3">
          <h6><b>{Artifact.getPieceName(art.setKey, art.slotKey, "Unknown Piece Name")}</b></h6>
          <div>{Artifact.getSlotNameWithIcon(art.slotKey)}{` +${art.level}`}</div>
        </Col>
      </Row>
    </Card.Header>
    <Card.Body className="d-flex flex-column py-2">
      <Card.Title>
        <div>{Artifact.getSetName(art.setKey, "Artifact Set")}</div>
        <small className="text-halfsize"><Stars stars={art.numStars} /></small>
      </Card.Title>
      <h5 className="mb-1">
        <b>{Stat.getStatName(art.mainStatKey)} {mainStatVal}</b>
      </h5>
      <Row className="mb-0">
        {art.substats ? art.substats.map((stat, i) => {
          if (!stat || !stat.value) return null
          let subStatValidation = artifactValidation.subStatValidations[i]
          let numRolls = subStatValidation?.rolls?.length || 0
          let efficiency = subStatValidation?.efficiency || 0
          let effOpacity = 0.3 + efficiency * 0.7
          let statName = Stat.getStatName(stat.key)
          return (<Col key={i} xs={12}>
            <Badge variant={artifactValidation.valid ? `${numRolls}roll` : "danger"} className="text-darkcontent"><b>{artifactValidation.valid ? numRolls : "?"}</b></Badge>{" "}
            <span className={`text-${numRolls}roll`}>{statName}{`+${Stat.getStatUnit(stat.key) ? stat.value.toFixed(1) : stat.value}${Stat.getStatUnit(stat.key)}`}</span>
            <span className="float-right" style={{ opacity: effOpacity }}>{efficiency.toFixed(1)}%</span>
          </Col>)
        }
        ) : null}
      </Row>
      <div className="mt-auto">
        <span className="mb-0 mr-1">Substat Eff.:</span>
        <PercentBadge tooltip={artifactValidation.msg} valid={artifactValidation.valid} percent={artifactValidation.currentEfficiency}>
          {(artifactValidation.currentEfficiency ? artifactValidation.currentEfficiency : 0).toFixed(2) + "%"}
        </PercentBadge>
        <b>{" < "}</b>
        <PercentBadge tooltip={artifactValidation.msg} valid={artifactValidation.valid} percent={artifactValidation.maximumEfficiency}>
          {(artifactValidation.maximumEfficiency ? artifactValidation.maximumEfficiency : 0).toFixed(2) + "%"}
        </PercentBadge>
      </div>
    </Card.Body>

    <Card.Footer className="pr-3">
      <Row className="d-flex justify-content-between no-gutters">
        {forceUpdate ? <Col xs="auto">
          <Dropdown>
            <Dropdown.Toggle size="sm">{location}</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => equipOnChar()}>Inventory</Dropdown.Item>
              {Object.entries(CharacterDatabase.getCharacterDatabase()).map(([id, char]) =>
                <Dropdown.Item key={id} onClick={() => equipOnChar(id)}>
                  {char.name}
                </Dropdown.Item>)}
            </Dropdown.Menu>
          </Dropdown>
        </Col> : <Col xs="auto"><span>Location: {location}</span></Col>}
        <Col xs="auto">
          <ButtonGroup>
            {forceUpdate ? <OverlayTrigger placement="top"
              overlay={<Tooltip>Locking a artifact will prevent the build generator from picking it for builds. Artifacts on characters are locked by default.</Tooltip>}>
              <span className="d-inline-block">
                <Button size="sm"
                  disabled={art.location}
                  style={art.location ? { pointerEvents: 'none' } : {}}
                  onClick={() => {
                    art.lock = !art.lock
                    ArtifactDatabase.updateArtifact(art);
                    forceUpdate?.();
                  }}>
                  <FontAwesomeIcon icon={(art.lock || art.location) ? faLock : faLockOpen} className="fa-fw" />
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
