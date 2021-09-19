import { faBan, faBriefcase, faChartLine, faEdit, faInfoCircle, faLock, faLockOpen, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext, useEffect, useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import Image from 'react-bootstrap/Image';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Row from 'react-bootstrap/Row';
import Tooltip from 'react-bootstrap/Tooltip';
import { useTranslation } from 'react-i18next';
import CharacterSheet from '../Character/CharacterSheet';
import { CharacterSelectionDropdownList } from '../Character/CharacterSelection';
import { Stars } from '../Components/StarDisplay';
import { DatabaseContext, database as localDatabase } from '../Database/Database';
import Stat from '../Stat';
import { allSubstats, ICachedArtifact, ICachedSubstat, SubstatKey } from '../Types/artifact';
import { CharacterKey } from '../Types/consts';
import { valueStringWithUnit } from '../Util/UIUtil';
import Artifact from './Artifact';
import { ArtifactSheet } from './ArtifactSheet';
import SlotNameWithIcon from './Component/SlotNameWIthIcon';
import PercentBadge from './PercentBadge';
import usePromise from '../ReactHooks/usePromise';

type Data = { artifactId?: string, artifactObj?: ICachedArtifact, onEdit?: () => void, onDelete?: () => void, mainStatAssumptionLevel?: number, effFilter?: Set<SubstatKey> }
const allSubstatFilter = new Set(allSubstats)

export default function ArtifactCard({ artifactId, artifactObj, onEdit, onDelete, mainStatAssumptionLevel = 0, effFilter = allSubstatFilter }: Data): JSX.Element | null {
  const { t } = useTranslation(["artifact"]);
  const database = useContext(DatabaseContext)
  const [databaseArtifact, updateDatabaseArtifact] = useState(undefined as ICachedArtifact | undefined)
  useEffect(() =>
    artifactId ? database.followArt(artifactId, updateDatabaseArtifact) : undefined,
    [artifactId, updateDatabaseArtifact, database])
  const sheet = usePromise(ArtifactSheet.get((artifactObj ?? (artifactId ? database._getArt(artifactId) : undefined))?.setKey), [artifactObj, artifactId])
  const equipOnChar = (charKey: CharacterKey | "") => database.setArtLocation(artifactId!, charKey)

  const editable = !artifactObj && database === localDatabase // dont allow edit for flex artifacts
  const art = artifactObj ?? databaseArtifact
  const characterSheet = usePromise(CharacterSheet.get(art?.location ?? ""), [art?.location])
  if (!art) return null

  const { id, lock, slotKey, rarity, level, mainStatKey, substats, exclude } = art
  const mainStatLevel = Math.max(Math.min(mainStatAssumptionLevel, rarity * 4), level)
  const levelVariant = (Math.floor(Math.max(level - 1, 0) / 4) + 1) + "roll"
  const mainStatVal = <span className={mainStatLevel !== level ? "text-orange" : ""}>{valueStringWithUnit(Artifact.mainStatValue(mainStatKey, rarity, mainStatLevel) ?? 0, Stat.getStatUnit(mainStatKey))}</span>
  const { currentEfficiency, maxEfficiency } = Artifact.getArtifactEfficiency(art, effFilter)
  const artifactValid = maxEfficiency !== 0
  const locationName = characterSheet?.name ? characterSheet.nameWIthIcon : <span><FontAwesomeIcon icon={faBriefcase} /> {t`filterLocation.inventory`}</span>
  const slotName = sheet?.getSlotName(slotKey) || "Unknown Piece Name"
  const slotDesc = sheet?.getSlotDesc(slotKey)
  const slotDescEle = slotDesc ? <OverlayTrigger
    placement="top"
    overlay={<Tooltip id="slotdesc-tooltip">{slotDesc}</Tooltip>}
  >
    <FontAwesomeIcon icon={faInfoCircle} />
  </OverlayTrigger> : null
  const setEffects = sheet?.setEffects
  const setDesc = sheet && setEffects && <Tooltip id="setdesc-tooltop">
    {Object.keys(setEffects).map(setNumKey => <span key={setNumKey} className="text-left">
      <h6 className="mb-0"><Badge variant="success">{t(`setEffectNum`, { setNum: setNumKey })}</Badge></h6>
      <p>{sheet.setEffectDesc(setNumKey as any)}</p>
    </span>)}
  </Tooltip>
  const setDescEle = setDesc ? <OverlayTrigger
    placement="top"
    overlay={setDesc}
  >
    <FontAwesomeIcon icon={faInfoCircle} />
  </OverlayTrigger> : null

  return (<Card className="h-100" border={`${rarity}star`} bg="lightcontent" text={"lightfont" as any}>
    <Card.Header className="p-0">
      <Row>
        <Col xs={2} md={3}>
          <Image src={sheet?.slotIcons[slotKey] ?? ""} className={`w-100 h-auto grad-${rarity}star m-1`} thumbnail />
        </Col>
        <Col className="pt-2">
          <h6><strong>{slotName} {slotDescEle}</strong></h6>
          <div><SlotNameWithIcon slotKey={slotKey} /> <span className="float-right mr-4"> <Button size="sm" disabled={!editable} onClick={() => database.updateArt({ lock: !lock }, id)}><FontAwesomeIcon icon={lock ? faLock : faLockOpen} className="fa-fw" /></Button></span></div>
          <div><small><Stars stars={rarity} /></small></div>
        </Col>
      </Row>
    </Card.Header>
    <Card.Body className="d-flex flex-column py-2">
      <Card.Title>
        <Badge variant={levelVariant} ><strong className="text-dark">{` +${level}`}</strong></Badge> {sheet?.name ?? "Artifact Set"} {setDescEle}
      </Card.Title>
      <h5 className="mb-1">
        <b>{Stat.getStatName(mainStatKey)} {mainStatVal}</b>
      </h5>
      <Row className="mb-0">
        {substats.map((stat: ICachedSubstat, i) => {
          if (!stat.value) return null
          let numRolls = stat.rolls?.length ?? 0
          let efficiency = stat.efficiency ?? 0
          let effOpacity = 0.3 + efficiency * 0.7
          let statName = Stat.getStatName(stat.key)
          return (<Col key={i} xs={12}>
            <Badge variant={numRolls ? `${numRolls}roll` : "danger"} className="text-darkcontent"><b>{numRolls ? numRolls : "?"}</b></Badge>{" "}
            <span className={`text-${numRolls}roll`}>{statName}{`+${valueStringWithUnit(stat.value, Stat.getStatUnit(stat.key))}`}</span>
            <span className="float-right" style={{ opacity: effOpacity }}>{stat.key && effFilter.has(stat.key) ? valueStringWithUnit(efficiency, "eff") : "-"}</span>
          </Col>)
        })}
      </Row>
      <div className="mt-auto">
        <Row>
          <Col ><small>{t`editor.curSubEff`}</small></Col>
          <Col xs="auto"><PercentBadge value={currentEfficiency} valid={artifactValid} /></Col>
        </Row>
        {currentEfficiency !== maxEfficiency && <Row>
          <Col ><small>{t`editor.maxSubEff`}</small></Col>
          <Col xs="auto"><PercentBadge value={maxEfficiency} valid={artifactValid} /></Col>
        </Row>}
      </div>
      {process.env.NODE_ENV === "development" && <span className="text-warning">{id || `""`} </span>}
    </Card.Body>

    <Card.Footer className="pr-3">
      <Row className="d-flex justify-content-between no-gutters">
        {editable ? <Col xs="auto">
          <Dropdown>
            <Dropdown.Toggle size="sm" className="text-left">{locationName}</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => equipOnChar("")}><FontAwesomeIcon icon={faBriefcase} /> Inventory</Dropdown.Item>
              <Dropdown.Divider />
              <CharacterSelectionDropdownList onSelect={equipOnChar} />
            </Dropdown.Menu>
          </Dropdown>
        </Col> : <Col xs="auto"><b>{locationName}</b></Col>}
        {editable && <Col xs="auto">
          <ButtonGroup>
            {!!onEdit && <Button variant="info" size="sm" onClick={onEdit}>
              <FontAwesomeIcon icon={faEdit} className="fa-fw" />
            </Button>}
            <OverlayTrigger placement="top"
              overlay={<Tooltip id="exclude-artifact-tip">{t`excludeArtifactTip`}</Tooltip>}>
              <span className="d-inline-block">
                <Button size="sm" onClick={() => database.updateArt({ exclude: !exclude }, id)} className="rounded-0" variant={exclude ? "danger" : "success"}>
                  <FontAwesomeIcon icon={exclude ? faBan : faChartLine} className="fa-fw" />
                </Button>
              </span>
            </OverlayTrigger>
            {!!onDelete && <Button variant="danger" size="sm"
              onClick={onDelete}>
              <FontAwesomeIcon icon={faTrashAlt} className="fa-fw" />
            </Button>}
          </ButtonGroup>
        </Col>}
      </Row>
    </Card.Footer>
  </Card >)
}
