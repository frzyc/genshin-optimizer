import React from 'react';
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Artifact from './Artifact'
import Button from 'react-bootstrap/Button'
import PercentBadge from './PercentBadge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons'
export default class ArtifactCard extends React.Component {
  render() {
    if (!this.props.artifactData) return null;
    let art = this.props.artifactData;
    let artifactValidation = Artifact.artifactValidation(art)
    return (<Card className="h-100" border={`${art.numStars}star`} bg="darkcontent" text="lightfont">
      <Card.Header className="pr-2">
        <Row className="no-gutters">
          <Col >
            <h6><b>{`${Artifact.getArtifactPieceName(art)}`}</b></h6>
            <div>{`${Artifact.getArtifactSlotName(art.slotKey)} +${art.level}`}</div>
          </Col>
          <Col xs={"auto"}>
            <span className="float-right align-top ml-1">
              <Button variant="primary" size="sm" className="mr-1"
                onClick={() => this.props.onEdit && this.props.onEdit()}>
                <FontAwesomeIcon icon={faEdit} />
              </Button>
              <Button variant="danger" size="sm"
                onClick={() => this.props.onDelete && this.props.onDelete()}>
                <FontAwesomeIcon icon={faTrashAlt} />
              </Button>
            </span>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <Card.Title>
          <h6>{art.mainStatKey ? `${Artifact.getStatName(art.mainStatKey).split("%")[0]} ${Artifact.getMainStatValue(art)}${Artifact.getStatUnit(art.mainStatKey)}` : null}</h6>
        </Card.Title>
        <Card.Subtitle>
          <div>{Artifact.getArtifactSetName(art)}</div>
          <div>{"🟊".repeat(art.numStars ? art.numStars : 0)}</div>

        </Card.Subtitle>
        <ul className="mb-0">
          {art.substats ? art.substats.map((stat, i) =>
            (stat && stat.value) ? (<li key={i}>{`${Artifact.getStatName(stat.key).split("%")[0]}+${stat.value}${Artifact.getStatUnit(stat.key)}`}</li>) : null
          ) : null}
        </ul>
        <div>
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
      <Card.Footer>
        Location: Inventory
          {/* <Button variant="primary"
            onClick={() => this.props.onEdit && this.props.onEdit()}
          >Edit</Button>
          <Button className="float-right" variant="danger"
            onClick={() => this.props.onDelete && this.props.onDelete()}>Delete</Button> */}
      </Card.Footer>
    </Card>)
  }
}