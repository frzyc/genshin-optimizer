import card from './Character_Keqing_Card.jpg'
import thumb from './Character_Keqing_Thumb.png'
import c1 from './Constellation_Thundering_Might.png'
import c2 from './Constellation_Keen_Extraction.png'
import c3 from './Constellation_Foreseen_Reformation.png'
import c4 from './Constellation_Attunement.png'
import c5 from './Constellation_Beckoning_Stars.png'
import c6 from './Constellation_Tenacious_Star.png'
import normal from './Talent_Yunlai_Swordsmanship.png'
import skill from './Talent_Stellar_Restoration.png'
import burst from './Talent_Starward_Sword.png'
import passive1 from './Talent_Thundering_Penance.png'
import passive2 from './Talent_Aristocratic_Dignity.png'
import passive3 from './Talent_Land\'s_Overseer.png'
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
