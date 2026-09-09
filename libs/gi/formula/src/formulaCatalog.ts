// WARNING: Generated file, do not modify
import type { FormulaCatalog } from './formulaRef'

export const formulaCatalog = {
  stat: {
    hp: {
      sheet: 'stat',
      name: 'hp',
      dims: { final: { et: 'own', qt: 'final', q: 'hp', sheet: 'agg' } },
      exposeInProd: true,
    },
    atk: {
      sheet: 'stat',
      name: 'atk',
      dims: { final: { et: 'own', qt: 'final', q: 'atk', sheet: 'agg' } },
      exposeInProd: true,
    },
    def: {
      sheet: 'stat',
      name: 'def',
      dims: { final: { et: 'own', qt: 'final', q: 'def', sheet: 'agg' } },
      exposeInProd: true,
    },
    eleMas: {
      sheet: 'stat',
      name: 'eleMas',
      dims: { final: { et: 'own', qt: 'final', q: 'eleMas', sheet: 'agg' } },
      exposeInProd: true,
    },
    enerRech_: {
      sheet: 'stat',
      name: 'enerRech_',
      dims: { final: { et: 'own', qt: 'final', q: 'enerRech_', sheet: 'agg' } },
      exposeInProd: true,
    },
    cappedCritRate_: {
      sheet: 'stat',
      name: 'cappedCritRate_',
      dims: {
        common: {
          et: 'own',
          qt: 'common',
          q: 'cappedCritRate_',
          sheet: 'static',
        },
      },
      exposeInProd: true,
    },
    critDMG_: {
      sheet: 'stat',
      name: 'critDMG_',
      dims: { final: { et: 'own', qt: 'final', q: 'critDMG_', sheet: 'agg' } },
      exposeInProd: true,
    },
    heal_: {
      sheet: 'stat',
      name: 'heal_',
      dims: { final: { et: 'own', qt: 'final', q: 'heal_', sheet: 'agg' } },
      exposeInProd: true,
    },
    hydro_dmg_: {
      sheet: 'stat',
      name: 'hydro_dmg_',
      dims: {
        final: {
          et: 'own',
          qt: 'final',
          q: 'dmg_',
          sheet: 'agg',
          ele: 'hydro',
        },
      },
      exposeInProd: true,
    },
    physical_dmg_: {
      sheet: 'stat',
      name: 'physical_dmg_',
      dims: {
        final: {
          et: 'own',
          qt: 'final',
          q: 'dmg_',
          sheet: 'agg',
          ele: 'physical',
        },
      },
      exposeInProd: true,
    },
    geo_dmg_: {
      sheet: 'stat',
      name: 'geo_dmg_',
      dims: {
        final: { et: 'own', qt: 'final', q: 'dmg_', sheet: 'agg', ele: 'geo' },
      },
      exposeInProd: true,
    },
    dendro_dmg_: {
      sheet: 'stat',
      name: 'dendro_dmg_',
      dims: {
        final: {
          et: 'own',
          qt: 'final',
          q: 'dmg_',
          sheet: 'agg',
          ele: 'dendro',
        },
      },
      exposeInProd: true,
    },
    cryo_dmg_: {
      sheet: 'stat',
      name: 'cryo_dmg_',
      dims: {
        final: { et: 'own', qt: 'final', q: 'dmg_', sheet: 'agg', ele: 'cryo' },
      },
      exposeInProd: true,
    },
    electro_dmg_: {
      sheet: 'stat',
      name: 'electro_dmg_',
      dims: {
        final: {
          et: 'own',
          qt: 'final',
          q: 'dmg_',
          sheet: 'agg',
          ele: 'electro',
        },
      },
      exposeInProd: true,
    },
    pyro_dmg_: {
      sheet: 'stat',
      name: 'pyro_dmg_',
      dims: {
        final: { et: 'own', qt: 'final', q: 'dmg_', sheet: 'agg', ele: 'pyro' },
      },
      exposeInProd: true,
    },
    anemo_dmg_: {
      sheet: 'stat',
      name: 'anemo_dmg_',
      dims: {
        final: {
          et: 'own',
          qt: 'final',
          q: 'dmg_',
          sheet: 'agg',
          ele: 'anemo',
        },
      },
      exposeInProd: true,
    },
  },
  Aino: {
    normal1: {
      sheet: 'Aino',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Aino',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Albedo: {
    normal1: {
      sheet: 'Albedo',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Albedo',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Alhaitham: {
    normal1: {
      sheet: 'Alhaitham',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Alhaitham',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Aloy: {
    normal1: {
      sheet: 'Aloy',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Aloy',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Alyosha: {
    normal1: {
      sheet: 'Alyosha',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Alyosha',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Amber: {
    normal1: {
      sheet: 'Amber',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Amber',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  AratakiItto: {
    normal1: {
      sheet: 'AratakiItto',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'AratakiItto',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Arlecchino: {
    normal1: {
      sheet: 'Arlecchino',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Arlecchino',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Baizhu: {
    normal1: {
      sheet: 'Baizhu',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Baizhu',
          move: 'normal',
          ele: 'dendro',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Barbara: {
    normal1: {
      sheet: 'Barbara',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Barbara',
          move: 'normal',
          ele: 'hydro',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Beidou: {
    normal1: {
      sheet: 'Beidou',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Beidou',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Bennett: {
    normal1: {
      sheet: 'Bennett',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Bennett',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Candace: {
    normal_0: {
      sheet: 'Candace',
      name: 'normal_0',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Candace',
          move: 'normal',
          name: 'normal_0',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    normal_1: {
      sheet: 'Candace',
      name: 'normal_1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Candace',
          move: 'normal',
          name: 'normal_1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    normal_2: {
      sheet: 'Candace',
      name: 'normal_2',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Candace',
          move: 'normal',
          name: 'normal_2',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    normal_3: {
      sheet: 'Candace',
      name: 'normal_3',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Candace',
          move: 'normal',
          name: 'normal_3',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    normal_4: {
      sheet: 'Candace',
      name: 'normal_4',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Candace',
          move: 'normal',
          name: 'normal_4',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    charged: {
      sheet: 'Candace',
      name: 'charged',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Candace',
          move: 'charged',
          name: 'charged',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    plunging_dmg: {
      sheet: 'Candace',
      name: 'plunging_dmg',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Candace',
          move: 'plunging',
          name: 'plunging_dmg',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    plunging_low: {
      sheet: 'Candace',
      name: 'plunging_low',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Candace',
          move: 'plunging',
          name: 'plunging_low',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    plunging_high: {
      sheet: 'Candace',
      name: 'plunging_high',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Candace',
          move: 'plunging',
          name: 'plunging_high',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    skill_basic: {
      sheet: 'Candace',
      name: 'skill_basic',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Candace',
          move: 'skill',
          ele: 'hydro',
          name: 'skill_basic',
        },
      },
      exposeInProd: true,
      category: 'skill',
    },
    skill_charged: {
      sheet: 'Candace',
      name: 'skill_charged',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Candace',
          move: 'skill',
          ele: 'hydro',
          name: 'skill_charged',
        },
      },
      exposeInProd: true,
      category: 'skill',
    },
    burst_skill: {
      sheet: 'Candace',
      name: 'burst_skill',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Candace',
          move: 'burst',
          ele: 'hydro',
          name: 'burst_skill',
        },
      },
      exposeInProd: true,
      category: 'burst',
    },
    burst_wave: {
      sheet: 'Candace',
      name: 'burst_wave',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Candace',
          move: 'burst',
          ele: 'hydro',
          name: 'burst_wave',
        },
      },
      exposeInProd: true,
      category: 'burst',
    },
    skill_shield: {
      sheet: 'Candace',
      name: 'skill_shield',
      dims: {
        shield: {
          et: 'own',
          qt: 'formula',
          q: 'shield',
          sheet: 'Candace',
          name: 'skill_shield',
        },
      },
      exposeInProd: true,
      category: 'skill',
    },
    skill_hydroShield: {
      sheet: 'Candace',
      name: 'skill_hydroShield',
      dims: {
        shield: {
          et: 'own',
          qt: 'formula',
          q: 'shield',
          sheet: 'Candace',
          ele: 'hydro',
          name: 'skill_hydroShield',
        },
      },
      exposeInProd: true,
      category: 'skill',
    },
    c6: {
      sheet: 'Candace',
      name: 'c6',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Candace',
          move: 'burst',
          ele: 'hydro',
          name: 'c6',
        },
      },
      exposeInProd: true,
      category: 'burst',
    },
  },
  Charlotte: {
    normal1: {
      sheet: 'Charlotte',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Charlotte',
          move: 'normal',
          ele: 'cryo',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Chasca: {
    normal1: {
      sheet: 'Chasca',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Chasca',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Chevreuse: {
    normal1: {
      sheet: 'Chevreuse',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Chevreuse',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Chiori: {
    normal1: {
      sheet: 'Chiori',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Chiori',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Chongyun: {
    normal1: {
      sheet: 'Chongyun',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Chongyun',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Citlali: {
    normal1: {
      sheet: 'Citlali',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Citlali',
          move: 'normal',
          ele: 'cryo',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Clorinde: {
    normal1: {
      sheet: 'Clorinde',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Clorinde',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Collei: {
    normal1: {
      sheet: 'Collei',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Collei',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Columbina: {
    normal1: {
      sheet: 'Columbina',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Columbina',
          move: 'normal',
          ele: 'hydro',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Cyno: {
    normal1: {
      sheet: 'Cyno',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Cyno',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Dahlia: {
    normal1: {
      sheet: 'Dahlia',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Dahlia',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Dehya: {
    normal1: {
      sheet: 'Dehya',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Dehya',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Diluc: {
    normal1: {
      sheet: 'Diluc',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Diluc',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Diona: {
    normal1: {
      sheet: 'Diona',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Diona',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Dori: {
    normal1: {
      sheet: 'Dori',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Dori',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Durin: {
    normal1: {
      sheet: 'Durin',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Durin',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Emilie: {
    normal1: {
      sheet: 'Emilie',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Emilie',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Escoffier: {
    normal1: {
      sheet: 'Escoffier',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Escoffier',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Eula: {
    normal1: {
      sheet: 'Eula',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Eula',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Faruzan: {
    normal1: {
      sheet: 'Faruzan',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Faruzan',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Fischl: {
    normal1: {
      sheet: 'Fischl',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Fischl',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Flins: {
    normal1: {
      sheet: 'Flins',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Flins',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Freminet: {
    normal1: {
      sheet: 'Freminet',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Freminet',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Furina: {
    normal1: {
      sheet: 'Furina',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Furina',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Gaming: {
    normal1: {
      sheet: 'Gaming',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Gaming',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Ganyu: {
    normal1: {
      sheet: 'Ganyu',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Ganyu',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Gorou: {
    normal1: {
      sheet: 'Gorou',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Gorou',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  HuTao: {
    normal1: {
      sheet: 'HuTao',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'HuTao',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Iansan: {
    normal1: {
      sheet: 'Iansan',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Iansan',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Illuga: {
    normal1: {
      sheet: 'Illuga',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Illuga',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Ifa: {
    normal1: {
      sheet: 'Ifa',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Ifa',
          move: 'normal',
          ele: 'anemo',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Ineffa: {
    normal1: {
      sheet: 'Ineffa',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Ineffa',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Jahoda: {
    normal1: {
      sheet: 'Jahoda',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Jahoda',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Jean: {
    normal1: {
      sheet: 'Jean',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Jean',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Kachina: {
    normal1: {
      sheet: 'Kachina',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Kachina',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  KaedeharaKazuha: {
    normal1: {
      sheet: 'KaedeharaKazuha',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'KaedeharaKazuha',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Kaeya: {
    normal1: {
      sheet: 'Kaeya',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Kaeya',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  KamisatoAyaka: {
    normal1: {
      sheet: 'KamisatoAyaka',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'KamisatoAyaka',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  KamisatoAyato: {
    normal1: {
      sheet: 'KamisatoAyato',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'KamisatoAyato',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Kaveh: {
    normal1: {
      sheet: 'Kaveh',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Kaveh',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Keqing: {
    normal1: {
      sheet: 'Keqing',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Keqing',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Kinich: {
    normal1: {
      sheet: 'Kinich',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Kinich',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Kirara: {
    normal1: {
      sheet: 'Kirara',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Kirara',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Klee: {
    normal1: {
      sheet: 'Klee',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Klee',
          move: 'normal',
          ele: 'pyro',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  KujouSara: {
    normal1: {
      sheet: 'KujouSara',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'KujouSara',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  KukiShinobu: {
    normal1: {
      sheet: 'KukiShinobu',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'KukiShinobu',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  LanYan: {
    normal1: {
      sheet: 'LanYan',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'LanYan',
          move: 'normal',
          ele: 'anemo',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Lauma: {
    normal1: {
      sheet: 'Lauma',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Lauma',
          move: 'normal',
          ele: 'dendro',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Layla: {
    normal1: {
      sheet: 'Layla',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Layla',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Linnea: {
    normal1: {
      sheet: 'Linnea',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Linnea',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Lisa: {
    normal1: {
      sheet: 'Lisa',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Lisa',
          move: 'normal',
          ele: 'electro',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Lohen: {
    normal1: {
      sheet: 'Lohen',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Lohen',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Lynette: {
    normal1: {
      sheet: 'Lynette',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Lynette',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Lyney: {
    normal1: {
      sheet: 'Lyney',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Lyney',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Mavuika: {
    normal1: {
      sheet: 'Mavuika',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Mavuika',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Mika: {
    normal1: {
      sheet: 'Mika',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Mika',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Mona: {
    normal1: {
      sheet: 'Mona',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Mona',
          move: 'normal',
          ele: 'hydro',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Mualani: {
    normal1: {
      sheet: 'Mualani',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Mualani',
          move: 'normal',
          ele: 'hydro',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Nahida: {
    normal_0: {
      sheet: 'Nahida',
      name: 'normal_0',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nahida',
          move: 'normal',
          ele: 'dendro',
          name: 'normal_0',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    normal_1: {
      sheet: 'Nahida',
      name: 'normal_1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nahida',
          move: 'normal',
          ele: 'dendro',
          name: 'normal_1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    normal_2: {
      sheet: 'Nahida',
      name: 'normal_2',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nahida',
          move: 'normal',
          ele: 'dendro',
          name: 'normal_2',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    normal_3: {
      sheet: 'Nahida',
      name: 'normal_3',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nahida',
          move: 'normal',
          ele: 'dendro',
          name: 'normal_3',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    charged: {
      sheet: 'Nahida',
      name: 'charged',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nahida',
          move: 'charged',
          ele: 'dendro',
          name: 'charged',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    plunging_dmg: {
      sheet: 'Nahida',
      name: 'plunging_dmg',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nahida',
          move: 'plunging',
          ele: 'dendro',
          name: 'plunging_dmg',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    plunging_low: {
      sheet: 'Nahida',
      name: 'plunging_low',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nahida',
          move: 'plunging',
          ele: 'dendro',
          name: 'plunging_low',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    plunging_high: {
      sheet: 'Nahida',
      name: 'plunging_high',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nahida',
          move: 'plunging',
          ele: 'dendro',
          name: 'plunging_high',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    skill_press: {
      sheet: 'Nahida',
      name: 'skill_press',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nahida',
          move: 'skill',
          ele: 'dendro',
          name: 'skill_press',
        },
      },
      exposeInProd: true,
      category: 'skill',
    },
    skill_hold: {
      sheet: 'Nahida',
      name: 'skill_hold',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nahida',
          move: 'skill',
          ele: 'dendro',
          name: 'skill_hold',
        },
      },
      exposeInProd: true,
      category: 'skill',
    },
    karma_dmg: {
      sheet: 'Nahida',
      name: 'karma_dmg',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nahida',
          move: 'skill',
          ele: 'dendro',
          name: 'karma_dmg',
        },
      },
      exposeInProd: true,
      category: 'skill',
    },
  },
  Navia: {
    normal1: {
      sheet: 'Navia',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Navia',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Nefer: {
    normal1: {
      sheet: 'Nefer',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nefer',
          move: 'normal',
          ele: 'dendro',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Neuvillette: {
    normal1: {
      sheet: 'Neuvillette',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Neuvillette',
          move: 'normal',
          ele: 'hydro',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Nicole: {
    normal1: {
      sheet: 'Nicole',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nicole',
          move: 'normal',
          ele: 'pyro',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Nilou: {
    normal_0: {
      sheet: 'Nilou',
      name: 'normal_0',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nilou',
          move: 'normal',
          name: 'normal_0',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    normal_1: {
      sheet: 'Nilou',
      name: 'normal_1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nilou',
          move: 'normal',
          name: 'normal_1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    normal_2: {
      sheet: 'Nilou',
      name: 'normal_2',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nilou',
          move: 'normal',
          name: 'normal_2',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    charged_1: {
      sheet: 'Nilou',
      name: 'charged_1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nilou',
          move: 'charged',
          name: 'charged_1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    charged_2: {
      sheet: 'Nilou',
      name: 'charged_2',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nilou',
          move: 'charged',
          name: 'charged_2',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    plunging_dmg: {
      sheet: 'Nilou',
      name: 'plunging_dmg',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nilou',
          move: 'plunging',
          name: 'plunging_dmg',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    plunging_low: {
      sheet: 'Nilou',
      name: 'plunging_low',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nilou',
          move: 'plunging',
          name: 'plunging_low',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    plunging_high: {
      sheet: 'Nilou',
      name: 'plunging_high',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nilou',
          move: 'plunging',
          name: 'plunging_high',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    skill_skill: {
      sheet: 'Nilou',
      name: 'skill_skill',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nilou',
          move: 'skill',
          ele: 'hydro',
          name: 'skill_skill',
        },
      },
      exposeInProd: true,
      category: 'skill',
    },
    skill_dance1: {
      sheet: 'Nilou',
      name: 'skill_dance1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nilou',
          move: 'skill',
          ele: 'hydro',
          name: 'skill_dance1',
        },
      },
      exposeInProd: true,
      category: 'skill',
    },
    skill_dance2: {
      sheet: 'Nilou',
      name: 'skill_dance2',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nilou',
          move: 'skill',
          ele: 'hydro',
          name: 'skill_dance2',
        },
      },
      exposeInProd: true,
      category: 'skill',
    },
    skill_whirl1: {
      sheet: 'Nilou',
      name: 'skill_whirl1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nilou',
          move: 'skill',
          ele: 'hydro',
          name: 'skill_whirl1',
        },
      },
      exposeInProd: true,
      category: 'skill',
    },
    skill_whirl2: {
      sheet: 'Nilou',
      name: 'skill_whirl2',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nilou',
          move: 'skill',
          ele: 'hydro',
          name: 'skill_whirl2',
        },
      },
      exposeInProd: true,
      category: 'skill',
    },
    skill_wheel: {
      sheet: 'Nilou',
      name: 'skill_wheel',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nilou',
          move: 'skill',
          ele: 'hydro',
          name: 'skill_wheel',
        },
      },
      exposeInProd: true,
      category: 'skill',
    },
    skill_moon: {
      sheet: 'Nilou',
      name: 'skill_moon',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nilou',
          move: 'skill',
          ele: 'hydro',
          name: 'skill_moon',
        },
      },
      exposeInProd: true,
      category: 'skill',
    },
    burst_skill: {
      sheet: 'Nilou',
      name: 'burst_skill',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nilou',
          move: 'burst',
          ele: 'hydro',
          name: 'burst_skill',
        },
      },
      exposeInProd: true,
      category: 'burst',
    },
    burst_aeon: {
      sheet: 'Nilou',
      name: 'burst_aeon',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Nilou',
          move: 'burst',
          ele: 'hydro',
          name: 'burst_aeon',
        },
      },
      exposeInProd: true,
      category: 'burst',
    },
  },
  Ningguang: {
    normal1: {
      sheet: 'Ningguang',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Ningguang',
          move: 'normal',
          ele: 'geo',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Noelle: {
    normal_0: {
      sheet: 'Noelle',
      name: 'normal_0',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Noelle',
          move: 'normal',
          name: 'normal_0',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    normal_1: {
      sheet: 'Noelle',
      name: 'normal_1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Noelle',
          move: 'normal',
          name: 'normal_1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    normal_2: {
      sheet: 'Noelle',
      name: 'normal_2',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Noelle',
          move: 'normal',
          name: 'normal_2',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    normal_3: {
      sheet: 'Noelle',
      name: 'normal_3',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Noelle',
          move: 'normal',
          name: 'normal_3',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    charged_spinning: {
      sheet: 'Noelle',
      name: 'charged_spinning',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Noelle',
          move: 'charged',
          name: 'charged_spinning',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    charged_final: {
      sheet: 'Noelle',
      name: 'charged_final',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Noelle',
          move: 'charged',
          name: 'charged_final',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    plunging_dmg: {
      sheet: 'Noelle',
      name: 'plunging_dmg',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Noelle',
          move: 'plunging',
          name: 'plunging_dmg',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    plunging_low: {
      sheet: 'Noelle',
      name: 'plunging_low',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Noelle',
          move: 'plunging',
          name: 'plunging_low',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    plunging_high: {
      sheet: 'Noelle',
      name: 'plunging_high',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Noelle',
          move: 'plunging',
          name: 'plunging_high',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
    skill: {
      sheet: 'Noelle',
      name: 'skill',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Noelle',
          move: 'skill',
          ele: 'geo',
          name: 'skill',
        },
      },
      exposeInProd: true,
      category: 'skill',
    },
    skill_shield: {
      sheet: 'Noelle',
      name: 'skill_shield',
      dims: {
        shield: {
          et: 'own',
          qt: 'formula',
          q: 'shield',
          sheet: 'Noelle',
          ele: 'geo',
          name: 'skill_shield',
        },
      },
      exposeInProd: true,
      category: 'skill',
    },
    skill_heal: {
      sheet: 'Noelle',
      name: 'skill_heal',
      dims: {
        heal: {
          et: 'own',
          qt: 'formula',
          q: 'heal',
          sheet: 'Noelle',
          name: 'skill_heal',
        },
      },
      exposeInProd: true,
      category: 'skill',
    },
    burst: {
      sheet: 'Noelle',
      name: 'burst',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Noelle',
          move: 'burst',
          ele: 'geo',
          name: 'burst',
        },
      },
      exposeInProd: true,
      category: 'burst',
    },
    burst_skill: {
      sheet: 'Noelle',
      name: 'burst_skill',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Noelle',
          move: 'burst',
          ele: 'geo',
          name: 'burst_skill',
        },
      },
      exposeInProd: true,
      category: 'burst',
    },
    burst_atkFromDef: {
      sheet: 'Noelle',
      name: 'burst_atkFromDef',
      dims: {
        param: {
          et: 'own',
          qt: 'formula',
          q: 'param',
          sheet: 'Noelle',
          name: 'burst_atkFromDef',
        },
      },
      exposeInProd: false,
      category: 'burst',
    },
    a1_shield: {
      sheet: 'Noelle',
      name: 'a1_shield',
      dims: {
        shield: {
          et: 'own',
          qt: 'formula',
          q: 'shield',
          sheet: 'Noelle',
          ele: 'geo',
          name: 'a1_shield',
        },
      },
      exposeInProd: true,
      category: 'passive1',
    },
    c4: {
      sheet: 'Noelle',
      name: 'c4',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Noelle',
          move: 'elemental',
          ele: 'geo',
          name: 'c4',
        },
      },
      exposeInProd: true,
      category: 'constellation4',
    },
    charged_stamina: {
      sheet: 'Noelle',
      name: 'charged_stamina',
      dims: {
        param: {
          et: 'own',
          qt: 'formula',
          q: 'param',
          sheet: 'Noelle',
          name: 'charged_stamina',
        },
      },
      exposeInProd: false,
      category: 'auto',
    },
    charged_duration: {
      sheet: 'Noelle',
      name: 'charged_duration',
      dims: {
        param: {
          et: 'own',
          qt: 'formula',
          q: 'param',
          sheet: 'Noelle',
          name: 'charged_duration',
        },
      },
      exposeInProd: false,
      category: 'auto',
    },
    skill_healChance: {
      sheet: 'Noelle',
      name: 'skill_healChance',
      dims: {
        param: {
          et: 'own',
          qt: 'formula',
          q: 'param',
          sheet: 'Noelle',
          name: 'skill_healChance',
        },
      },
      exposeInProd: false,
      category: 'skill',
    },
    skill_duration: {
      sheet: 'Noelle',
      name: 'skill_duration',
      dims: {
        param: {
          et: 'own',
          qt: 'formula',
          q: 'param',
          sheet: 'Noelle',
          name: 'skill_duration',
        },
      },
      exposeInProd: false,
      category: 'skill',
    },
    skill_cd: {
      sheet: 'Noelle',
      name: 'skill_cd',
      dims: {
        param: {
          et: 'own',
          qt: 'formula',
          q: 'param',
          sheet: 'Noelle',
          name: 'skill_cd',
        },
      },
      exposeInProd: false,
      category: 'skill',
    },
    burst_duration: {
      sheet: 'Noelle',
      name: 'burst_duration',
      dims: {
        param: {
          et: 'own',
          qt: 'formula',
          q: 'param',
          sheet: 'Noelle',
          name: 'burst_duration',
        },
      },
      exposeInProd: false,
      category: 'burst',
    },
    burst_cd: {
      sheet: 'Noelle',
      name: 'burst_cd',
      dims: {
        param: {
          et: 'own',
          qt: 'formula',
          q: 'param',
          sheet: 'Noelle',
          name: 'burst_cd',
        },
      },
      exposeInProd: false,
      category: 'burst',
    },
    burst_enerCost: {
      sheet: 'Noelle',
      name: 'burst_enerCost',
      dims: {
        param: {
          et: 'own',
          qt: 'formula',
          q: 'param',
          sheet: 'Noelle',
          name: 'burst_enerCost',
        },
      },
      exposeInProd: false,
      category: 'burst',
    },
    a1_duration: {
      sheet: 'Noelle',
      name: 'a1_duration',
      dims: {
        param: {
          et: 'own',
          qt: 'formula',
          q: 'param',
          sheet: 'Noelle',
          name: 'a1_duration',
        },
      },
      exposeInProd: false,
      category: 'passive1',
    },
    a1_cd: {
      sheet: 'Noelle',
      name: 'a1_cd',
      dims: {
        param: {
          et: 'own',
          qt: 'formula',
          q: 'param',
          sheet: 'Noelle',
          name: 'a1_cd',
        },
      },
      exposeInProd: false,
      category: 'passive1',
    },
    c2_charged_dmg_: {
      sheet: 'Noelle',
      name: 'c2_charged_dmg_',
      dims: {
        param: {
          et: 'own',
          qt: 'formula',
          q: 'param',
          sheet: 'Noelle',
          name: 'c2_charged_dmg_',
        },
      },
      exposeInProd: false,
      category: 'constellation2',
    },
    c2_staminaChargedDec_: {
      sheet: 'Noelle',
      name: 'c2_staminaChargedDec_',
      dims: {
        param: {
          et: 'own',
          qt: 'formula',
          q: 'param',
          sheet: 'Noelle',
          name: 'c2_staminaChargedDec_',
        },
      },
      exposeInProd: false,
      category: 'constellation2',
    },
  },
  Odette: {
    normal1: {
      sheet: 'Odette',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Odette',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Ororon: {
    normal1: {
      sheet: 'Ororon',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Ororon',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Prune: {
    normal1: {
      sheet: 'Prune',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Prune',
          move: 'normal',
          ele: 'anemo',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Qiqi: {
    normal1: {
      sheet: 'Qiqi',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Qiqi',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  RaidenShogun: {
    normal1: {
      sheet: 'RaidenShogun',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'RaidenShogun',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Razor: {
    normal1: {
      sheet: 'Razor',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Razor',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Rosaria: {
    normal1: {
      sheet: 'Rosaria',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Rosaria',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Sandrone: {
    normal1: {
      sheet: 'Sandrone',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Sandrone',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  SangonomiyaKokomi: {
    normal1: {
      sheet: 'SangonomiyaKokomi',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'SangonomiyaKokomi',
          move: 'normal',
          ele: 'hydro',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Sayu: {
    normal1: {
      sheet: 'Sayu',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Sayu',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Sethos: {
    normal1: {
      sheet: 'Sethos',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Sethos',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Shenhe: {
    normal1: {
      sheet: 'Shenhe',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Shenhe',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  ShikanoinHeizou: {
    normal1: {
      sheet: 'ShikanoinHeizou',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'ShikanoinHeizou',
          move: 'normal',
          ele: 'anemo',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Sigewinne: {
    normal1: {
      sheet: 'Sigewinne',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Sigewinne',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Skirk: {
    normal1: {
      sheet: 'Skirk',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Skirk',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Somnia: {
    normal1: {
      sheet: 'Somnia',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Somnia',
          move: 'normal',
          ele: 'electro',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Sucrose: {
    normal1: {
      sheet: 'Sucrose',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Sucrose',
          move: 'normal',
          ele: 'anemo',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Tartaglia: {
    normal1: {
      sheet: 'Tartaglia',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Tartaglia',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Thoma: {
    normal1: {
      sheet: 'Thoma',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Thoma',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Tighnari: {
    normal1: {
      sheet: 'Tighnari',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Tighnari',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Varesa: {
    normal1: {
      sheet: 'Varesa',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Varesa',
          move: 'normal',
          ele: 'electro',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Varka: {
    normal1: {
      sheet: 'Varka',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Varka',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Venti: {
    normal1: {
      sheet: 'Venti',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Venti',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Wanderer: {
    normal1: {
      sheet: 'Wanderer',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Wanderer',
          move: 'normal',
          ele: 'anemo',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Wriothesley: {
    normal1: {
      sheet: 'Wriothesley',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Wriothesley',
          move: 'normal',
          ele: 'cryo',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Xiangling: {
    normal1: {
      sheet: 'Xiangling',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Xiangling',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Xianyun: {
    normal1: {
      sheet: 'Xianyun',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Xianyun',
          move: 'normal',
          ele: 'anemo',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Xiao: {
    normal1: {
      sheet: 'Xiao',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Xiao',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Xilonen: {
    normal1: {
      sheet: 'Xilonen',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Xilonen',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Xingqiu: {
    normal1: {
      sheet: 'Xingqiu',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Xingqiu',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Xinyan: {
    normal1: {
      sheet: 'Xinyan',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Xinyan',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  YaeMiko: {
    normal1: {
      sheet: 'YaeMiko',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'YaeMiko',
          move: 'normal',
          ele: 'electro',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Yanfei: {
    normal1: {
      sheet: 'Yanfei',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Yanfei',
          move: 'normal',
          ele: 'pyro',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Yaoyao: {
    normal1: {
      sheet: 'Yaoyao',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Yaoyao',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Yelan: {
    normal1: {
      sheet: 'Yelan',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Yelan',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Yoimiya: {
    normal1: {
      sheet: 'Yoimiya',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Yoimiya',
          move: 'normal',
          ele: 'physical',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  YumemizukiMizuki: {
    normal1: {
      sheet: 'YumemizukiMizuki',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'YumemizukiMizuki',
          move: 'normal',
          ele: 'anemo',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  YunJin: {
    normal1: {
      sheet: 'YunJin',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'YunJin',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Zhongli: {
    normal1: {
      sheet: 'Zhongli',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Zhongli',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  Zibai: {
    normal1: {
      sheet: 'Zibai',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Zibai',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  TravelerAnemo: {
    normal1: {
      sheet: 'TravelerAnemo',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'TravelerAnemo',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  TravelerGeo: {
    normal1: {
      sheet: 'TravelerGeo',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'TravelerGeo',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  TravelerElectro: {
    normal1: {
      sheet: 'TravelerElectro',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'TravelerElectro',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  TravelerDendro: {
    normal1: {
      sheet: 'TravelerDendro',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'TravelerDendro',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  TravelerHydro: {
    normal1: {
      sheet: 'TravelerHydro',
      name: 'normal1',
      dims: {
        dmg: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'TravelerHydro',
          move: 'normal',
          name: 'normal1',
        },
      },
      exposeInProd: true,
      category: 'auto',
    },
  },
  PrototypeAmber: {
    heal: {
      sheet: 'PrototypeAmber',
      name: 'heal',
      dims: {
        heal: {
          et: 'own',
          qt: 'formula',
          q: 'heal',
          sheet: 'PrototypeAmber',
          name: 'heal',
        },
      },
      exposeInProd: true,
    },
  },
} as FormulaCatalog
