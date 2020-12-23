import React from 'react';
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Artifact from './Artifact'
import Button from 'react-bootstrap/Button'
import PercentBadge from './PercentBadge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faEdit, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons'
import ArtifactDatabase from './ArtifactDatabase';
import CharacterDatabase from '../Character/CharacterDatabase';
import { Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Stat from '../Stat';
import { Stars } from '../Components/StarDisplay';
export default class ArtifactCard extends React.Component {
  //the props is to update the artifacts in the list in the parent, which will update here.
  equipOnChar(charId) {
    Artifact.equipArtifactOnChar(this.props.artifactId, charId)
    this.props?.forceUpdate()
  }
  render() {
    if (!this.props.artifactId) return null;
    let art = ArtifactDatabase.getArtifact(this.props.artifactId);
    let artifactValidation = Artifact.artifactValidation(art)
    let locationChar = CharacterDatabase.getCharacter(art.location)
    let location = locationChar ? locationChar.name : "Inventory"
    return (<Card className="h-100" border={`${art.numStars}star`} bg="lightcontent" text="lightfont">
      <Card.Header className="pr-3">
        <Row className="no-gutters">
          <Col >
            <h6><b>{`${Artifact.getArtifactPieceName(art)}`}</b></h6>
            <div>{Artifact.getArtifactSlotNameWithIcon(art.slotKey)}{` +${art.level}`}</div>
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
          <div>{Artifact.getArtifactSetName(art.setKey, "Artifact Set")}</div>
          <small className="text-halfsize"><Stars stars={art.numStars}/></small>
        </Card.Title>
        <Card.Subtitle>
          <b>{art.mainStatKey ? `${Stat.getStatName(art.mainStatKey).split("%")[0]} ${Artifact.getMainStatValue(art.mainStatKey, art.numStars, art.level)}${Stat.getStatUnit(art.mainStatKey)}` : null}</b>
        </Card.Subtitle>
        <ul className="mb-0">
          {art.substats ? art.substats.map((stat, i) =>
            (stat && stat.value) ? (<li key={i}>{`${Stat.getStatName(stat.key).split("%")[0]}+${Stat.getStatUnit(stat.key) ? stat.value.toFixed(1) : stat.value}${Stat.getStatUnit(stat.key)}`}</li>) : null
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
      {this.props.forceUpdate ?
        <Card.Footer className="pr-3">
          <Row>
            <Col>
              <DropdownButton title={location}>
                <Dropdown.Item onClick={() => this.equipOnChar()}>
                  Inventory
              </Dropdown.Item>
                {Object.entries(CharacterDatabase.getCharacterDatabase()).map(([id, char]) =>
                  <Dropdown.Item key={id} onClick={() => this.equipOnChar(id)}>
                    {char.name}
                  </Dropdown.Item>
                )}
              </DropdownButton>
            </Col>
            <Col xs="auto">
              <OverlayTrigger placement="top"
                overlay={<Tooltip>
                  Locking a artifact will prevent the build generator from picking it for builds. Artifacts on characters are locked by default.
              </Tooltip>}>
                <span className="d-inline-block">
                  <Button size="sm"
                    disabled={art.location}
                    style={art.location ? { pointerEvents: 'none' } : {}}
                    onClick={() => {
                      art.lock = !art.lock
                      ArtifactDatabase.updateArtifact(art);
                      this.forceUpdate();
                    }}>
                    <FontAwesomeIcon icon={(art.lock || art.location) ? faLock : faLockOpen} className="fa-fw" />
                  </Button>
                </span>
              </OverlayTrigger>
            </Col>
          </Row>
        </Card.Footer> : <Card.Footer className="pr-3">
          <Row><Col>
            <span>Location: {location}</span>
          </Col></Row>
        </Card.Footer>}
    </Card>)
  }
}