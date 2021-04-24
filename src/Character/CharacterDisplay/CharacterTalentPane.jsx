import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from 'react';
import { Card, Col, Dropdown, DropdownButton, Image, ListGroup, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import Assets from "../../Assets/Assets";
import Stat from "../../Stat";
import { ElementToReactionKeys } from "../../StatData";
import statsToFields from "../../Util/FieldUtil";
import Character from "../Character";
import ConditionalDisplay from './Components/ConditionalDisplay';
import FieldDisplay from './Components/FieldDisplay';

export default function CharacterTalentPane(props) {
  const { character, character: { characterKey, levelKey, constellation }, editable, characterDispatch, newBuild, equippedBuild } = props
  const ascension = Character.getAscension(levelKey)
  const skillBurstList = [["auto", "Normal/Charged Attack"], ["skill", "Elemental Skill"], ["burst", "Elemental Burst"]]
  const passivesList = [["passive1", "Unlocked at Ascension 1", 1], ["passive2", "Unlocked at Ascension 4", 4], ["passive3", "Unlocked by Default", 0]]
  const skillDisplayProps = { ...props, ascension }

  return <>
    <Row><Col><ReactionDisplay {...{ character, newBuild, equippedBuild }} /></Col></Row>
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
      {Character.getTalent(characterKey, "sprint", false) && <Col xs={12} md={6} lg={4} className="mb-2">
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
function ReactionDisplay({ character: { characterKey }, newBuild, equippedBuild }) {
  const build = newBuild ? newBuild : equippedBuild
  const charEleKey = Character.getElementalKey(characterKey)
  const eleInterArr = [...(ElementToReactionKeys[charEleKey] || [])]
  if (!eleInterArr.includes("shattered_hit") && Character.getWeaponTypeKey(characterKey) === "claymore") eleInterArr.push("shattered_hit")
  return <Card bg="lightcontent" text="lightfont" className="mb-2">
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
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <span className="text-superconduct">{Stat.getStatName(sKey)} <Image src={Assets.elements.electro} className="inline-icon" />+<Image src={Assets.elements.cryo} className="inline-icon" /> {stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</span>
  </Card.Body></Card>
}
function ElectroChargedCard({ stats }) {
  const sKey = "electrocharged_hit"
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <span className="text-electrocharged">{Stat.getStatName(sKey)} <Image src={Assets.elements.electro} className="inline-icon" />+<Image src={Assets.elements.hydro} className="inline-icon" /> {stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</span>
  </Card.Body></Card>
}
function OverloadedCard({ stats }) {
  const sKey = "overloaded_hit"
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <span className="text-overloaded">{Stat.getStatName(sKey)} <Image src={Assets.elements.electro} className="inline-icon" />+<Image src={Assets.elements.pyro} className="inline-icon" /> {stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</span>
  </Card.Body></Card>
}

const swirlEleToDisplay = {
  "pyro": <span>{Stat.getStatName("pyro_swirl_hit")} <Image src={Assets.elements.pyro} className="inline-icon" />+<Image src={Assets.elements.anemo} className="inline-icon" /></span>,
  "electro": <span>{Stat.getStatName("electro_swirl_hit")} <Image src={Assets.elements.electro} className="inline-icon" />+<Image src={Assets.elements.anemo} className="inline-icon" /></span>,
  "cryo": <span>{Stat.getStatName("cryo_swirl_hit")} <Image src={Assets.elements.cryo} className="inline-icon" />+<Image src={Assets.elements.anemo} className="inline-icon" /></span>,
  "hydro": <span>{Stat.getStatName("hydro_swirl_hit")} <Image src={Assets.elements.hydro} className="inline-icon" />+<Image src={Assets.elements.anemo} className="inline-icon" /></span>
}
function SwirlCard({ stats }) {
  const [ele, setele] = useState(Object.keys(swirlEleToDisplay)[0])
  const sKey = `${ele}_swirl_hit`
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-0">
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
    overlay={<Tooltip>Claymores, Plunging Attacks and <span className="text-geo">Geo DMG</span></Tooltip>}
  >
    <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" style={{ cursor: "help" }} />
  </OverlayTrigger>
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <span className="text-shattered">{Stat.getStatName(sKey)} <Image src={Assets.elements.hydro} className="inline-icon" />+<Image src={Assets.elements.cryo} className="inline-icon" />+ <small className="text-physical">Heavy Attack{information} </small> {stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</span>
  </Card.Body></Card>
}
function CrystalizeCard({ stats }) {
  const sKey = "crystalize_hit"
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <span className="text-crystalize">{Stat.getStatName(sKey)} <Image src={Assets.elements.electro} className="inline-icon" />/<Image src={Assets.elements.hydro} className="inline-icon" />/<Image src={Assets.elements.pyro} className="inline-icon" />/<Image src={Assets.elements.cryo} className="inline-icon" />+<Image src={Assets.elements.geo} className="inline-icon" /> {stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</span>
  </Card.Body></Card>
}

const talentLimits = [1, 1, 2, 4, 6, 8, 10]
function SkillDisplayCard({ character: { characterKey, constellation, talentLevelKeys = {}, }, characterDispatch, talentKey, subtitle, ascension, equippedBuild, newBuild, editable, onClickTitle }) {
  let build = newBuild ? newBuild : equippedBuild
  let header = null

  let talentLvlKey = 0
  if (talentKey in talentLevelKeys) {
    const talentLvlKeyRaw = talentLevelKeys[talentKey]
    const levelBoost = Character.getTalentLevelBoost(characterKey, talentKey, constellation)
    talentLvlKey = talentLvlKeyRaw + levelBoost
    if (editable) {
      const setTalentLevel = (tKey, newTalentLevelKey) => {
        talentLevelKeys[tKey] = newTalentLevelKey
        characterDispatch({ talentLevelKeys })
      }
      header = <Card.Header>
        <DropdownButton title={`Talent Lv. ${talentLvlKey + 1}`}>
          {[...Array(talentLimits[ascension] + (talentKey === "auto" ? 1 : 0)).keys()].map(i =>
            <Dropdown.Item key={i} onClick={() => setTalentLevel(talentKey, i)}>Talent Lv. {i + levelBoost + 1}</Dropdown.Item>)}
        </DropdownButton>
      </Card.Header>
    } else {
      header = <Card.Header>{`Talent Level: ${talentLvlKey + 1}`}</Card.Header>
    }
  }
  const talentStats = Character.getTalentStats(characterKey, talentKey, build)
  const statsEle = talentStats && <Row><Col>
    <Card bg="darkcontent" text="lightfont" className="mb-2">
      <ListGroup className="text-white" variant="flush">
        {statsToFields(talentStats, build).map((field, i) =>
          <FieldDisplay key={i} index={i} {...{ field, equippedBuild, newBuild }} />)}
      </ListGroup>
    </Card>
  </Col></Row>

  return <Card bg="lightcontent" text="lightfont" className="h-100">
    {header}
    <Card.Body className="mb-n2">
      <Row className={`d-flex flex-row mb-2 ${(editable && onClickTitle) ? "cursor-pointer" : ""}`} onClick={onClickTitle} >
        <Col xs="auto" className="flex-shrink-1 d-flex flex-column">
          <Image src={Character.getTalentImg(characterKey, talentKey)} className="thumb-mid" />
        </Col>
        <Col className="flex-grow-1">
          <Card.Title>{Character.getTalentName(characterKey, talentKey)}</Card.Title>
          <Card.Subtitle>{subtitle}</Card.Subtitle>
        </Col>
      </Row>
      {/* Display document sections */}
      {Character.getTalentDocument(characterKey, talentKey).map((section, i) => {
        if (!section.canShow(build)) return null
        let talentText = section.text
        if (typeof talentText === "function")
          talentText = talentText(build)
        let fields = section.fields ?? []
        return <div className="my-2" key={"section" + i}>
          <div xs={12}>
            <div className="mb-2">{talentText}</div>
            {fields.length > 0 && <ListGroup className="text-white mb-2">
              {fields?.map?.((field, i) => <FieldDisplay key={i} index={i} {...{ field, equippedBuild, newBuild }} />)}
            </ListGroup>}
          </div>
          {Boolean(section.conditional) && <ConditionalDisplay {...{ conditional: section.conditional, equippedBuild, newBuild, characterDispatch, editable }} />}
        </div>
      })}
      {statsEle}
    </Card.Body>
  </Card>
}
