import type {
  LocationCharacterKey,
  LocationGenderedCharacterKey,
} from '@genshin-optimizer/gi/consts'
import { MediumTextMapOffset, type Translatable } from '../common'

type CharData = Record<
  string,
  Translatable | Record<string, Translatable | Record<string, Translatable>>
>
const char: Partial<
  Record<LocationCharacterKey | LocationGenderedCharacterKey, CharData>
> = {
  Columbina: {
    constellationName: 2821104034,
  },
  Eula: {
    skill: {
      brandDMG: [3765549071, 'skillParam'],
      grimheartDuration: [164817062, 'skillParam'],
    },
  },
  KaedeharaKazuha: {
    burst: {
      name: 2015878197,
      description: [1543060392, 'paragraph'],
      slashdmg: [439659606, 'skillParam'],
    },
  },
  KamisatoAyaka: {
    burst: {
      cutting: [373269062 - MediumTextMapOffset, 'skillParam'],
      bloom: [2543020158, 'skillParam'],
    },
  },
  Neuvillette: {
    constellationName: 1525610219 - MediumTextMapOffset,
  },
  Noelle: {
    skill: {
      triggerChance: [3971383039 - MediumTextMapOffset, 'skillParam'],
    },
    burst: {
      atkBonus: [4151293863 - MediumTextMapOffset, 'skillParam'],
    },
  },
  Traveler: {
    electro: {
      skill: {
        enerRegen: [2165261751, 'skillParam'],
        enerRechInc: [3328414367 - MediumTextMapOffset, 'skillParam'],
      },
      burst: {
        thunderDMG: [3560985918, 'skillParam'],
      },
    },
  },
  Zhongli: {
    constellationName: 2721221067,
  },
}
export default char
