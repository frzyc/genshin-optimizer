import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from 'react';
import { Card, Col, Dropdown, DropdownButton, Image, ListGroup, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import Assets from "../../Assets/Assets";
import DocumentDisplay from "../../Components/DocumentDisplay";
import FieldDisplay from "../../Components/FieldDisplay";
import Stat from "../../Stat";
import { ElementToReactionKeys } from "../../StatData";
import { ICharacter } from "../../Types/character";
import ICalculatedStats from "../../Types/ICalculatedStats";
import statsToFields from "../../Util/FieldUtil";
import Character from "../Character";
import CharacterSheet from "../CharacterSheet";
type CharacterTalentPaneProps = {
  characterSheet: CharacterSheet,
  character: ICharacter,
  editable: boolean,
  characterDispatch: (any) => void,
  newBuild?: ICalculatedStats,
  equippedBuild?: ICalculatedStats
}
export default function CharacterTalentPane(props: CharacterTalentPaneProps) {
  const { characterSheet, character: { levelKey, constellation }, editable, characterDispatch, newBuild, equippedBuild } = props
  const ascension = Character.getAscension(levelKey)
  const skillBurstList = [["auto", "Normal/Charged Attack"], ["skill", "Elemental Skill"], ["burst", "Elemental Burst"]]
  const passivesList: Array<[tKey: string, tText: string, asc: number]> = [["passive1", "Unlocked at Ascension 1", 1], ["passive2", "Unlocked at Ascension 4", 4], ["passive3", "Unlocked by Default", 0]]
  const skillDisplayProps = { ...props, ascension }

  return <>
    <Row><Col><ReactionDisplay {...{ characterSheet, newBuild, equippedBuild }} /></Col></Row>
    <Row>
      {/* auto, skill, burst */}
      {skillBurstList.map(([tKey, tText]) =>
        <Col key={tKey} xs={12} md={6} lg={4} className="mb-2">
          <SkillDisplayCard
            {...skillDisplayProps}
            talentKey={tKey}
            subtitle={tText}
          />
        </Col>)}
      {!!characterSheet.getTalent("sprint") && <Col xs={12} md={6} lg={4} className="mb-2">
        <SkillDisplayCard
          {...skillDisplayProps}
          talentKey="sprint"
          subtitle="Alternative Sprint"
        />
      </Col>}
    </Row>
    <Row>
      {/* passives */}
      {passivesList.map(([tKey, tText, asc]) => {
        let enabled = ascension >= asc
        if (!characterSheet.getTalent(tKey)) return null
        return <Col key={tKey} style={{ opacity: enabled ? 1 : 0.5 }} xs={12} md={4} className="mb-2">
          <SkillDisplayCard
            {...skillDisplayProps}
            talentKey={tKey}
            subtitle={tText}
          />
        </Col>
      })}
    </Row>
    <Row>
      <Col>
        <h5 className="text-center">Constellation Lv. {constellation}</h5>
      </Col>
    </Row>
    <Row className="mb-n2">
      {/* constellations */}
      {[...Array(6).keys()].map(i => {
        let tKey = `constellation${i + 1}`
        return <Col key={i} xs={12} md={4} className="mb-2"
          style={{ opacity: constellation > i ? 1 : 0.5 }}>
          <SkillDisplayCard
            {...skillDisplayProps}
            talentKey={tKey}
            subtitle={`Contellation Lv. ${i + 1}`}
            onClickTitle={() => editable && characterDispatch({ constellation: (i + 1) === constellation ? i : i + 1 })}
          />
        </Col>
      })}
    </Row>
  </>
}
const ReactionComponents = {
  superconduct_hit: SuperConductCard,
  electrocharged_hit: ElectroChargedCard,
  overloaded_hit: OverloadedCard,
  pyro_swirl_hit: SwirlCard,
  shattered_hit: ShatteredCard,
  crystalize_hit: CrystalizeCard,
}
function ReactionDisplay({ characterSheet, newBuild, equippedBuild }: { characterSheet: CharacterSheet, newBuild?: ICalculatedStats, equippedBuild?: ICalculatedStats }) {
  const build = newBuild ? newBuild : equippedBuild
  const charEleKey = characterSheet.elementKey
  const eleInterArr = [...(ElementToReactionKeys[charEleKey] || [])]
  if (!eleInterArr.includes("shattered_hit") && characterSheet.weaponTypeKey === "claymore") eleInterArr.push("shattered_hit")
  return <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
    <Card.Body className="px-3 py-2">
      <Row className="mb-n2">
        {eleInterArr.map(key => {
          const Ele = ReactionComponents[key]
          if (!Ele) return null
          return <Col xs="auto" className="mb-2" key={key}><Ele stats={build} /></Col>
        })}
      </Row>
    </Card.Body>
  </Card>
}
function SuperConductCard({ stats }) {
  const sKey = "superconduct_hit"
  return <Card bg="darkcontent" text={"lightfont" as any}><Card.Body className="p-2">
    <span className="text-superconduct">{Stat.getStatName(sKey)} <Image src={Assets.elements.electro} className="inline-icon" />+<Image src={Assets.elements.cryo} className="inline-icon" /> {stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</span>
  </Card.Body></Card>
}
function ElectroChargedCard({ stats }) {
  const sKey = "electrocharged_hit"
  return <Card bg="darkcontent" text={"lightfont" as any}><Card.Body className="p-2">
    <span className="text-electrocharged">{Stat.getStatName(sKey)} <Image src={Assets.elements.electro} className="inline-icon" />+<Image src={Assets.elements.hydro} className="inline-icon" /> {stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</span>
  </Card.Body></Card>
}
function OverloadedCard({ stats }) {
  const sKey = "overloaded_hit"
  return <Card bg="darkcontent" text={"lightfont" as any}><Card.Body className="p-2">
    <span className="text-overloaded">{Stat.getStatName(sKey)} <Image src={Assets.elements.electro} className="inline-icon" />+<Image src={Assets.elements.pyro} className="inline-icon" /> {stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</span>
  </Card.Body></Card>
}

const swirlEleToDisplay = {
  "pyro": <span>{Stat.getStatName("pyro_swirl_hit")} <Image src={Assets.elements.pyro} className="inline-icon" />+<Image src={Assets.elements.anemo} className="inline-icon" /></span>,
  "electro": <span>{Stat.getStatName("electro_swirl_hit")} <Image src={Assets.elements.electro} className="inline-icon" />+<Image src={Assets.elements.anemo} className="inline-icon" /></span>,
  "cryo": <span>{Stat.getStatName("cryo_swirl_hit")} <Image src={Assets.elements.cryo} className="inline-icon" />+<Image src={Assets.elements.anemo} className="inline-icon" /></span>,
  "hydro": <span>{Stat.getStatName("hydro_swirl_hit")} <Image src={Assets.elements.hydro} className="inline-icon" />+<Image src={Assets.elements.anemo} className="inline-icon" /></span>
} as const
function SwirlCard({ stats }) {
  const [ele, setele] = useState(Object.keys(swirlEleToDisplay)[0])
  const sKey = `${ele}_swirl_hit`
  return <Card bg="darkcontent" text={"lightfont" as any}><Card.Body className="p-0">
    <DropdownButton size="sm" title={swirlEleToDisplay[ele]} className="d-inline-block" variant="success">
      {Object.entries(swirlEleToDisplay).map(([key, element]) => <Dropdown.Item key={key} onClick={() => setele(key)}>{element}</Dropdown.Item>)}
    </DropdownButton>
    <span className={`text-${ele} p-2`}> {stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</span>
  </Card.Body></Card>
}
function ShatteredCard({ stats }) {
  const sKey = "shattered_hit"
  const information = <OverlayTrigger
    placement="top"
    overlay={<Tooltip id="shatter-tooltip">Claymores, Plunging Attacks and <span className="text-geo">Geo DMG</span></Tooltip>}
  >
    <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" style={{ cursor: "help" }} />
  </OverlayTrigger>
  return <Card bg="darkcontent" text={"lightfont" as any}><Card.Body className="p-2">
    <span className="text-shattered">{Stat.getStatName(sKey)} <Image src={Assets.elements.hydro} className="inline-icon" />+<Image src={Assets.elements.cryo} className="inline-icon" />+ <small className="text-physical">Heavy Attack{information} </small> {stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</span>
  </Card.Body></Card>
}
const crystalizeEleToDisplay = {
  "default": <span className="text-crystalize">{Stat.getStatName("crystalize_hit")} <Image src={Assets.elements.electro} className="inline-icon" />/<Image src={Assets.elements.hydro} className="inline-icon" />/<Image src={Assets.elements.pyro} className="inline-icon" />/<Image src={Assets.elements.cryo} className="inline-icon" />+<Image src={Assets.elements.geo} className="inline-icon" /></span>,
  "pyro": <span>{Stat.getStatName("pyro_crystalize_hit")} <Image src={Assets.elements.pyro} className="inline-icon" />+<Image src={Assets.elements.geo} className="inline-icon" /></span>,
  "electro": <span>{Stat.getStatName("electro_crystalize_hit")} <Image src={Assets.elements.electro} className="inline-icon" />+<Image src={Assets.elements.geo} className="inline-icon" /></span>,
  "cryo": <span>{Stat.getStatName("cryo_crystalize_hit")} <Image src={Assets.elements.cryo} className="inline-icon" />+<Image src={Assets.elements.geo} className="inline-icon" /></span>,
  "hydro": <span>{Stat.getStatName("hydro_crystalize_hit")} <Image src={Assets.elements.hydro} className="inline-icon" />+<Image src={Assets.elements.geo} className="inline-icon" /></span>
} as const
function CrystalizeCard({ stats }) {
  const [ele, setele] = useState(Object.keys(crystalizeEleToDisplay)[0])
  const sKey = ele === "default" ? "crystalize_hit" : `${ele}_crystalize_hit`
  return <Card bg="darkcontent" text={"lightfont" as any}><Card.Body className="p-0">
    <DropdownButton size="sm" title={crystalizeEleToDisplay[ele]} className="d-inline-block" variant="success">
      {Object.entries(crystalizeEleToDisplay).map(([key, element]) => <Dropdown.Item key={key} onClick={() => setele(key)}>{element}</Dropdown.Item>)}
    </DropdownButton>
    <span className={`text-${ele} p-2`}> {stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</span>
  </Card.Body></Card>
}

const talentLimits = [1, 1, 2, 4, 6, 8, 10]
type SkillDisplayCardProps = {
  characterSheet: CharacterSheet
  character: ICharacter,
  characterDispatch: (any) => void,
  talentKey: string,
  subtitle: string,
  ascension: number,
  equippedBuild?: ICalculatedStats,
  newBuild?: ICalculatedStats,
  editable: boolean,
  onClickTitle?: (any) => any
}
function SkillDisplayCard({ characterSheet, character: { constellation, talentLevelKeys, }, characterDispatch, talentKey, subtitle, ascension, equippedBuild, newBuild, editable, onClickTitle }: SkillDisplayCardProps) {
  let build = newBuild ? newBuild : equippedBuild as ICalculatedStats //assumes at least one of them is not undefined
  let header: Displayable | null = null

  let talentLvlKey = 0
  if (talentKey in talentLevelKeys) {
    const talentLvlKeyRaw = talentLevelKeys[talentKey]
    const levelBoost: number = build[`${talentKey}Boost`] ?? 0
    talentLvlKey = talentLvlKeyRaw + levelBoost
    if (editable) {
      const setTalentLevel = (tKey, newTalentLevelKey) => {
        talentLevelKeys[tKey] = newTalentLevelKey
        characterDispatch({ talentLevelKeys })
      }
      header = <Card.Header>
        <DropdownButton title={`Talent Lv. ${talentLvlKey + 1}`}>
          {[...Array(talentLimits[ascension] + (talentKey === "auto" && !levelBoost ? 1 : 0)).keys()].map(i => //spcial consideration for Tartaglia
            <Dropdown.Item key={i} onClick={() => setTalentLevel(talentKey, i)}>Talent Lv. {i + levelBoost + 1}</Dropdown.Item>)}
        </DropdownButton>
      </Card.Header>
    } else {
      header = <Card.Header>{`Talent Level: ${talentLvlKey + 1}`}</Card.Header>
    }
  }
  const talentStats = characterSheet.getTalentStats(talentKey, build)
  const statsEle = talentStats && <Row><Col>
    <Card bg="darkcontent" text={"lightfont" as any} className="mb-2">
      <ListGroup className="text-white" variant="flush">
        {statsToFields(talentStats, build).map((field, i) =>
          <FieldDisplay key={i} index={i} {...{ field, equippedBuild, newBuild }} />)}
      </ListGroup>
    </Card>
  </Col></Row>

  const document = characterSheet.getTalent(talentKey)?.document
  return <Card bg="lightcontent" text={"lightfont" as any} className="h-100">
    {header}
    <Card.Body className="mb-n2">
      <Row className={`d-flex flex-row mb-2 ${(editable && onClickTitle) ? "cursor-pointer" : ""}`} onClick={onClickTitle} >
        <Col xs="auto" className="flex-shrink-1 d-flex flex-column">
          <Image src={characterSheet.getTalent(talentKey)?.img} className="thumb-mid" />
        </Col>
        <Col className="flex-grow-1">
          <Card.Title>{characterSheet.getTalent(talentKey)?.name}</Card.Title>
          <Card.Subtitle>{subtitle}</Card.Subtitle>
        </Col>
      </Row>
      {/* Display document sections */}
      {document ? <DocumentDisplay {...{ document, characterDispatch, equippedBuild, newBuild, editable }} /> : null}
      {statsEle}
    </Card.Body>
  </Card>
}
