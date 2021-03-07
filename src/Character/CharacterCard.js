import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useReducer } from 'react';
import { Badge, Image } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Link } from 'react-router-dom';
import Artifact from '../Artifact/Artifact';
import Assets from '../Assets/Assets';
import { Stars } from '../Components/StarDisplay';
import { StatIconEle } from '../Components/StatIcon';
import Stat from '../Stat';
import Weapon from '../Weapon/Weapon';
import Character from './Character';
import CharacterDatabase from './CharacterDatabase';
export default function CharacterCard({ characterKey, onEdit, onDelete, cardClassName = "", bg = "", header, footer }) {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  useEffect(() => {
    Promise.all([
      Character.getCharacterDataImport(),
      Weapon.getWeaponDataImport(),
      Artifact.getDataImport(),
    ]).then(() => forceUpdate())
  }, [])
  const character = CharacterDatabase.get(characterKey)
  if (!character) return null;
  const build = Character.calculateBuild(character)
  const { setToSlots } = build

  const { weapon = {}, constellation } = character
  const name = Character.getName(characterKey)
  const elementKey = Character.getElementalKey(characterKey)
  const weaponTypeKey = Character.getWeaponTypeKey(characterKey)
  const weaponName = Weapon.getWeaponName(weapon.key)
  const weaponMainVal = Weapon.getWeaponMainStatValWithOverride(weapon)
  const weaponSubKey = Weapon.getWeaponSubStatKey(weapon.key)
  const weaponSubVal = Weapon.getWeaponSubStatValWithOverride(weapon)
  const weaponLevelName = Weapon.getLevelName(weapon.levelKey)
  const weaponPassiveName = Weapon.getWeaponPassiveName(weapon.key)
  const statkeys = ["finalHP", "finalATK", "finalDEF", "eleMas", "critRate_", "critDMG_", "enerRech_",]
  return (<Card className={cardClassName} bg={bg ? bg : "darkcontent"} text="lightfont">
    <Card.Header className="pr-2">
      <Row className="no-gutters">
        <Col >
          {header ? header : <h5><b>{name}</b></h5>}
        </Col>
        <Col xs={"auto"}>
          <span className="float-right align-top ml-1">
            {onEdit && <Button variant="primary" size="sm" className="mr-1"
              onClick={onEdit}>
              <FontAwesomeIcon icon={faEdit} />
            </Button>}
            {onDelete && <Button variant="danger" size="sm"
              onClick={onDelete}>
              <FontAwesomeIcon icon={faTrashAlt} />
            </Button>}
          </span>
        </Col>
      </Row>
    </Card.Header>
    <Card.Body onClick={onEdit} style={{ cursor: onEdit ? "pointer" : "default" }}>
      <Row>
        <Col xs="auto" className="pr-0">
          <Image src={Character.getThumb(characterKey)} className={`thumb-big grad-${Character.getStar(characterKey)}star p-0`} thumbnail />
        </Col>
        <Col>
          <h3 className="mb-0">{`Lvl. ${Character.getStatValueWithOverride(character, "characterLevel")} C${constellation}`}</h3>
          <h5 className="mb-0"><Stars stars={Character.getStar(characterKey)} colored /></h5>
          <h2 className="mb-0"><Image src={Assets.elements[elementKey]} className="inline-icon" /> <Image src={Assets.weaponTypes?.[weaponTypeKey]} className="inline-icon" /></h2>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
          <h6 className="mb-0">{weaponName}{weaponPassiveName && `(${weapon.refineIndex + 1})`} {weaponLevelName}</h6>
          <span>ATK: {weaponMainVal}  {weaponPassiveName && <span>{Stat.getStatName(weaponSubKey)}: {weaponSubVal}{Stat.getStatUnit(weaponSubKey)}</span>}</span>
        </Col>
      </Row>
      <Row>
        <Col>
          {Object.entries(Artifact.getSetEffects(setToSlots)).map(([key, arr]) => {
            let artifactSetName = Artifact.getSetName(key)
            let highestNum = Math.max(...arr)
            return <h5 key={key}><Badge variant="secondary">{artifactSetName} <Badge variant="success">{highestNum}</Badge></Badge></h5>
          })}
        </Col>
      </Row>
      <Row>
        {statkeys.map(statKey => {
          let unit = Stat.getStatUnit(statKey)
          let statVal = build.finalStats[statKey]
          return <Col xs={12} key={statKey}>
            <h6 className="d-inline">{StatIconEle(statKey)} {Stat.getStatName(statKey)}</h6>
            <span className={`float-right`}>
              {statVal?.toFixed(Stat.fixedUnit(statKey)) + unit}
            </span>
          </Col>
        })}
      </Row>
    </Card.Body>
    {footer && <Card.Footer>
      <Button as={Link} to={{
        pathname: "/build",
        characterKey
      }}>
        Generate Builds
        </Button>
    </Card.Footer>}
  </Card>)
}