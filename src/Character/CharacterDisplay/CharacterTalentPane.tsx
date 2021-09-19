import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useState } from 'react';
import { Card, Col, Dropdown, DropdownButton, Image, ListGroup, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { buildContext } from "../../Build/Build";
import DocumentDisplay from "../../Components/DocumentDisplay";
import FieldDisplay from "../../Components/FieldDisplay";
import StatIcon from "../../Components/StatIcon";
import useCharacterReducer from "../../ReactHooks/useCharacterReducer";
import Stat from "../../Stat";
import { ElementToReactionKeys } from "../../StatData";
import { ICachedCharacter } from "../../Types/character";
import statsToFields from "../../Util/FieldUtil";
import CharacterSheet from "../CharacterSheet";
type CharacterTalentPaneProps = {
  characterSheet: CharacterSheet,
  character: ICachedCharacter,
}
export default function CharacterTalentPane({ characterSheet, character, character: { ascension, constellation, key: characterKey } }: CharacterTalentPaneProps) {
  const { newBuild, equippedBuild } = useContext(buildContext)
  const characterDispatch = useCharacterReducer(characterKey)
  const skillBurstList = [["auto", "Normal/Charged Attack"], ["skill", "Elemental Skill"], ["burst", "Elemental Burst"]]
  const passivesList: Array<[tKey: string, tText: string, asc: number]> = [["passive1", "Unlocked at Ascension 1", 1], ["passive2", "Unlocked at Ascension 4", 4], ["passive3", "Unlocked by Default", 0]]
  const build = newBuild ? newBuild : equippedBuild
  return <>
    <Row><Col><ReactionDisplay characterSheet={characterSheet} /></Col></Row>
    <Row>
      {/* auto, skill, burst */}
      {skillBurstList.map(([tKey, tText]) =>
        <Col key={tKey} xs={12} md={6} lg={4} className="mb-2">
          <SkillDisplayCard
            characterSheet={characterSheet}
            character={character}
            characterDispatch={characterDispatch}
            talentKey={tKey}
            subtitle={tText}
          />
        </Col>)}
      {!!characterSheet.getTalentOfKey("sprint", build?.characterEle) && <Col xs={12} md={6} lg={4} className="mb-2">
        <SkillDisplayCard
          characterSheet={characterSheet}
          character={character}
          characterDispatch={characterDispatch}
          talentKey="sprint"
          subtitle="Alternative Sprint"
        />
      </Col>}
    </Row>
    <Row>
      {/* passives */}
      {passivesList.map(([tKey, tText, asc]) => {
        let enabled = ascension >= asc
        if (!characterSheet.getTalentOfKey(tKey, build?.characterEle)) return null
        return <Col key={tKey} style={{ opacity: enabled ? 1 : 0.5 }} xs={12} md={4} className="mb-2">
          <SkillDisplayCard
            characterSheet={characterSheet}
            character={character}
            characterDispatch={characterDispatch}
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
            characterSheet={characterSheet}
            character={character}
            characterDispatch={characterDispatch}
            talentKey={tKey}
            subtitle={`Contellation Lv. ${i + 1}`}
            onClickTitle={() => characterDispatch({ constellation: (i + 1) === constellation ? i : i + 1 })}
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
function ReactionDisplay({ characterSheet }: { characterSheet: CharacterSheet }) {
  const { newBuild, equippedBuild } = useContext(buildContext)
  const build = newBuild ? newBuild : equippedBuild
  if (!build) return null
  const charEleKey = build.characterEle
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
    <span className="text-superconduct">{Stat.getStatName(sKey)} {StatIcon.electro}+{StatIcon.cryo} <strong>{stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</strong></span>
  </Card.Body></Card>
}
function ElectroChargedCard({ stats }) {
  const sKey = "electrocharged_hit"
  return <Card bg="darkcontent" text={"lightfont" as any}><Card.Body className="p-2">
    <span className="text-electrocharged">{Stat.getStatName(sKey)} {StatIcon.electro}+{StatIcon.hydro} <strong>{stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</strong></span>
  </Card.Body></Card>
}
function OverloadedCard({ stats }) {
  const sKey = "overloaded_hit"
  return <Card bg="darkcontent" text={"lightfont" as any}><Card.Body className="p-2">
    <span className="text-overloaded">{Stat.getStatName(sKey)} {StatIcon.electro}+{StatIcon.pyro} <strong>{stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</strong></span>
  </Card.Body></Card>
}

const swirlEleToDisplay = {
  "pyro": <span>{Stat.getStatName("pyro_swirl_hit")} {StatIcon.pyro}+{StatIcon.anemo}</span>,
  "electro": <span>{Stat.getStatName("electro_swirl_hit")} {StatIcon.electro}+{StatIcon.anemo}</span>,
  "cryo": <span>{Stat.getStatName("cryo_swirl_hit")} {StatIcon.cryo}+{StatIcon.anemo}</span>,
  "hydro": <span>{Stat.getStatName("hydro_swirl_hit")} {StatIcon.hydro}+{StatIcon.anemo}</span>
} as const
function SwirlCard({ stats }) {
  const [ele, setele] = useState(Object.keys(swirlEleToDisplay)[0])
  const sKey = `${ele}_swirl_hit`
  return <Card bg="darkcontent" text={"lightfont" as any}><Card.Body className="p-0">
    <DropdownButton size="sm" title={swirlEleToDisplay[ele]} className="d-inline-block" variant="success">
      {Object.entries(swirlEleToDisplay).map(([key, element]) => <Dropdown.Item key={key} onClick={() => setele(key)}>{element}</Dropdown.Item>)}
    </DropdownButton>
    <span className={`text-${ele} p-2`}> <strong>{stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</strong></span>
  </Card.Body></Card>
}
function ShatteredCard({ stats }) {
  const sKey = "shattered_hit"
  const information = <OverlayTrigger
    placement="top"
    overlay={<Tooltip id="shatter-tooltip">Claymores, Plunging Attacks and <span className="text-geo">Geo DMG</span></Tooltip>}
  >
    <FontAwesomeIcon icon={faQuestionCircle} style={{ cursor: "help" }} />
  </OverlayTrigger>
  return <Card bg="darkcontent" text={"lightfont" as any}><Card.Body className="p-2">
    <span className="text-shattered">{Stat.getStatName(sKey)} {StatIcon.hydro}+{StatIcon.cryo}+ <small className="text-physical">Heavy Attack{information} </small> <strong>{stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</strong></span>
  </Card.Body></Card>
}
const crystalizeEleToDisplay = {
  "default": <span className="text-crystalize">{Stat.getStatName("crystalize_hit")} {StatIcon.electro}/{StatIcon.hydro}/{StatIcon.pyro}/{StatIcon.cryo}+{StatIcon.geo}</span>,
  "pyro": <span>{Stat.getStatName("pyro_crystalize_hit")} {StatIcon.pyro}+{StatIcon.geo}</span>,
  "electro": <span>{Stat.getStatName("electro_crystalize_hit")} {StatIcon.electro}+{StatIcon.geo}</span>,
  "cryo": <span>{Stat.getStatName("cryo_crystalize_hit")} {StatIcon.cryo}+{StatIcon.geo}</span>,
  "hydro": <span>{Stat.getStatName("hydro_crystalize_hit")} {StatIcon.hydro}+{StatIcon.geo}</span>
} as const
function CrystalizeCard({ stats }) {
  const [ele, setele] = useState(Object.keys(crystalizeEleToDisplay)[0])
  const sKey = ele === "default" ? "crystalize_hit" : `${ele}_crystalize_hit`
  return <Card bg="darkcontent" text={"lightfont" as any}><Card.Body className="p-0">
    <DropdownButton size="sm" title={crystalizeEleToDisplay[ele]} className="d-inline-block" variant="success">
      {Object.entries(crystalizeEleToDisplay).map(([key, element]) => <Dropdown.Item key={key} onClick={() => setele(key)}>{element}</Dropdown.Item>)}
    </DropdownButton>
    <span className={`text-${ele} p-2`}> <strong>{stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</strong></span>
  </Card.Body></Card>
}

const talentLimits = [1, 1, 2, 4, 6, 8, 10]
type SkillDisplayCardProps = {
  characterSheet: CharacterSheet
  character: ICachedCharacter,
  characterDispatch: (any) => void,
  talentKey: string,
  subtitle: string,
  onClickTitle?: (any) => any
}
function SkillDisplayCard({ characterSheet, character: { talent, ascension, key: characterKey }, characterDispatch, talentKey, subtitle, onClickTitle }: SkillDisplayCardProps) {
  const { newBuild, equippedBuild } = useContext(buildContext)
  let build = newBuild ? newBuild : equippedBuild
  if (!build) return null
  let header: Displayable | null = null

  if (talentKey in talent) {
    const levelBoost: number = build[`${talentKey}Boost`] ?? 0
    const talentLvlKey = talent[talentKey] + levelBoost
    const setTalentLevel = (tKey, newTalentLevelKey) => {
      talent[tKey] = newTalentLevelKey
      characterDispatch({ talent })
    }
    header = <Card.Header>
      <DropdownButton title={`Talent Lv. ${talentLvlKey}`}>
        {[...Array(talentLimits[ascension] + (talentKey === "auto" && !levelBoost ? 1 : 0)).keys()].map(i => //spcial consideration for Tartaglia
          <Dropdown.Item key={i} onClick={() => setTalentLevel(talentKey, i + 1)}>Talent Lv. {i + levelBoost + 1}</Dropdown.Item>)}
      </DropdownButton>
    </Card.Header>

  }
  const talentStats = characterSheet.getTalentStats(talentKey, build)
  const talentStatsFields = talentStats && statsToFields(talentStats, build)
  const statsEle = talentStatsFields && !!talentStatsFields.length && <Row><Col>
    <Card bg="darkcontent" text={"lightfont" as any} className="mb-2">
      <ListGroup className="text-white" variant="flush">
        {talentStatsFields.map((field, i) =>
          <FieldDisplay key={i} index={i} field={field} />)}
      </ListGroup>
    </Card>
  </Col></Row>

  const talentSheet = characterSheet.getTalentOfKey(talentKey, build.characterEle)
  const sections = talentSheet?.sections
  return <Card bg="lightcontent" text={"lightfont" as any} className="h-100">
    {header}
    <Card.Body className="mb-n2">
      <Row className={`d-flex flex-row mb-2 ${onClickTitle ? "cursor-pointer" : ""}`} onClick={onClickTitle} >
        <Col xs="auto" className="flex-shrink-1 d-flex flex-column">
          <Image src={talentSheet?.img} className="thumb-mid" />
        </Col>
        <Col className="flex-grow-1">
          <Card.Title>{talentSheet?.name}</Card.Title>
          <Card.Subtitle>{subtitle}</Card.Subtitle>
        </Col>
      </Row>
      {/* Display document sections */}
      {sections ? <DocumentDisplay {...{ sections, characterKey, equippedBuild, newBuild }} /> : null}
      {statsEle}
    </Card.Body>
  </Card>
}
