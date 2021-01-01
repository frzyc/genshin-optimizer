import { Card, Col, Dropdown, DropdownButton, Image, ListGroup, OverlayTrigger, Row, Tooltip } from "react-bootstrap"
import Character from "../Character"
import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons"
import { clamp } from "../../Util/Util"

export default function CharacterTalentPane(props) {
  let { character: { characterKey, levelKey, compareAgainstEquipped, constellation, talentLevelKeys = {} }, equippedBuild, newBuild, editable, setState } = props
  //choose which one to display stats for
  let build = newBuild ? newBuild : equippedBuild
  let { autoLevelKey = 0, skillLevelKey = 0, burstLevelKey = 0 } = talentLevelKeys
  let ascension = Character.getAscension(levelKey)

  let skillBurstList = [["auto", "Normal/Charged Attack", "autoLevelKey", autoLevelKey], ["skill", "Elemental Skill", "skillLevelKey", skillLevelKey], ["burst", "Elemental Burst", "burstLevelKey", burstLevelKey]]
  let setTalentLevel = (talentKey, talentlevel) => setState(state => {
    let talentLevelKeys = state.talentLevelKeys || {}
    talentLevelKeys[talentKey] = talentlevel
    return { talentLevelKeys }
  })
  let passivesList = [["passive1", "Unlocked at Ascension 1", 1], ["passive2", "Unlocked at Ascension 4", 4], ["passive3", "Unlocked by Default", 0]]

  let fieldProps = { constellation, ascension, compareAgainstEquipped, equippedBuild }
  return <>
    <Row>
      {skillBurstList.map(([tKey, tText, talentKey, talentLvlKey]) => {
        let levelBoost = tKey === "skill" ? (constellation >= 3 ? 3 : 0) :
          tKey === "burst" && constellation >= 5 ? 3 : 0
        return <Col key={tKey} xs={12} md={6} lg={4} className="mb-2">
          <SkillDisplayCard imgSrc={Character.getTalentImg(characterKey, tKey)}
            title={Character.getTalentName(characterKey, tKey)}
            subtitle={tText}
            talentLvlKey={talentLvlKey}
            levelBoost={levelBoost}
            setTalentLevel={editable ? ((l) => setTalentLevel(talentKey, l)) : null}
            build={build}
            document={Character.getTalentDocument(characterKey, tKey)}
            fieldProps={fieldProps}
          />
        </Col>
      })}
    </Row>
    <Row>
      {/* passives */}
      {passivesList.map(([tKey, tText, asc]) => {
        let enabled = ascension >= asc
        return <Col key={tKey} style={{ opacity: enabled ? 1 : 0.5 }} xs={12} md={4} className="mb-2">
          <SkillDisplayCard imgSrc={Character.getTalentImg(characterKey, tKey)}
            title={Character.getTalentName(characterKey, tKey)}
            subtitle={tText}
            build={build}
            document={Character.getTalentDocument(characterKey, tKey)}
            fieldProps={fieldProps}
          />
        </Col>
      })}
    </Row>
    <Row>
      <Col>
        <h5 className="text-center">Constellation Lv. {constellation}</h5>
      </Col>
    </Row>
    <Row>
      {[...Array(6).keys()].map(i => {
        let tKey = `constellation${i + 1}`
        return <Col key={i} xs={12} md={4} className="mb-2"
          style={{ cursor: editable ? "pointer" : "default", opacity: constellation > i ? 1 : 0.5 }}
          onClick={editable ? (() => setState({ constellation: (i + 1) === constellation ? i : i + 1 })) : null}  >
          <SkillDisplayCard imgSrc={Character.getTalentImg(characterKey, tKey)}
            title={Character.getTalentName(characterKey, tKey)}
            subtitle={`Contellation Lv. ${i + 1}`}
            build={build}
            document={Character.getTalentDocument(characterKey, tKey)}
            fieldProps={fieldProps}
          />
        </Col>
      })}
    </Row>
  </>
}

function SkillDisplayCard(props) {
  let { imgSrc, title, subtitle, talentLvlKey = undefined, setTalentLevel = null, levelBoost = 0, build = {}, document = [], fieldProps = {} } = props
  let header = null
  if (typeof talentLvlKey === "number")
    talentLvlKey = clamp(talentLvlKey + levelBoost, 0, 14)
  if (setTalentLevel) {
    header = <Card.Header>
      <DropdownButton title={`Talent Lv. ${talentLvlKey + 1}`}>
        {[...Array(15).keys()].map(i =>
          i >= levelBoost && <Dropdown.Item key={i} onClick={() => setTalentLevel(i - levelBoost)}>Talent Lv. {i + 1}</Dropdown.Item>)}
      </DropdownButton>
    </Card.Header>
  } else if (typeof talentLvlKey === "number") {
    header = <Card.Header>
      {`Talent Level: ${talentLvlKey + 1}`}
    </Card.Header>
  }
  return <Card bg="lightcontent" text="lightfont" className="h-100">
    {header}
    <Card.Body>
      <Row className="d-flex flex-row mb-245">
        <Col xs="auto" className="flex-shrink-1 d-flex flex-column">
          <Image src={imgSrc} className="thumb-mid" />
        </Col>
        <Col className="flex-grow-1">
          <Card.Title>{title}</Card.Title>
          <Card.Subtitle>{subtitle}</Card.Subtitle>
        </Col>
      </Row>
      {document.map((section, i) => {
        let talentText = section.text
        if (typeof talentText === "function")
          talentText = talentText(build.finalStats)
        let fields = section.fields || []
        return <Row className="mt-2" key={"section" + i}><Col xs={12}>
          <span>{talentText}</span>
          {fields.length > 0 && <ListGroup className="text-white ml-n2 mr-n2">
            {fields.map((field, i) => <FieldDisplay key={i} index={i} {...{ ...fieldProps, field, build, talentLvlKey }} />)}
          </ListGroup>}
        </Col></Row>
      })}
    </Card.Body>
  </Card>
}
function FieldDisplay(props) {
  let { field, index, talentLvlKey = 0, build, constellation, ascension, equippedBuild, compareAgainstEquipped } = props

  if (typeof field === "function")
    field = field(constellation, ascension)
  if (!field) return null

  let fieldText = field.text
  if (typeof fieldText === "function")
    fieldText = fieldText?.(build.finalStats)

  let fieldBasic = field.basicVal
  if (typeof fieldBasic === "function")
    fieldBasic = fieldBasic?.(talentLvlKey, build.finalStats)
  if (fieldBasic)
    fieldBasic = <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{fieldBasic}</Tooltip>}
    >
      <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" style={{ cursor: "help" }} />
    </OverlayTrigger>

  let fieldVal = field.value ? field.value : field.finalVal
  if (typeof fieldVal === "function") {
    fieldVal = fieldVal?.(talentLvlKey, build.finalStats)
  }
  if (typeof fieldVal === "number")
    fieldVal = Math.round(fieldVal)

  //compareAgainstEquipped
  if (compareAgainstEquipped && equippedBuild && typeof fieldVal === "number") {
    let fieldEquippedVal = field.value ? field.value : field.finalVal
    if (typeof fieldEquippedVal === "function")
      fieldEquippedVal = parseInt(fieldEquippedVal?.(talentLvlKey, equippedBuild.finalStats)?.toFixed?.(0))
    let diff = fieldVal - fieldEquippedVal
    fieldVal = <span>{fieldEquippedVal}{diff ? <span className={diff > 0 ? "text-success" : "text-danger"}> ({diff > 0 ? "+" : ""}{diff})</span> : ""}</span>
  }

  return <ListGroup.Item variant={index % 2 ? "customdark" : "customdarker"} className="p-2">
    <div>
      <span><b>{fieldText}</b>{fieldBasic}</span>
      <span className="float-right text-right">{fieldVal}</span>
    </div>
  </ListGroup.Item>
}