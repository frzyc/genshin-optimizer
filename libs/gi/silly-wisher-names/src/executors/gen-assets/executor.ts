import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { langKeys } from '@genshin-optimizer/common/pipeline'
import { PROJROOT_PATH, languageMap } from '../../../Translated/util'
import type { GenAssetsExecutorSchema } from './schema'

const swKeyMap = {
  aether: 'TravelerM',
  aino: 'Aino',
  albedo: 'Albedo',
  alhaitham: 'Alhaitham',
  aloy: 'Aloy',
  amber: 'Amber',
  arlecchino: 'Arlecchino',
  ayaka: 'KamisatoAyaka',
  ayato: 'KamisatoAyato',
  baizhu: 'Baizhu',
  barbara: 'Barbara',
  beidou: 'Beidou',
  bennett: 'Bennett',
  candace: 'Candace',
  charlotte: 'Charlotte',
  chasca: 'Chasca',
  chevreuse: 'Chevreuse',
  chiori: 'Chiori',
  chongyun: 'Chongyun',
  citlali: 'Citlali',
  clorinde: 'Clorinde',
  collei: 'Collei',
  cyno: 'Cyno',
  dahlia: 'Dahlia',
  dehya: 'Dehya',
  diluc: 'Diluc',
  diona: 'Diona',
  dori: 'Dori',
  durin: 'Durin',
  emilie: 'Emilie',
  escoffier: 'Escoffier',
  eula: 'Eula',
  faruzan: 'Faruzan',
  fischl: 'Fischl',
  flins: 'Flins',
  freminet: 'Freminet',
  furina: 'Furina',
  gaming: 'Gaming',
  ganyu: 'Ganyu',
  gorou: 'Gorou',
  heizou: 'ShikanoinHeizou',
  hutao: 'HuTao',
  iansan: 'Iansan',
  ifa: 'Ifa',
  ineffa: 'Ineffa',
  itto: 'AratakiItto',
  jahoda: 'Jahoda',
  jean: 'Jean',
  kachina: 'Kachina',
  kaeya: 'Kaeya',
  kaveh: 'Kaveh',
  kazuha: 'KaedeharaKazuha',
  keqing: 'Keqing',
  kinich: 'Kinich',
  kirara: 'Kirara',
  klee: 'Klee',
  kokomi: 'SangonomiyaKokomi',
  kuki: 'KukiShinobu',
  lanyan: 'LanYan',
  lauma: 'Lauma',
  layla: 'Layla',
  lisa: 'Lisa',
  lumine: 'TravelerF',
  lynette: 'Lynette',
  lyney: 'Lyney',
  mavuika: 'Mavuika',
  mika: 'Mika',
  mona: 'Mona',
  mualani: 'Mualani',
  nahida: 'Nahida',
  navia: 'Navia',
  nefer: 'Nefer',
  neuvillette: 'Neuvillette',
  nilou: 'Nilou',
  ningguang: 'Ningguang',
  noelle: 'Noelle',
  ororon: 'Ororon',
  qiqi: 'Qiqi',
  raiden: 'RaidenShogun',
  razor: 'Razor',
  rosaria: 'Rosaria',
  sara: 'KujouSara',
  sayu: 'Sayu',
  sethos: 'Sethos',
  shenhe: 'Shenhe',
  sigewinne: 'Sigewinne',
  skirk: 'Skirk',
  sucrose: 'Sucrose',
  tartaglia: 'Tartaglia',
  thoma: 'Thoma',
  tighnari: 'Tighnari',
  varesa: 'Varesa',
  venti: 'Venti',
  wanderer: 'Wanderer',
  wriothesley: 'Wriothesley',
  xiangling: 'Xiangling',
  xianyun: 'Xianyun',
  xiao: 'Xiao',
  xilonen: 'Xilonen',
  xingqiu: 'Xingqiu',
  xinyan: 'Xinyan',
  yae: 'YaeMiko',
  yanfei: 'Yanfei',
  yaoyao: 'Yaoyao',
  yelan: 'Yelan',
  yoimiya: 'Yoimiya',
  yumemizuki: 'YumemizukiMizuki',
  yunjin: 'YunJin',
  zhongli: 'Zhongli',
} as const

export default async function runExecutor(_options: GenAssetsExecutorSchema) {
  const localeDir = `${PROJROOT_PATH}/assets/locales/`

  langKeys.forEach((langkey) => {
    const content = Object.fromEntries(
      Object.entries(languageMap[langkey])
        .filter(
          ([key]) =>
            key.startsWith('CharMemNames/') &&
            Object.keys(swKeyMap).some((swKey) => key.includes(swKey))
        )
        .map(([key, value]) => [
          swKeyMap[key.split('CharMemNames/')[1] as keyof typeof swKeyMap],
          value,
        ])
    )
    const fileDir = `${localeDir}${langkey}`
    if (!existsSync(fileDir)) mkdirSync(fileDir, { recursive: true })
    const fileName = `${fileDir}/sillywisher_charNames_gen.json`
    writeFileSync(fileName, JSON.stringify(content, undefined, 2) + '\n')
    console.log('Generated JSON at', fileName)
  })
  return {
    success: true,
  }
}
