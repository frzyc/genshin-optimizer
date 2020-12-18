import { faEdit, faGavel, faSave } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react"
import { Badge, Button, Card, Col, Dropdown, DropdownButton, Image, InputGroup, OverlayTrigger, Row, Tooltip } from "react-bootstrap"
import Artifact from "../../Artifact/Artifact"
import Assets from "../../Assets/Assets"
import { FloatFormControl, IntFormControl } from "../../Components/CustomFormControl"
import { Stars } from "../../Components/StarDisplay"
import StatIcon from "../../Components/StatIcon"
import Stat from "../../Stat"
import Character from "../Character"
import { CharacterSpecializedStatKey, ElementalData } from "../CharacterData"
import StatInput from "../StatInput"
export default function CharacterOverviewPane(props) {
  let { character: { characterKey, constellation }, editable, setOverridelevel, setConstellation } = props
  let [editLevel, setEditLevel] = useState(false)
  let elementKey = Character.getElementalKey(characterKey)
  let weaponTypeKey = Character.getWeaponTypeKey(characterKey)
  let level = Character.getLevelWithOverride(props.character)
  return <Row>
    <Col xs={12} lg={3} >
      {/* Image card with star and name and level */}
      <Card bg="lightcontent" text="lightfont" className="mb-2">
        <Card.Img src={Character.getCard(characterKey)} className="w-100 h-auto" />
        <Card.Body>
          <Row>
            <Col xs={12}>
              <h3>{Character.getName(characterKey)} <Image src={Assets.elements[elementKey]} className="inline-icon" /> <Image src={Assets.weapons?.[weaponTypeKey]} className="inline-icon" /></h3>
              <h6><Stars stars={Character.getStar(characterKey)} colored /></h6>
            </Col>
            <Col>
              {editLevel ? <Row><Col>
                <InputGroup >
                  <InputGroup.Prepend>
                    <InputGroup.Text>Lvl.</InputGroup.Text>
                  </InputGroup.Prepend>
                  <IntFormControl onValueChange={setOverridelevel} value={level} />
                  <InputGroup.Append>
                    <OverlayTrigger
                      placement="bottom"
                      overlay={<Tooltip>Changes the display level. Cosmetic only.</Tooltip>}
                    >
                      <Button variant="danger" onClick={() => setEditLevel(!editLevel)} size="sm">
                        <span><FontAwesomeIcon icon={faSave} /></span>
                      </Button>
                    </OverlayTrigger>
                  </InputGroup.Append>
                </InputGroup>
              </Col></Row> :
                <Row>
                  <Col>
                    <h5>Level: {level}</h5>
                  </Col>
                  {editable ? <Col xs="auto" className="pr-1 pl-1">
                    <Button variant="info" onClick={() => setEditLevel(!editLevel)} size="sm">
                      <span><FontAwesomeIcon icon={faEdit} /></span>
                    </Button>
                  </Col> : null}
                </Row>}
            </Col>
            <Col xs={12}>
              <Row>
                <Col xs={12}><h5>{Character.getConstellationName(characterKey)}</h5></Col>
                <Col>
                  <Row className="px-2">
                    {Assets.characters?.[characterKey]?.constellation?.map((con, i) =>
                      <Col xs={4} className="p-1" key={i}>
                        <Image src={con} className={`w-100 h-auto ${constellation > i ? "" : "overlay-dark"}`}
                          style={{ cursor: "pointer" }} roundedCircle onClick={editable ? (() =>
                            setConstellation((i + 1) === constellation ? i : i + 1)) : null} />
                      </Col>)}
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Col>
    <Col xs={12} lg={9} >
      <WeaponStatsEditorCard {...props} />
      <MainStatsCard {...props} />
    </Col>
  </Row >
}
function WeaponStatsEditorCard(props) {
  let { character: { weapon_atk, weaponStatKey, weaponStatVal }, editable, setWeaponAtk, setWeaponStateKey, setWeaponStatVal } = props
  let percentWeaponStatSelect = Stat.getStatUnit(weaponStatKey) === "%";
  let weaponprops = {
    placeholder: "Weapon 2nd Stat",
    value: (weaponStatVal || ""),
    onValueChange: setWeaponStatVal,
    disabled: !weaponStatKey
  }
  let weaponSubStatInput = percentWeaponStatSelect ?
    <FloatFormControl {...weaponprops} />
    : <IntFormControl {...weaponprops} />
  return <Card bg="lightcontent" text="lightfont" className="mb-2">
    <Card.Header>
      <span>Weapon <Badge variant="warning">WIP</Badge></span>
    </Card.Header>
    <Card.Body>
      <Row>
        <Col lg={6} xs={12}>
          {editable ? <StatInput
            name={<span><FontAwesomeIcon icon={faGavel} className="mr-2" /> Weapon ATK</span>}
            placeholder="Weapon Attack"
            value={weapon_atk}
            percent={false}
            onValueChange={setWeaponAtk}
          /> : <span><FontAwesomeIcon icon={faGavel} className="mr-2" /> Weapon ATK {weapon_atk}</span>}
        </Col>
        <Col lg={6} xs={12}>
          {editable ? <InputGroup>
            <DropdownButton
              title={Stat.getStatNameWithPercent(weaponStatKey, "Weapon Stat")}
              as={InputGroup.Prepend}
            >
              <Dropdown.ItemText>Select a weapon secondary stat </Dropdown.ItemText>
              {Artifact.getMainStatKeys().map(key =>
                <Dropdown.Item key={key} onClick={() => setWeaponStateKey(key)} >
                  {Stat.getStatNameWithPercent(key)}
                </Dropdown.Item>)}
            </DropdownButton>
            {weaponSubStatInput}
            {percentWeaponStatSelect && (<InputGroup.Append>
              <InputGroup.Text>%</InputGroup.Text>
            </InputGroup.Append>)}
          </InputGroup> : (weaponStatVal ? <span>{Stat.getStatName(weaponStatKey)} {weaponStatVal}{Stat.getStatUnit(weaponStatKey)}</span> : null)}
        </Col>
      </Row>
    </Card.Body>
  </Card>
}

function MainStatsCard(props) {
  let [editing, SetEditing] = useState(false)
  let [editingOther, SetEditingOther] = useState(false)

  const statKeys = ["hp", "atk", "def", "ele_mas", "crit_rate", "crit_dmg", "ener_rech", "heal_bonu"]
  const otherStatKeys = ["stam", "inc_heal", "pow_shield", "red_cd", "phy_dmg", "phy_res"]

  Object.keys(ElementalData).forEach(ele => {
    otherStatKeys.push(`${ele}_ele_dmg`)
    otherStatKeys.push(`${ele}_ele_res`)
  })

  let { editable, character, setOverride, equippedBuild, newBuild } = props
  let { character: { compareAgainstEquipped } } = props
  //choose which one to display stats for
  let build = newBuild ? newBuild : equippedBuild

  let specializedStatKey = Character.getStatValueWithOverride(character, "specializedStatKey")
  let specializedStatVal = Character.getStatValueWithOverride(character, "specializedStatVal");
  let specializedStatUnit = Stat.getStatUnit(specializedStatKey)

  let percentSpecialStatSlect = Stat.getStatUnit(specializedStatKey) === "%"
  let specialStatProps = {
    placeholder: "Character Special Stat",
    value: Character.getStatValueWithOverride(character, "specializedStatVal"),
    onValueChange: (value) => setOverride("specializedStatVal", value),
  }
  let specialStatInput = percentSpecialStatSlect ?
    <FloatFormControl {...specialStatProps} />
    : <IntFormControl {...specialStatProps} />

  const displayStats = (statKey) => {
    let statVal = Character.getStatValueWithOverride(character, statKey)
    let unit = Stat.getStatUnit(statKey)
    let buildDiff = (build?.finalStats?.[statKey] || 0) - statVal
    return <Col xs={12} lg={6} key={statKey}>
      <h6 className="d-inline">{StatIcon[statKey] ? <FontAwesomeIcon icon={StatIcon[statKey]} className="fa-fw" /> : null} {Stat.getStatName(statKey)}</h6>
      <span className={`float-right ${(editable && Character.hasOverride(character, statKey)) ? "text-warning" : ""}`}>
        {statVal?.toFixed(unit === "%" ? 1 : 0) + unit}
        {buildDiff ? <span className="text-success"> + {buildDiff?.toFixed(unit === "%" ? 1 : 0) + unit}</span> : null}
      </span>
    </Col>
  }
  const displayNewBuildDiff = (statKey) => {
    let statVal = (equippedBuild?.finalStats?.[statKey] || Character.getStatValueWithOverride(character, statKey))
    let unit = Stat.getStatUnit(statKey)
    let buildDiff = (newBuild?.finalStats?.[statKey] || 0) - (equippedBuild?.finalStats?.[statKey] || 0)

    return <Col xs={12} lg={6} key={statKey}>
      <h6 className="d-inline">{StatIcon[statKey] ? <FontAwesomeIcon icon={StatIcon[statKey]} className="fa-fw" /> : null} {Stat.getStatName(statKey)}</h6>
      <span className={`float-right ${(editable && Character.hasOverride(character, statKey)) ? "text-warning" : ""}`}>
        {statVal?.toFixed(unit === "%" ? 1 : 0) + unit}
        {buildDiff ? <span className={buildDiff > 0 ? "text-success" : "text-danger"}> ({buildDiff > 0 ? "+" : ""}{buildDiff?.toFixed(unit === "%" ? 1 : 0) + unit})</span> : null}
      </span>
    </Col>
  }
  return <>
    <Card bg="lightcontent" text="lightfont" className="mb-2">
      <Card.Header>
        <Row>
          <Col>
            <span>Main Base Stats</span>
          </Col>
          {editable ? <Col xs="auto" >
            <Button variant={editing ? "danger" : "info"} onClick={() => SetEditing(!editing)} size="sm">
              <span><FontAwesomeIcon icon={editing ? faSave : faEdit} /> {editing ? "EXIT" : "EDIT"}</span>
            </Button>
          </Col> : null}
        </Row>
      </Card.Header>
      {editing ?
        <Card.Body>
          <Row className="mb-2">
            {statKeys.map(statKey =>
              <Col lg={6} xs={12} key={statKey}><StatOverrideInput {...props} {...{ statKey, icon: StatIcon[statKey] }} /></Col>)}

            <Col lg={6} xs={12}>
              <InputGroup>
                <DropdownButton
                  title={Stat.getStatNameWithPercent(specializedStatKey, "Specialized Stat")}
                  as={InputGroup.Prepend}
                >
                  <Dropdown.ItemText>Select Specialized Stat </Dropdown.ItemText>
                  {CharacterSpecializedStatKey.map(key =>
                    <Dropdown.Item key={key} onClick={() => setOverride("specializedStatKey", key)} >
                      {Stat.getStatNameWithPercent(key)}
                    </Dropdown.Item>)}
                </DropdownButton>
                {specialStatInput}
                {percentSpecialStatSlect && (<InputGroup.Append>
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup.Append>)}
              </InputGroup>
            </Col>
          </Row>
        </Card.Body> :
        <Card.Body>
          <Row className="mb-2">
            {(newBuild && compareAgainstEquipped) ? statKeys.map(displayNewBuildDiff) : statKeys.map(displayStats)}
            {specializedStatVal ? <Col lg={6} xs={12}>
              <span><b>Specialized:</b> <span className={Character.hasOverride(character, "specializedStatKey") ? "text-warning" : ""}>{Stat.getStatName(specializedStatKey)}</span></span>
              <span className={`float-right ${Character.hasOverride(character, "specializedStatVal") ? "text-warning" : ""}`}>{`${specializedStatVal}${specializedStatUnit}`}</span>
            </Col> : null}
          </Row>
        </Card.Body>
      }
    </Card >
    <Card bg="lightcontent" text="lightfont" className="mb-2">
      <Card.Header>
        <Row>
          <Col>
            <span>Other Stats</span>
          </Col>
          {editable ? <Col xs="auto" >
            <Button variant={editingOther ? "danger" : "info"} onClick={() => SetEditingOther(!editingOther)} size="sm">
              <span><FontAwesomeIcon icon={editingOther ? faSave : faEdit} /> {editingOther ? "EXIT" : "EDIT"}</span>
            </Button>
          </Col> : null}
        </Row>
      </Card.Header>
      {editingOther ?
        <Card.Body>
          <Row className="mb-2">
            {otherStatKeys.map(statKey =>
              <Col lg={6} xs={12} key={statKey}><StatOverrideInput {...props} {...{ statKey, icon: StatIcon[statKey] }} /></Col>)}
          </Row>
        </Card.Body> :
        <Card.Body>
          <Row className="mb-2">
            {(newBuild && compareAgainstEquipped) ? otherStatKeys.map(displayNewBuildDiff) : otherStatKeys.map(displayStats)}
          </Row>
        </Card.Body>
      }
    </Card>
  </>
}


function StatOverrideInput(props) {
  let { character: { characterKey, levelKey }, statKey, icon, setOverride } = props
  return <StatInput
    className="mb-2"
    name={<span>{icon && <FontAwesomeIcon icon={icon} className="fa-fw" />} {Stat.getStatName(statKey)}</span>}
    placeholder={`Base ${Stat.getStatName(statKey)}`}
    value={Character.getStatValueWithOverride(props.character, statKey)}
    percent={false}
    onValueChange={(value) => setOverride(statKey, value)}
    defaultValue={Character.getBaseStatValue(characterKey, levelKey, statKey)}
  />
}
