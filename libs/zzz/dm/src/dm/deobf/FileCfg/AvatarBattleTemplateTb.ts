import { readDMJSON } from '../../../util'
import type { GenericDmFile } from '../types'
import { generateMapping, generateTyping } from '../util'

const reverseMapping = {
  '0': 'todo', //'todo-KFPDJJGIPMK-DLLEAJCCCPEIdentical-KJAGPAMNACNIdentical-LHDFLMFCJBMIdentical-CPIEPGPJONPIdentical-GKAJKNIOBEHIdentical-JCPDKDBMGEGIdentical-BPHFIFBKGNLIdentical-IDOIIOPCJMIIdentical-BDMDGNGMHBEIdentical-MMGNDHFCKGCIdentical-NNAGNBNJJAHIdentical-NGNMPDPMNBMIdentical-IMENJAPMPGIIdentical-IAEELCIBHFHIdentical-OJJPCDPIIJKIdentical-DEBPMAEMEEI-GMPNLJBJICO-DMLEPEKIICF-NPJNFNINLDM-JHPNMEGHOOK-OIICMIMBHEJ',
  '1': 'todo-MADHAAEIJAG',
  '2': 'Specialty',
  '49': 'Defence',
  '93': 'AnomalyProficiency',
  '94': 'AnomalyMastery',
  '95': 'Attack',
  '100': 'todo-FGNNAADEBPH',
  '118': 'Impact',
  '120': 'todo-CLDCMDBJAKB-CIJOMLFAMJK', // One of these is SPRecovery and one is SPBarPoint
  '500': 'CritRate',
  '603': 'HP',
  '1011': 'AvatarId',
  '5000': 'CritDamage',
  '5011': 'AvatarPieceId',
  '10000': 'RblCorrectionFactor', // Not sure
  '54230': 'AttackGrowth',
  '66882': 'DefenceGrowth',
  '818426': 'HPGrowth',
  '576912969788645000': 'todo-BKDKAHOLHIJ',
  '10491841778352947000': 'todo-NGIEBDEJHJL',
  '10016991024130073000': 'todo-AJILFKOLOID',
  '["Anbi","Cut","Electric","Female","Camp1","Size2","AidTypeParry","Anbi","EtherEyesSize2"]':
    'Tags',
  '[4]': 'todo-HBBEIKMOMBD',
  '[203]': 'ElementType',
  '[101]': 'HitType',
  '["1:1:2","2:203:2"]': 'todo-ABEPBEFBACB',
  '[]': 'todo-OGFJHJKBFPE-DMGAIFADOEO', // DMGAIFADOEO is potential ID, handled below
  '"Bip001"': 'todo-PDEHMDDAKDA',
}

const avatarBattleTemplateTb = JSON.parse(
  readDMJSON('FileCfg/AvatarBattleTemplateTb.json')
) as GenericDmFile

const dmObj = Object.values(avatarBattleTemplateTb)[0][0]

const mapping = generateMapping(reverseMapping, dmObj)
const potentialsKey = Object.entries(
  Object.values(avatarBattleTemplateTb)[0].find((o) =>
    Object.values(o).some(
      (v) => JSON.stringify(v) === '[119100,119101,119102,119103,119104,119105]'
    )
  )!
).find(
  ([_, v]) =>
    JSON.stringify(v) === '[119100,119101,119102,119103,119104,119105]'
)![0]
mapping[potentialsKey] = 'Potentials'
const typing = generateTyping(reverseMapping, dmObj)
typing['Potentials'] = 'object'

export default {
  mapping,
  typing,
}
