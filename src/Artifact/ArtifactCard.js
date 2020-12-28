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
      <Card.Header className="p-0">
        <Row className="no-gutters">
          <Col xs={2} md={3} className="pl-1">
            <Image src={Artifact.getArtifactPieceIcon(art.setKey, art.slotKey)} className="w-100 h-auto" />
          </Col>
          <Col className="pt-3">
            <h6><b>{`${Artifact.getArtifactPieceName(art.setKey, art.slotKey, "Unknown Piece Name")}`}</b></h6>
            <div>{Artifact.getArtifactSlotNameWithIcon(art.slotKey)}{` +${art.level}`}</div>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="d-flex flex-column">
        <Card.Title>
          <div>{Artifact.getArtifactSetName(art.setKey, "Artifact Set")}</div>
          <small className="text-halfsize"><Stars stars={art.numStars} /></small>
        </Card.Title>
        <Card.Subtitle>
          <b>{art.mainStatKey ? `${Stat.getStatName(art.mainStatKey).split("%")[0]} ${Artifact.getMainStatValue(art.mainStatKey, art.numStars, art.level)}${Stat.getStatUnit(art.mainStatKey)}` : null}</b>
        </Card.Subtitle>
        <Row className="mb-0">
          {art.substats ? art.substats.map((stat, i) => {
            if (!stat || !stat.value) return null
            let subStatValidation = artifactValidation.subStatValidations[i]
            let numRolls = subStatValidation?.rolls?.length || 0
            let efficiency = subStatValidation?.efficiency || 0
            let effOpacity = 0.3 + efficiency * 0.7
            return (<Col key={i} xs={12}>
              <Badge variant={artifactValidation.valid ? `${numRolls}roll` : "danger"} className="text-darkcontent"><b>{artifactValidation.valid ? numRolls : "?"}</b></Badge>{" "}
              <span className={`text-${numRolls}roll`}>{`${Stat.getStatName(stat.key).split("%")[0]}+${Stat.getStatUnit(stat.key) ? stat.value.toFixed(1) : stat.value}${Stat.getStatUnit(stat.key)}`}</span>
              <span className="float-right" style={{ opacity: effOpacity }}>{efficiency.toFixed(1)}%</span>
            </Col>)
          }
          ) : null}
        </Row>
        <div className="mt-auto mb-n2">
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
          {this.props.forceUpdate ? <Col xs="auto">
            <Dropdown>
              <Dropdown.Toggle size="sm">{location}</Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => this.equipOnChar()}>Inventory</Dropdown.Item>
                {Object.entries(CharacterDatabase.getCharacterDatabase()).map(([id, char]) =>
                  <Dropdown.Item key={id} onClick={() => this.equipOnChar(id)}>
                    {char.name}
                  </Dropdown.Item>)}
              </Dropdown.Menu>
            </Dropdown>
          </Col> : <Col xs="auto"><span>Location: {location}</span></Col>}
          <Col xs="auto">
            <ButtonGroup>
              {this.props.forceUpdate ? <OverlayTrigger placement="top"
                overlay={<Tooltip>Locking a artifact will prevent the build generator from picking it for builds. Artifacts on characters are locked by default.</Tooltip>}>
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
              </OverlayTrigger> : null}
              {this.props.onEdit && <Button variant="info" size="sm"
                onClick={() => this.props.onEdit()}>
                <FontAwesomeIcon icon={faEdit} className="fa-fw" />
              </Button>}
              {this.props.onDelete && <Button variant="danger" size="sm"
                onClick={() => this.props.onDelete()}>
                <FontAwesomeIcon icon={faTrashAlt} className="fa-fw" />
              </Button>}
            </ButtonGroup>
          </Col>
        </Row>
      </Card.Footer>
    </Card>)
  }
}