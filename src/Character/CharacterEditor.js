import React from 'react';
import { Button, Card, Dropdown, DropdownButton, FormControl, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignature, faTint, faFistRaised, faShieldAlt, faMagic, faDice, faDiceD20, faFirstAid, faSync, faGavel } from '@fortawesome/free-solid-svg-icons'
import { artifactStats } from '../Artifact/ArtifactData';
import Artifact from '../Artifact/Artifact';
import { FloatFormControl, IntFormControl } from '../Components/CustomFormControl';
export default class CharacterEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = CharacterEditor.getInitialState();
  }
  static initialState = {
    name: "",
    hp: 0,
    atk: 0,
    def: 0,
    ele_mas: 0,
    crit_rate: 0,
    crit_dmg: 0,
    heal_bonu: 0,
    ener_rech: 0,
    weapon_atk: 0,
    weaponStatKey: "",
    weaponStatVal: 0
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
    let percentWeaponStatSelect =
      this.state.weaponStatKey ? Artifact.getStatUnit(this.state.weaponStatKey) === "%" : false;
    let weaponprops = {
      placeholder: "Weapon 2nd Stat",
      value: this.state.weaponStatVal ? this.state.weaponStatVal : "",
      onValueChange: (val) => this.setState({ weaponStatVal: val }),
      disabled: !this.state.weaponStatKey
    }
    let weaponSubStatInput = percentWeaponStatSelect ?
      <FloatFormControl {...weaponprops} />
      : <IntFormControl {...weaponprops} />

    return (<Card bg="darkcontent" text="lightfont">
      <Card.Header>Character Editor</Card.Header>
      <Card.Body>
        <InputGroup className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text><FontAwesomeIcon icon={faSignature} className="mr-2" /> Character Name</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl placeholder="A name to remember your character by."
            value={this.state.name}
            onChange={(e) => this.setState({ name: e.target.value })}
          />
        </InputGroup>
        <h5>Base Stats</h5>
        <this.StatInput
          name={<span><FontAwesomeIcon icon={faTint} className="mr-2" /> Base HP</span>}
          placeholder="Character Base Health, without stats or gear."
          value={this.state.hp}
          percent={false}
          onValueChange={(value) => this.setState({ hp: value })}
        />
        <this.StatInput
          name={<span><FontAwesomeIcon icon={faFistRaised} className="mr-2" /> Base ATK</span>}
          placeholder="Character Base Attack, without stats or gear."
          value={this.state.atk}
          percent={false}
          onValueChange={(value) => this.setState({ atk: value })}
        />
        <this.StatInput
          name={<span><FontAwesomeIcon icon={faShieldAlt} className="mr-2" /> Base DEF</span>}
          placeholder="Character Base Defence, without stats or gear."
          value={this.state.def}
          percent={false}
          onValueChange={(value) => this.setState({ def: value })}
        />
        <this.StatInput
          name={<span><FontAwesomeIcon icon={faMagic} className="mr-2" /> Base Elemental Mastery</span>}
          placeholder="Character Base Elemental Mastery, without stats or gear."
          value={this.state.ele_mas}
          percent={false}
          onValueChange={(value) => this.setState({ ele_mas: value })}
        />

        <h5>Advanced Stats</h5>
        <this.StatInput
          name={<span><FontAwesomeIcon icon={faDice} className="mr-2" /> Base Crit Rate</span>}
          placeholder="Character Base Crit Rate, without stats or gear."
          value={this.state.crit_rate}
          percent={true}
          onValueChange={(value) => this.setState({ crit_rate: value })}
        />
        <this.StatInput
          name={<span><FontAwesomeIcon icon={faDiceD20} className="mr-2" /> Base Crit Damage</span>}
          placeholder="Character Base Crit Damage, without stats or gear."
          value={this.state.crit_dmg}
          percent={true}
          onValueChange={(value) => this.setState({ crit_dmg: value })}
        />
        <this.StatInput
          name={<span><FontAwesomeIcon icon={faFirstAid} className="mr-2" /> Base Healing Bonus</span>}
          placeholder="Character Base Healing Bonus, without stats or gear."
          value={this.state.heal_bonu}
          percent={true}
          onValueChange={(value) => this.setState({ heal_bonu: value })}
        />
        <this.StatInput
          name={<span><FontAwesomeIcon icon={faSync} className="mr-2" /> Base Energy Recharge</span>}
          placeholder="Character Base Energy Recharge, without stats or gear."
          value={this.state.ener_rech}
          percent={true}
          onValueChange={(value) => this.setState({ ener_rech: value })}
        />
        <h5>Weapon Stats</h5>

        <this.StatInput
          name={<span><FontAwesomeIcon icon={faGavel} className="mr-2" /> Weapon ATK</span>}
          placeholder="Weapon Attack"
          value={this.state.weapon_atk}
          percent={false}
          onValueChange={(value) => this.setState({ weapon_atk: value })}
        />

        <InputGroup>
          <DropdownButton
            title={this.state.weaponStatKey ? artifactStats[this.state.weaponStatKey].name : "Weapon Stat"}
            as={InputGroup.Prepend}
          >
            <Dropdown.ItemText>Select a weapon secondary stat </Dropdown.ItemText>
            {Object.entries(artifactStats).map(([key, value]) =>
              <Dropdown.Item key={key} onClick={() => {
                this.setState({ weaponStatKey: key, weaponStatVal: null })
              }} >
                {value.name}
              </Dropdown.Item>)}
          </DropdownButton>
          {weaponSubStatInput}
          {percentWeaponStatSelect && (<InputGroup.Append>
            <InputGroup.Text>%</InputGroup.Text>
          </InputGroup.Append>)}
        </InputGroup>
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
