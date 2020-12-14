import React from 'react';
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Artifact from './Artifact'
import Button from 'react-bootstrap/Button'
import PercentBadge from './PercentBadge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faEdit, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons'
import SlotIcon from '../Components/SlotIcon';
import ArtifactDatabase from './ArtifactDatabase';
import CharacterDatabase from '../Character/CharacterDatabase';
import { Dropdown, DropdownButton } from 'react-bootstrap';
export default class ArtifactCard extends React.Component {
  equipOnChar(char) {
    let art = this.props.artifactData;
    let slotKey = art.slotKey
    let currentLocation = art.location;
    let intendedLocation = char ? char.id : ""
    let artifactToSwapWithid = CharacterDatabase.getArtifactIDFromSlot(intendedLocation, slotKey)
    let artifactToSwapWith = ArtifactDatabase.getArtifact(artifactToSwapWithid)

    //update artifact
    if (artifactToSwapWith) ArtifactDatabase.swapLocations(art, artifactToSwapWith)
    else ArtifactDatabase.moveToNewLocation(art.id, intendedLocation)

    //update Character
    if (intendedLocation)
      CharacterDatabase.equipArtifact(intendedLocation, art)

    if (currentLocation) {
      if (artifactToSwapWith)
        CharacterDatabase.equipArtifact(currentLocation, artifactToSwapWith)
      else
        CharacterDatabase.unequipArtifactOnSlot(currentLocation, slotKey)
    }
    this.props.forceUpdate && this.props.forceUpdate()
  }
  render() {
    if (!this.props.artifactData) return null;
    let art = this.props.artifactData;
    let artifactValidation = Artifact.artifactValidation(art)
    let locationChar = CharacterDatabase.getCharacter(art.location)
    let location = locationChar ? locationChar.name : "Inventory"
    return (<Card className="h-100" border={`${art.numStars}star`} bg="darkcontent" text="lightfont">
      <Card.Header className="pr-3">
        <Row className="no-gutters">
          <Col >
            <h6><b>{`${Artifact.getArtifactPieceName(art)}`}</b></h6>
            <div>{art.slotKey && <FontAwesomeIcon icon={SlotIcon[art.slotKey]} className="fa-fw" />}{` ${Artifact.getArtifactSlotName(art.slotKey)} +${art.level}`}</div>
          </Col>
          <Col xs={"auto"}>
            <span className="float-right align-top ml-1">
              {this.props.onEdit && <Button variant="primary" size="sm" className="mr-1"
                onClick={() => this.props.onEdit()}>
                <FontAwesomeIcon icon={faEdit} className="fa-fw" />
              </Button>}
              {this.props.onDelete && <Button variant="danger" size="sm"
                onClick={() => this.props.onDelete()}>
                <FontAwesomeIcon icon={faTrashAlt} className="fa-fw" />
              </Button>}
            </span>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="d-flex flex-column">
        <Card.Title>
          <h6>{art.mainStatKey ? `${Artifact.getStatName(art.mainStatKey).split("%")[0]} ${Artifact.getMainStatValue(art.mainStatKey, art.numStars, art.level)}${Artifact.getStatUnit(art.mainStatKey)}` : null}</h6>
        </Card.Title>
        <Card.Subtitle>
          <div>{Artifact.getArtifactSetName(art.setKey, "Artifact Set")}</div>
          <div>{"🟊".repeat(art.numStars ? art.numStars : 0)}</div>

        </Card.Subtitle>
        <ul className="mb-0">
          {art.substats ? art.substats.map((stat, i) =>
            (stat && stat.value) ? (<li key={i}>{`${Artifact.getStatName(stat.key).split("%")[0]}+${Artifact.getStatUnit(stat.key) ? stat.value.toFixed(1) : stat.value}${Artifact.getStatUnit(stat.key)}`}</li>) : null
          ) : null}
        </ul>
        <div className="mt-auto mb-n2">
          <span className="mb-0 mr-1">Substat Eff.:</span>
          <PercentBadge tooltip={artifactValidation.msg} valid={artifactValidation.valid} percent={artifactValidation.currentEfficiency}>
            {(artifactValidation.currentEfficiency ? artifactValidation.currentEfficiency : 0).toFixed(2) + "%"}
          </PercentBadge>
          <span>{"<"}</span>
          <PercentBadge tooltip={artifactValidation.msg} valid={artifactValidation.valid} percent={artifactValidation.maximumEfficiency}>
            {(artifactValidation.maximumEfficiency ? artifactValidation.maximumEfficiency : 0).toFixed(2) + "%"}
          </PercentBadge>
        </div>
      </Card.Body>
      <Card.Footer className="pr-3">
        <Row>
          <Col>
            <DropdownButton title={location}>
              <Dropdown.Item onClick={() => this.equipOnChar()}>
                Inventory
              </Dropdown.Item>
              {Object.entries(CharacterDatabase.getCharacterDatabase()).map(([id, char]) =>
                <Dropdown.Item key={id} onClick={() => this.equipOnChar(char)}>
                  {char.name}
                </Dropdown.Item>
              )}
            </DropdownButton>
          </Col>
          <Col xs="auto">
            <Button size="sm"
              disabled={art.location}
              onClick={() => {
                art.lock = !art.lock
                ArtifactDatabase.updateArtifact(art);
                this.forceUpdate();
              }}>
              <FontAwesomeIcon icon={(art.lock || art.location) ? faLock : faLockOpen} className="fa-fw" />
            </Button>
          </Col>
        </Row>
      </Card.Footer>
    </Card>)
  }
}