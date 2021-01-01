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
  let charDataObj = Character.getCDataObj(characterKey)
  let talent = charDataObj?.talent
  let { autoLevelKey = 0, skillLevelKey = 0, burstLevelKey = 0 } = talentLevelKeys
  let ascension = Character.getAscension(levelKey)
  let autoList = [["normal", "Normal Attack"], ["charged", "Charged Attack"], ["plunge", "Plunging Attack"]]

  let skillBurstList = [["skill", "Elemental Skill", "skillLevelKey", skillLevelKey], ["burst", "Elemental Burst", "burstLevelKey", burstLevelKey]]
  let setTalentLevel = (talentKey, talentlevel) => setState(state => {
    let talentLevelKeys = state.talentLevelKeys || {}
    talentLevelKeys[talentKey] = talentlevel
    return { talentLevelKeys }
  })
  let passivesList = [["passive1", "Unlocked at Ascension 1", 1], ["passive2", "Unlocked at Ascension 4", 4], ["passive3", "Unlocked by Default", 0]]
  return <>
    <Row>
      <Col xs={12} md={6} lg={4} className="mb-2">
        <SkillDisplayCard imgSrc={Character.getTalentImg(characterKey, "auto")} title={Character.getTalentName(characterKey, "auto")} subtitle={"Normal/Charged Attack"} talentLvlKey={autoLevelKey} setTalentLevel={editable ? ((l) => setTalentLevel("autoLevelKey", l)) : null}>
          {autoList.map(([autoKey, autoText], index) => {
            let { text, fields } = talent?.auto?.[autoKey] || { text: "", fields: [] }
            return <Row key={autoKey} className={(index < autoList.length - 1) ? "mb-2" : ""}>
              <Col xs={12}>
                <strong>{autoText}: </strong><span>{text}</span>
                <ListGroup className="text-white ml-n2 mr-n2">
                  {fields.map((field, i) => <FieldDisplay key={i} field={field} build={build} constellation={constellation} ascension={ascension} index={i} talentLvlKey={autoLevelKey} compareAgainstEquipped={compareAgainstEquipped} equippedBuild={equippedBuild} />)}
                </ListGroup>
              </Col>
            </Row>
          })}
        </SkillDisplayCard>
      </Col>
      {skillBurstList.map(([tKey, tText, talentKey, talentLvlKey]) => {
        let talentText = Character.getTalentText(characterKey, tKey)
        if (typeof talentText === "function")
          talentText = talentText(build.finalStats)
        let levelBoost = tKey === "skill" ? (constellation >= 3 ? 3 : 0) :
          tKey === "burst" && constellation >= 5 ? 3 : 0
        return <Col key={tKey} xs={12} md={6} lg={4} className="mb-2">
          <SkillDisplayCard imgSrc={Character.getTalentImg(characterKey, tKey)} title={Character.getTalentName(characterKey, tKey)} subtitle={tText} talentLvlKey={talentLvlKey} levelBoost={levelBoost} setTalentLevel={editable ? ((l) => setTalentLevel(talentKey, l)) : null} >
            <Row><Col xs={12}>
              <span>{Character.getTalentText(characterKey, tKey)}</span>
              <ListGroup className="text-white ml-n2 mr-n2">
                {Character.getTalentFields(characterKey, tKey).map((field, i) => <FieldDisplay key={i} field={field} build={build} constellation={constellation} ascension={ascension} index={i} talentLvlKey={talentLvlKey} levelBoost={levelBoost} compareAgainstEquipped={compareAgainstEquipped} equippedBuild={equippedBuild} />)}
              </ListGroup>
            </Col></Row>
          </SkillDisplayCard>
        </Col>
      })}
    </Row>
    <Row>
      {/* passives */}
      {passivesList.map(([tKey, tText, asc]) => {
        let talentText = Character.getTalentText(characterKey, tKey)
        let enabled = ascension >= asc
        if (typeof talentText === "function")
          talentText = talentText(build.finalStats)
        return <Col key={tKey} style={{ opacity: enabled ? 1 : 0.5 }} xs={12} md={4} className="mb-2">
          <SkillDisplayCard imgSrc={Character.getTalentImg(characterKey, tKey)} title={Character.getTalentName(characterKey, tKey)} subtitle={tText} >
            <Row><Col xs={12}>
              <span>{talentText}</span>
              <ListGroup className="text-white ml-n2 mr-n2">
                {Character.getTalentFields(characterKey, tKey).map((field, i) => <FieldDisplay key={i} field={field} build={build} constellation={constellation} ascension={ascension} index={i} />)}
              </ListGroup>
            </Col></Row>
          </SkillDisplayCard>
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
        let constellationText = Character.getConstellationText(characterKey, i)
        if (typeof constellationText === "function")
          constellationText = constellationText(build.finalStats)
        return <Col key={i} xs={12} md={4} className="mb-2" style={{ cursor: editable ? "pointer" : "default", opacity: constellation > i ? 1 : 0.5 }} onClick={editable ? (() => setState({ constellation: (i + 1) === constellation ? i : i + 1 })) : null}  >
          <SkillDisplayCard imgSrc={Character.getConstellationImg(characterKey, i)} title={Character.getConstellationName(characterKey, i)} subtitle={`Contellation Lv. ${i + 1}`} >
            <Row><Col xs={12}><span>{constellationText}</span>
              <ListGroup className="text-white ml-n2 mr-n2">
                {Character.getConstellationFields(characterKey, i).map((field, i) => <FieldDisplay key={i} field={field} build={build} constellation={constellation} ascension={ascension} index={i} />)}
              </ListGroup>
            </Col></Row>
          </SkillDisplayCard>
        </Col>
      })}
    </Row>
  </>
}

function SkillDisplayCard(props) {
  let { imgSrc, title, subtitle, children, talentLvlKey = undefined, setTalentLevel = null, levelBoost = 0 } = props
  let header = null
  if (setTalentLevel) {
    header = <Card.Header>
      <DropdownButton title={`Talent Lv. ${clamp(talentLvlKey + 1 + levelBoost, 1, 15)}`}>
        {[...Array(15).keys()].map(i =>
          i >= levelBoost && <Dropdown.Item key={i} onClick={() => setTalentLevel(i - levelBoost)}>Talent Lv. {i + 1}</Dropdown.Item>)}
      </DropdownButton>
    </Card.Header>
  } else if (typeof talentLvlKey === "number") {
    header = <Card.Header>
      {`Talent Level: ${clamp(talentLvlKey + 1 + levelBoost, 1, 15)}`}
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
      {children}
    </Card.Body>
  </Card>
}
function FieldDisplay(props) {
  let { field, index, talentLvlKey = 0, build, constellation, ascension, equippedBuild, compareAgainstEquipped, levelBoost = 0 } = props

  talentLvlKey = clamp(talentLvlKey + levelBoost, 0, 14)

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