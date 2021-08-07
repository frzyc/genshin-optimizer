import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useMemo, useState } from 'react';
import { Badge, Image } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Link } from 'react-router-dom';
import { ArtifactSheet } from '../Artifact/ArtifactSheet';
import Assets from '../Assets/Assets';
import ElementalIcon from '../Components/ElementalIcon';
import { Stars } from '../Components/StarDisplay';
import { StatIconEle } from '../Components/StatIcon';
import { database } from '../Database/Database';
import Stat from '../Stat';
import { ICharacter } from '../Types/character';
import { CharacterKey } from '../Types/consts';
import { usePromise } from '../Util/ReactUtil';
import WeaponSheet from '../Weapon/WeaponSheet';
import Character from './Character';
import CharacterSheet from './CharacterSheet';
type CharacterCardProps = { characterKey: CharacterKey | "", onEdit?: (any) => void, onDelete?: (any) => void, cardClassName: string, header?: JSX.Element, bg?: string, footer?: boolean }
export default function CharacterCard({ characterKey, onEdit, onDelete, cardClassName = "", bg = "", header, footer = false }: CharacterCardProps) {
  const [databaseCharacter, updateDatabaseCharacter] = useState(undefined as ICharacter | undefined)
  useEffect(() =>
    characterKey ? database.followChar(characterKey, updateDatabaseCharacter) : undefined,
    [characterKey, updateDatabaseCharacter])

  const artifactSheets = usePromise(ArtifactSheet.getAll(), [])
  const character = databaseCharacter
  const characterSheet = usePromise(CharacterSheet.get(characterKey), [characterKey])
  const weaponSheet = usePromise(character && WeaponSheet.get(character.weapon.key), [character])
  const stats = useMemo(() => character && characterSheet && weaponSheet && artifactSheets && Character.calculateBuild(character, characterSheet, weaponSheet, artifactSheets), [character, characterSheet, weaponSheet, artifactSheets])
  if (!character || !characterSheet || !weaponSheet || !stats) return null;

  const { weapon, constellation } = character
  const { level, ascension } = weapon
  const { tlvl } = stats
  const name = characterSheet.name
  const elementKey = stats.characterEle
  const weaponTypeKey = characterSheet.weaponTypeKey
  const weaponName = weaponSheet?.name
  const weaponMainVal = weaponSheet.getMainStatValue(level, ascension).toFixed(Stat.fixedUnit("atk"))
  const weaponSubKey = weaponSheet.getSubStatKey()
  const weaponSubVal = weaponSheet.getSubStatValue(level, ascension).toFixed(Stat.fixedUnit(weaponSubKey))
  const weaponLevelName = WeaponSheet.getLevelString(weapon)
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
          <h5 className="mb-0">Lv. {Character.getLevelString(character)} {`C${constellation}`}</h5>
          <h6 className="mb-0">
            <Badge variant="secondary"><strong className="mx-1">{tlvl.auto + 1}</strong></Badge>{` `}
            <Badge variant="secondary"><strong className="mx-1">{tlvl.skill + 1}</strong></Badge>{` `}
            <Badge variant="secondary"><strong className="mx-1">{tlvl.burst + 1}</strong></Badge>
          </h6>
          <h6 className="mb-0"><Stars stars={characterSheet.star} colored /></h6>
          <h3 className="mb-0">{ElementalIcon[elementKey]} <Image src={Assets.weaponTypes?.[weaponTypeKey]} className="inline-icon" /></h3>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
          <h6 className="mb-0">{weaponName}{weaponPassiveName && <Badge variant="info" className="ml-1">{weapon.refineIndex + 1}</Badge>} {weaponLevelName}</h6>
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