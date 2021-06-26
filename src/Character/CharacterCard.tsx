import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useMemo } from 'react';
import { Badge, Image } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Link } from 'react-router-dom';
import { ArtifactSheet } from '../Artifact/ArtifactSheet';
import Assets from '../Assets/Assets';
import { Stars } from '../Components/StarDisplay';
import { StatIconEle } from '../Components/StatIcon';
import CharacterDatabase from '../Database/CharacterDatabase';
import Stat from '../Stat';
import { CharacterKey } from '../Types/consts';
import { useForceUpdate, usePromise } from '../Util/ReactUtil';
import Weapon from '../Weapon/Weapon';
import WeaponSheet from '../Weapon/WeaponSheet';
import Character from './Character';
import CharacterSheet from './CharacterSheet';
type CharacterCardProps = { characterKey: CharacterKey | "", onEdit?: (any) => void, onDelete?: (any) => void, cardClassName: string, header?: JSX.Element, bg?: string, footer?: boolean }
export default function CharacterCard({ characterKey, onEdit, onDelete, cardClassName = "", bg = "", header, footer = false }: CharacterCardProps) {
  const [, forceUpdate] = useForceUpdate()
  useEffect(() => {
    characterKey && CharacterDatabase.registerCharListener(characterKey, forceUpdate)
    return () => { characterKey && CharacterDatabase.unregisterCharListener(characterKey, forceUpdate) }
  }, [characterKey, forceUpdate])
  const artifactSheets = usePromise(ArtifactSheet.getAll())
  const character = CharacterDatabase.get(characterKey)
  const characterSheet = usePromise(CharacterSheet.get(characterKey))
  const weaponSheet = usePromise(character && WeaponSheet.get(character.weapon.key))
  const stats = useMemo(() => character && characterSheet && weaponSheet && artifactSheets && Character.calculateBuild(character, characterSheet, weaponSheet, artifactSheets), [character, characterSheet, weaponSheet, artifactSheets])
  if (!character || !characterSheet || !weaponSheet || !stats) return null;

  const { weapon, constellation } = character
  const name = characterSheet.name
  const elementKey = stats.characterEle
  const weaponTypeKey = characterSheet.weaponTypeKey
  const weaponName = weaponSheet?.name
  const weaponMainVal = Weapon.getWeaponMainStatValWithOverride(weapon, weaponSheet)
  const weaponSubKey = Weapon.getWeaponSubstatKey(weaponSheet)
  const weaponSubVal = Weapon.getWeaponSubstatValWithOverride(weapon, weaponSheet)
  const weaponLevelName = Weapon.getLevelName(weapon.levelKey)
  const weaponPassiveName = weaponSheet?.passiveName
  const statkeys = ["finalHP", "finalATK", "finalDEF", "eleMas", "critRate_", "critDMG_", "enerRech_",]
  return (<Card className={cardClassName} bg={bg ? bg : "darkcontent"} text={"lightfont" as any}>
    <Card.Header className="pr-2">
      <Row className="no-gutters">
        <Col >
          {header ? header : <h5><b>{name}</b></h5>}
        </Col>
        <Col xs={"auto"}>
          <span className="float-right align-top ml-1">
            {onEdit && <Button variant="primary" size="sm" className="mr-1"
              onClick={() => onEdit(characterKey)}>
              <FontAwesomeIcon icon={faEdit} />
            </Button>}
            {onDelete && <Button variant="danger" size="sm"
              onClick={() => onDelete(characterKey)}>
              <FontAwesomeIcon icon={faTrashAlt} />
            </Button>}
          </span>
        </Col>
      </Row>
    </Card.Header>
    <Card.Body onClick={() => onEdit?.(characterKey)} className={onEdit ? "cursor-pointer" : ""} >
      <Row>
        <Col xs="auto" className="pr-0">
          <Image src={characterSheet.thumbImg} className={`thumb-big grad-${characterSheet.star}star p-0`} thumbnail />
        </Col>
        <Col>
          <h3 className="mb-0">{Character.getLevelString(character, characterSheet, weaponSheet)} {`C${constellation}`}</h3>
          <h5 className="mb-0"><Stars stars={characterSheet.star} colored /></h5>
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
          {artifactSheets && Object.entries(ArtifactSheet.setEffects(artifactSheets, stats.setToSlots)).map(([key, arr]) => {
            let artifactSetName = artifactSheets?.[key].name ?? ""
            let highestNum = Math.max(...arr)
            return <h5 key={key}><Badge variant="secondary">{artifactSetName} <Badge variant="success">{highestNum}</Badge></Badge></h5>
          })}
        </Col>
      </Row>
      <Row>
        {statkeys.map(statKey => {
          let unit = Stat.getStatUnit(statKey)
          let statVal = stats[statKey]
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
      } as any}>Generate Builds</Button>
    </Card.Footer>}
  </Card>)
}