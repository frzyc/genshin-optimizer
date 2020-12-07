import React from 'react';
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Button from 'react-bootstrap/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons'
import Artifact from '../Artifact/Artifact';
export default class CharacterCard extends React.Component {
  render() {
    if (!this.props.characterData) return null;
    let char = this.props.characterData;

    const liElement = (key) =>
      (<li key={key}>
        <span>{Artifact.getStatName(key).split("%")[0]}</span>
        <span className="float-right">{char[key] + Artifact.getStatUnit(key)}</span>
      </li>)
    let mainArr = ["hp", "atk", "def", "ele_mas"]
    let mainEles = mainArr.map(liElement);
    let advArr = ["crit_rate", "crit_dmg", "heal_bonu", "ener_rech"]
    let advEles = advArr.map(liElement);
    let weaponAtk = (<li>
      <span>Weapon ATK</span>
      <span className="float-right">{char.weapon_atk}</span>
    </li>)
    let weaponSub = (<li>
      <span>{char.weaponStatKey ? (Artifact.getStatName(char.weaponStatKey).split("%")[0]):""}</span>
      <span className="float-right">{char.weaponStatVal + Artifact.getStatUnit(char.weaponStatKey)}</span>
    </li>)
    return (<Card className="h-100" border={`${char.numStars}star`} bg="darkcontent" text="lightfont">
      <Card.Header className="pr-2">
        <Row className="no-gutters">
          <Col >
            <h6><b>{`${char.name}`}</b></h6>
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
        <h5>Weapon</h5>
        <ul>{weaponAtk}{weaponSub}</ul>
        <h5>Main Stats</h5>
        <ul>{mainEles} </ul>
        <h5>Advanced Stats</h5>
        <ul>{advEles}</ul>

        {/* <ul className="mb-0">
          {char.substats ? char.substats.map((stat, i) =>
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
        </div> */}
      </Card.Body>
      {/* <Card.Footer>
        Location: Inventory
      </Card.Footer> */}
    </Card>)
  }
}