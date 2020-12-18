import { faDice, faDiceD20, faEdit, faFistRaised, faMagic, faShieldAlt, faSync, faTint, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Image } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Link } from 'react-router-dom';
import Artifact from '../Artifact/Artifact';
import Assets from '../Assets/Assets';
import { Stars } from '../Components/StarDisplay';
import Stat from '../Stat';
import Character from './Character';
export default function CharacterCard(props) {
  if (!props.characterData) return null;
  let { characterData: { id, characterKey, name, equippedArtifacts, weapon_atk, weaponStatKey, weaponStatVal, constellation } } = props
  let { characterData } = props
  let elementKey = Character.getElementalKey(characterKey)
  let weaponTypeKey = Character.getWeaponTypeKey(characterKey)
  let build = Character.calculateBuild(id, equippedArtifacts)
  let { artifactSetEffect } = build
  const statIcon = {
    hp: faTint,
    atk: faFistRaised,
    def: faShieldAlt,
    ele_mas: faMagic,
    crit_rate: faDice,
    crit_dmg: faDiceD20,
    ener_rech: faSync,
  }
  return (<Card className="h-100" bg="darkcontent" text="lightfont">
    <Card.Header className="pr-2">
      <Row className="no-gutters">
        <Col >
          <h6><b>{name}</b></h6>
        </Col>
        <Col xs={"auto"}>
          <span className="float-right align-top ml-1">
            <Button variant="primary" size="sm" className="mr-1"
              onClick={() => props?.onEdit()}>
              <FontAwesomeIcon icon={faEdit} />
            </Button>
            <Button variant="danger" size="sm"
              onClick={() => props?.onDelete()}>
              <FontAwesomeIcon icon={faTrashAlt} />
            </Button>
          </span>
        </Col>
      </Row>
    </Card.Header>
    <Card.Body>
      <Row>
        <Col xs="auto" className="pr-0">
          <Image src={Character.getThumb(characterKey)} className="h-100 w-auto my-n1" rounded />
        </Col>
        <Col>
          <h4>{Character.getName(characterKey)} <Image src={Assets.elements[elementKey]} className="inline-icon" /> <Image src={Assets.weapons?.[weaponTypeKey]} className="inline-icon" /></h4>
          <h6><Stars stars={Character.getStar(characterKey)} colored /></h6>
          <span>{`Lvl. ${Character.getLevelWithOverride(characterData)} C${constellation}`}</span>
        </Col>
      </Row>
      <Row>
        <Col>
          {weapon_atk ? <h6>Weapon Base ATK: {weapon_atk}</h6> : null}
          {weaponStatVal ? <span>SubStat: {Stat.getStatName(weaponStatKey)} {weaponStatVal}{Stat.getStatUnit(weaponStatKey)}</span> : null}
        </Col>
      </Row>
      <Row>
        <Col>
          {Object.entries(artifactSetEffect).map(([key, obj]) => {
            let artifactSetName = Artifact.getArtifactSetName(key)
            let highestNum = Math.max(...Object.keys(obj))
            return <span>{artifactSetName}({highestNum})</span>
          })}
        </Col>
      </Row>
      <Row>
        {Object.keys(statIcon).map(statKey => {
          // let statVal = Character.getStatValueWithOverride(characterData, statKey)
          let unit = Stat.getStatUnit(statKey)
          let statVal = build.finalStats[statKey]
          return <Col xs={12} key={statKey}>
            <h6 className="d-inline">{statIcon[statKey] && <FontAwesomeIcon icon={statIcon[statKey]} className="fa-fw" />} {Stat.getStatName(statKey)}</h6>
            <span className={`float-right`}>
              {statVal?.toFixed(unit === "%" ? 1 : 0) + unit}
            </span>
          </Col>
        })}
      </Row>
    </Card.Body>
    <Card.Footer>
      <Button as={Link} to={{
        pathname: "/build",
        selectedCharacterId: props.characterData.id
      }}>
        Generate Builds
        </Button>
    </Card.Footer>
  </Card>)
}