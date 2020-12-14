import React from 'react';
import { Button, Card, Col, Dropdown, DropdownButton, FormControl, InputGroup, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignature, faTint, faFistRaised, faShieldAlt, faMagic, faDice, faDiceD20, faFirstAid, faSync, faGavel } from '@fortawesome/free-solid-svg-icons'
import { ArtifactStatsData, CharacterSpecializedStatKey, ElementalData } from '../Artifact/ArtifactData';
import Artifact from '../Artifact/Artifact';
import { FloatFormControl, IntFormControl } from '../Components/CustomFormControl';
import ElementalIcon from '../Components/ElementalIcon';
export default class CharacterEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = CharacterEditor.getInitialState();
  }
  static initialState = {
    name: "",
    element: Object.keys(ElementalData)[0],
    hp: 0,
    atk: 0,
    def: 0,
    ele_mas: 0,
    crit_rate: 5,
    crit_dmg: 50,
    heal_bonu: 0,
    ener_rech: 100,
    weapon_atk: 0,
    weaponStatKey: "",
    weaponStatVal: 0,
    specialStatKey: "",
    specialStatVal: 0,
  }
  static getInitialState = () => JSON.parse(JSON.stringify(CharacterEditor.initialState))

  StatInput = (props) => {
    const onValueChange = (v) =>
      props.onValueChange && props.onValueChange(v)
    return (<InputGroup className="mb-3">
      <InputGroup.Prepend>
        <InputGroup.Text>{props.name}</InputGroup.Text>
      </InputGroup.Prepend>
      {props.percent ? (
        <FloatFormControl
          placeholder={props.placeholder}
          value={props.value ? props.value : ""}
          onValueChange={onValueChange}
        />
      ) : (
          <IntFormControl
            placeholder={props.placeholder}
            value={props.value ? props.value : ""}
            onValueChange={onValueChange}
          />
        )}
      {props.percent && (<InputGroup.Append>
        <InputGroup.Text>%</InputGroup.Text>
      </InputGroup.Append>)}
    </InputGroup>)

  }
  componentDidUpdate = () => {
    if (this.props.characterToEdit && this.state.id !== this.props.characterToEdit.id)
      this.setState(this.props.characterToEdit)
  }
  render() {
    let percentWeaponStatSelect = Artifact.getStatUnit(this.state.weaponStatKey) === "%";
    let percentSpecialStatSlect = Artifact.getStatUnit(this.state.specialStatKey) === "%"
    let weaponprops = {
      placeholder: "Weapon 2nd Stat",
      value: this.state.weaponStatVal ? this.state.weaponStatVal : "",
      onValueChange: (val) => this.setState({ weaponStatVal: val }),
      disabled: !this.state.weaponStatKey
    }
    let weaponSubStatInput = percentWeaponStatSelect ?
      <FloatFormControl {...weaponprops} />
      : <IntFormControl {...weaponprops} />

    let specialStatProps = {
      placeholder: "Character Special Stat",
      value: this.state.specialStatVal ? this.state.specialStatVal : "",
      onValueChange: (val) => this.setState({ specialStatVal: val }),
      disabled: !this.state.specialStatKey
    }
    let specialStatInput = percentSpecialStatSlect ?
      <FloatFormControl {...specialStatProps} />
      : <IntFormControl {...specialStatProps} />

    return (<Card bg="darkcontent" text="lightfont">
      <Card.Header>Character Editor</Card.Header>
      <Card.Body>
        <InputGroup className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text><FontAwesomeIcon icon={faSignature} className="mr-2" /> Character Name</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl placeholder="Name"
            value={this.state.name}
            onChange={(e) => this.setState({ name: e.target.value })}
          />
          <InputGroup.Append>
            <InputGroup.Text>Character Element</InputGroup.Text>
          </InputGroup.Append>
          <DropdownButton
            title={this.state.element ?
              (<span>
                <FontAwesomeIcon icon={ElementalIcon[this.state.element]} className="fa-fw" />
                <span> {ElementalData[this.state.element].name}</span>
              </span>) : "Element"}
            as={InputGroup.Append}
          >
            <Dropdown.ItemText>Select Element </Dropdown.ItemText>
            {Object.entries(ElementalData).map(([key, val]) =>
              (<Dropdown.Item key={key} onClick={() =>
                (key !== this.state.element) && this.setState({ element: key })
              } >
                <span>
                  <FontAwesomeIcon icon={ElementalIcon[key]} className="fa-fw" />
                  <span> {val.name}</span>
                </span>
              </Dropdown.Item>)
            )}
          </DropdownButton>
        </InputGroup>
        <h5>Base Stats</h5>
        <Row className="mb-2">
          <Col lg={6} xs={12}>
            <this.StatInput
              name={<span><FontAwesomeIcon icon={faTint} className="mr-2" /> Base HP</span>}
              placeholder="Base Health"
              value={this.state.hp}
              percent={false}
              onValueChange={(value) => this.setState({ hp: value })}
            />
          </Col>
          <Col lg={6} xs={12}>
            <this.StatInput
              name={<span><FontAwesomeIcon icon={faFistRaised} className="mr-2" /> Base ATK</span>}
              placeholder="Base Attack"
              value={this.state.atk}
              percent={false}
              onValueChange={(value) => this.setState({ atk: value })}
            />
          </Col>
          <Col lg={6} xs={12}>
            <this.StatInput
              name={<span><FontAwesomeIcon icon={faShieldAlt} className="mr-2" /> Base DEF</span>}
              placeholder="Base Defence"
              value={this.state.def}
              percent={false}
              onValueChange={(value) => this.setState({ def: value })}
            />
          </Col>
          <Col lg={6} xs={12}>
            <this.StatInput
              name={<span><FontAwesomeIcon icon={faMagic} className="mr-2" /> Base Elemental Mastery</span>}
              placeholder="Elemental Mastery"
              value={this.state.ele_mas}
              percent={false}
              onValueChange={(value) => this.setState({ ele_mas: value })}
            />
          </Col>
          <Col lg={6} xs={12}>
            <InputGroup>
              <DropdownButton
                title={Artifact.getStatNameWithPercent(this.state.specialStatKey, "Specialized Stat")}
                as={InputGroup.Prepend}
              >
                <Dropdown.ItemText>Select Specialized Stat </Dropdown.ItemText>
                {CharacterSpecializedStatKey.map(key =>
                  <Dropdown.Item key={key} onClick={() => {
                    this.setState({ specialStatKey: key, specialStatVal: 0 })
                  }} >
                    {Artifact.getStatNameWithPercent(key)}
                  </Dropdown.Item>)}
              </DropdownButton>
              {specialStatInput}
              {percentSpecialStatSlect && (<InputGroup.Append>
                <InputGroup.Text>%</InputGroup.Text>
              </InputGroup.Append>)}
            </InputGroup>
          </Col>
        </Row>
        <h5>Advanced Stats</h5>
        <Row>
          <Col lg={6} xs={12}>
            <this.StatInput
              name={<span><FontAwesomeIcon icon={faDice} className="mr-2" /> Base Crit Rate</span>}
              placeholder="Crit Rate"
              value={this.state.crit_rate}
              percent={true}
              onValueChange={(value) => this.setState({ crit_rate: value })}
            />
          </Col>
          <Col lg={6} xs={12}>
            <this.StatInput
              name={<span><FontAwesomeIcon icon={faDiceD20} className="mr-2" /> Base Crit Damage</span>}
              placeholder="Crit Damage"
              value={this.state.crit_dmg}
              percent={true}
              onValueChange={(value) => this.setState({ crit_dmg: value })}
            />
          </Col>
          <Col lg={6} xs={12}>
            <this.StatInput
              name={<span><FontAwesomeIcon icon={faFirstAid} className="mr-2" /> Base Healing Bonus</span>}
              placeholder="Healing Bonus"
              value={this.state.heal_bonu}
              percent={true}
              onValueChange={(value) => this.setState({ heal_bonu: value })}
            />
          </Col>
          <Col lg={6} xs={12}>
            <this.StatInput
              name={<span><FontAwesomeIcon icon={faSync} className="mr-2" /> Base Energy Recharge</span>}
              placeholder="Energy Recharge"
              value={this.state.ener_rech}
              percent={true}
              onValueChange={(value) => this.setState({ ener_rech: value })}
            />
          </Col>
        </Row>
        <h5>Weapon Stats</h5>
        <Row>
          <Col lg={6} xs={12}>
            <this.StatInput
              name={<span><FontAwesomeIcon icon={faGavel} className="mr-2" /> Weapon ATK</span>}
              placeholder="Weapon Attack"
              value={this.state.weapon_atk}
              percent={false}
              onValueChange={(value) => this.setState({ weapon_atk: value })}
            />
          </Col>
          <Col lg={6} xs={12}>
            <InputGroup>
              <DropdownButton
                title={Artifact.getStatNameWithPercent(this.state.weaponStatKey, "Weapon Stat")}
                as={InputGroup.Prepend}
              >
                <Dropdown.ItemText>Select a weapon secondary stat </Dropdown.ItemText>
                {Object.entries(ArtifactStatsData).map(([key, value]) =>
                  <Dropdown.Item key={key} onClick={() => {
                    this.setState({ weaponStatKey: key, weaponStatVal: null })
                  }} >
                    {Artifact.getStatNameWithPercent(key)}
                  </Dropdown.Item>)}
              </DropdownButton>
              {weaponSubStatInput}
              {percentWeaponStatSelect && (<InputGroup.Append>
                <InputGroup.Text>%</InputGroup.Text>
              </InputGroup.Append>)}
            </InputGroup>
          </Col>
        </Row>
      </Card.Body>
      <Card.Footer>
        <Button className="mr-3" onClick={() => {
          this.props.addCharacter && this.props.addCharacter(this.state)
          this.setState(CharacterEditor.getInitialState());
        }}>
          {this.props.characterToEdit ? "Save Character" : "Add Character"}
        </Button>
        <Button className="mr-3" variant="success"
          onClick={() => {
            this.props.cancelEdit && this.props.cancelEdit();
            this.setState(CharacterEditor.getInitialState());
          }}
        >
          Clear
          </Button>
      </Card.Footer>
    </Card>)
  }
}
