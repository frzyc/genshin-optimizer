type transID = number | [number, string]

interface ISkill {
  name: transID
  description: transID
  [key: string]: transID
}
export type ICharacter = {
  name: transID,
  auto: {
    name: transID,
    fields: transID
  }
  constellationName: transID,
  skill: ISkill,
  burst: ISkill,
  passive1: ISkill,
  passive2: ISkill,
  passive3: ISkill,
  constellation1: ISkill,
  constellation2: ISkill,
  constellation3: ISkill,
  constellation4: ISkill,
  constellation5: ISkill,
  constellation6: ISkill
}
export type IWeapon = {
  name: transID,
  passiveName: transID,
  passiveDescription: transID[]
  description: transID
}