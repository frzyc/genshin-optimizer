import React from 'react';
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Button from 'react-bootstrap/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons'
import Artifact from '../Artifact/Artifact';
import { Link } from 'react-router-dom';
import { ElementalData } from '../Artifact/ArtifactData';
import ElementalIcon from '../Components/ElementalIcon';
export default class CharacterCard extends React.Component {
  render() {
    if (!this.props.characterData) return null;
    let char = this.props.characterData;

    const liElement = (key) =>
      (<li key={key}>
        <span>{Artifact.getStatName(key)}</span>
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
      <span>{Artifact.getStatName(char.weaponStatKey)}</span>
      <span className="float-right">{char.weaponStatVal + Artifact.getStatUnit(char.weaponStatKey)}</span>
    </li>)
    let specialized = (<li>
      <span>{Artifact.getStatName(char.specialStatKey)}</span>
      <span className="float-right">{char.specialStatVal + Artifact.getStatUnit(char.specialStatKey)}</span>
    </li>)
    return (<Card className="h-100" border={`${char.numStars}star`} bg="darkcontent" text="lightfont">
      <Card.Header className="pr-2">
        <Row className="no-gutters">
          <Col >
            <h6><b>{char.name}</b></h6>
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
        <h6><FontAwesomeIcon icon={ElementalIcon[char.element]} className="fa-fw" /> {ElementalData[char.element].name}</h6>
        <h5>Weapon</h5>
        <ul>{weaponAtk}{weaponSub}</ul>
        <h5>Main Stats</h5>
        <ul>{mainEles} </ul>
        <h5>Specialized Stat</h5>
        <ul>{specialized}</ul>
        <h5>Advanced Stats</h5>
        <ul>{advEles}</ul>
      </Card.Body>
      <Card.Footer>
        <Button as={Link} to={{
          pathname: "/build",
          selectedCharacterKey: this.props.characterData.id
        }}>
          Generate Builds
        </Button>
      </Card.Footer>
    </Card>)
  }
}