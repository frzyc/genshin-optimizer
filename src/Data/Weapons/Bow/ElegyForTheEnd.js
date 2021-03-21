import img from './Weapon_Elegy_for_the_End.png'
const refinementEM = [60, 75, 90, 105, 120]
const refinementIncEM = [100, 125, 150, 175, 200]
const refinementATK_ = [20, 25, 30, 35, 40]
const weapon = {
  name: "Elegy for the End",
  weaponType: "bow",
  img,
  rarity: 5,
  passiveName: "The Parting Refrain",
  passiveDescription: (refineIndex) => <span>A part of the "Millennial Movement" that wanders amidst the winds. Increases Elemental Mastery by {refinementEM[refineIndex]}. When the Elemental Skills or Elemental Bursts of the character wielding this weapon hit opponents, that character gains a <b>Sigil of Remembrance</b>. This effect can be triggered once every 0.2s and can be triggered even if said character is not on the field. When you possess 4 Sigils of Remembrance, all of them will be consumed and all nearby party members will obtain the <b>"Millennial Movement: Farewell Song"</b> effect for 12s. "Millennial Movement: Farewell Song" increases Elemental Mastery by {refinementIncEM[refineIndex]} and increases ATK by {refinementATK_[refineIndex]}%. Once this effect is triggered, you will not gain Sigils of Remembrance for 20s. Of the many effects of the "Millennial Movement," buffs of the same type will not stack.</span>,//${refinementVals[refineIndex]}
  description: "A bow as lovely as any bard's lyre, its arrows pierce the heart like a lamenting sigh.",
  baseStats: {
    main: [46, 62, 82, 102, 122, 153, 173, 194, 214, 235, 266, 287, 308, 340, 361, 382, 414, 435, 457, 488, 510, 532, 563, 586, 608],
    subStatKey: "enerRech_",
    sub: [12, 13.9, 16.4, 18.8, 21.2, 21.2, 23.6, 26.1, 28.5, 30.9, 30.9, 33.3, 35.7, 35.7, 38.2, 40.6, 40.6, 43, 45.4, 45.4, 47.9, 50.3, 50.3, 52.7, 55.1],
  },
  stats: (refineIndex) => ({
    eleMas: refinementEM[refineIndex],
  }),
  conditional: {
    type: "weapon",
    sourceKey: "ElegyForTheEnd",
    maxStack: 1,
    stats: (refineIndex) => ({
      eleMas: refinementEM[refineIndex],
      atk_: refinementATK_[refineIndex]
    })
  }
}
export default weapon