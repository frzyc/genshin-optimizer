import card from './Character_Diluc_Card.jpg'
import thumb from './Character_Diluc_Thumb.png'
import c1 from './Constellation_Conviction.png'
import c2 from './Constellation_Searing_Ember.png'
import c3 from './Constellation_Fire_and_Steel.png'
import c4 from './Constellation_Flowing_Flame.png'
import c5 from './Constellation_Phoenix,_Harbinger_of_Dawn.png'
import c6 from './Constellation_Flaming_Sword,_Nemesis_of_Dark.png'
import normal from './Talent_Tempered_Sword.png'
import skill from './Talent_Searing_Onslaught.png'
import burst from './Talent_Dawn.png'
import passive1 from './Talent_Relentless.png'
import passive2 from './Talent_Blessing_of_Phoenix.png'
import passive3 from './Talent_Tradition_of_the_Dawn_Knight.png'
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
