import card from './Character_Zhongli_Card.png'
import thumb from './Character_Zhongli_Thumb.png'
import c1 from './Constellation_Rock,_the_Backbone_of_Earth.png'
import c2 from './Constellation_Stone,_the_Cradle_of_Jade.png'
import c3 from './Constellation_Jade,_Shimmering_through_Darkness.png'
import c4 from './Constellation_Topaz,_Unbreakable_and_Fearless.png'
import c5 from './Constellation_Lazuli,_Herald_of_the_Order.png'
import c6 from './Constellation_Chrysos,_Bounty_of_Dominator.png'
import normal from './Talent_Rain_of_Stone.png'
import skill from './Talent_Dominus_Lapidis.png'
import burst from './Talent_Planet_Befall.png'
import passive1 from './Talent_Resonant_Waves.png'
import passive2 from './Talent_Dominance_of_Earth.png'
import passive3 from './Talent_Arcanum_of_Crystal.png'
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
