import card from './Character_Lisa_Card.jpg'
import thumb from './Character_Lisa_Thumb.png'
import c1 from './Constellation_Infinite_Circuit.png'
import c2 from './Constellation_Electromagnetic_Field.png'
import c3 from './Constellation_Resonant_Thunder.png'
import c4 from './Constellation_Plasma_Eruption.png'
import c5 from './Constellation_Electrocute.png'
import c6 from './Constellation_Pulsating_Witch.png'
import normal from './Talent_Lightning_Touch.png'
import skill from './Talent_Violet_Arc.png'
import burst from './Talent_Lightning_Rose.png'
import passive1 from './Talent_Induced_Aftershock.png'
import passive2 from './Talent_Static_Electricity_Field.png'
import passive3 from './Talent_General_Pharmaceutics.png'
let char = {
  card,
  thumb,
  constellation: [c1, c2, c3, c4, c5, c6],
  talent: {
    normal,
    skill,
    burst,
    passive1,
    passive2,
    passive3,
  }
};

export default char;
