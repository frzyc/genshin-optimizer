import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { NextImage } from '@genshin-optimizer/common/ui'
import { objKeyValMap, objMap } from '@genshin-optimizer/common/util'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  allElementKeys,
  allElementWithPhyKeys,
  allLunarReactionKeys,
} from '@genshin-optimizer/gi/consts'
import { Translate } from '@genshin-optimizer/gi/i18n'
import {
  AnemoIcon,
  CryoIcon,
  DendroIcon,
  ElectroIcon,
  GeoIcon,
  HydroIcon,
  PyroIcon,
} from '@genshin-optimizer/gi/svgicons'
import type { UIData } from '@genshin-optimizer/gi/uidata'
import {
  equal,
  greaterEq,
  inferInfoMut,
  infoMut,
  input,
  percent,
  sum,
  tally,
  target,
} from '@genshin-optimizer/gi/wr'
import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import type { CharacterSheet } from './Characters/CharacterSheet'
import ElementCycle from './ElementCycle'
import { activeCharBuff, cond, condReadNode, st, stg } from './SheetUtil'
import type { DocumentSection, IDocumentConditionalExclusive } from './sheet'

const tr = (strKey: string) => (
  <Translate ns="elementalResonance_gen" key18={strKey} />
)
const trm = (strKey: string) => (
  <Translate ns="elementalResonance" key18={strKey} />
)

export type IResonance = {
  name: ReactNode
  desc: ReactNode
  icon: ReactNode
  canShow: (data: UIData) => boolean
  sections: DocumentSection[]
}

const teamSize = sum(...allElementKeys.map((ele) => tally[ele]))

// Protective Canopy
const pcNodes = objKeyValMap(allElementWithPhyKeys, (e) => [
  `${e}_res_`,
  activeCharBuff(input.charKey, greaterEq(tally.ele, 4, percent(0.15)), {
    path: `${e}_res_`,
  }),
])

const protectiveCanopy: IResonance = {
  name: tr('ProtectiveCanopy.name'),
  desc: tr('ProtectiveCanopy.desc'),
  icon: (
    <span>
      <ElementCycle iconProps={iconInlineProps} /> x4
    </span>
  ),
  canShow: (data: UIData) => data.get(tally.ele).value >= 4,
  sections: [
    {
      teamBuff: true,
      fields: Object.values(pcNodes).map(([_n, node]) => ({ node })),
    },
  ],
}

// Fervent Flames
const [ffNodeDisp, ffNode] = activeCharBuff(
  input.charKey,
  greaterEq(teamSize, 4, greaterEq(tally.pyro, 2, percent(0.25))),
  { path: 'atk_' }
)
const ferventFlames: IResonance = {
  name: tr('FerventFlames.name'),
  desc: tr('FerventFlames.desc'),
  icon: (
    <span>
      <PyroIcon {...iconInlineProps} /> <PyroIcon {...iconInlineProps} />
    </span>
  ),
  canShow: (data: UIData) =>
    data.get(tally.pyro).value >= 2 && data.get(teamSize).value >= 4,
  sections: [
    {
      teamBuff: true,
      fields: [
        {
          text: st('effectDuration.cryo'),
          value: -40,
          unit: '%',
        },
        {
          node: ffNodeDisp,
        },
      ],
    },
  ],
}

// Soothing Waters
const [swNodeDisp, swNode] = activeCharBuff(
  input.charKey,
  greaterEq(teamSize, 4, greaterEq(tally.hydro, 2, percent(0.25))),
  { path: 'hp_' }
)
const soothingWaters: IResonance = {
  name: tr('SoothingWater.name'),
  desc: tr('SoothingWater.desc'),
  icon: (
    <span>
      <HydroIcon {...iconInlineProps} /> <HydroIcon {...iconInlineProps} />
    </span>
  ),
  canShow: (data: UIData) =>
    data.get(tally.hydro).value >= 2 && data.get(teamSize).value >= 4,
  sections: [
    {
      teamBuff: true,
      fields: [
        {
          text: st('effectDuration.pyro'),
          value: -40,
          unit: '%',
        },
        {
          node: swNodeDisp,
        },
      ],
    },
  ],
}

//ShatteringIce
const condSIPath = ['resonance', 'ShatteringIce']
const condSI = condReadNode(condSIPath)
const [siNodeDisp, siNode] = activeCharBuff(
  input.charKey,
  greaterEq(
    teamSize,
    4,
    greaterEq(tally.cryo, 2, equal(condSI, 'on', percent(0.15)))
  ),
  { path: 'critRate_' }
)
const shatteringIce: IResonance = {
  name: tr('ShatteringIce.name'),
  desc: tr('ShatteringIce.desc'),
  icon: (
    <span>
      <CryoIcon {...iconInlineProps} /> <CryoIcon {...iconInlineProps} />
    </span>
  ),
  canShow: (data: UIData) =>
    data.get(tally.cryo).value >= 2 && data.get(teamSize).value >= 4,
  sections: [
    {
      teamBuff: true,
      fields: [
        {
          text: st('effectDuration.electro'),
          value: -40,
          unit: '%',
        },
      ],
    },
    {
      teamBuff: true,
      path: condSIPath,
      value: condSI,
      name: st('enemyAffected.frozenOrCryo'),
      header: {
        title: tr('ShatteringIce.name'),
        icon: <CryoIcon />,
      },
      states: {
        on: {
          fields: [
            {
              node: siNodeDisp,
            },
          ],
        },
      },
    },
  ],
}

// High Voltage
const highVoltage: IResonance = {
  name: tr('HighVoltage.name'),
  desc: tr('HighVoltage.desc'),
  icon: (
    <span>
      <ElectroIcon {...iconInlineProps} /> <ElectroIcon {...iconInlineProps} />
    </span>
  ),
  canShow: (data: UIData) =>
    data.get(tally.electro).value >= 2 && data.get(teamSize).value >= 4,
  sections: [
    {
      teamBuff: true,
      fields: [
        {
          text: st('effectDuration.hydro'),
          value: -40,
          unit: '%',
        },
      ],
    },
  ],
}

// Impetuous Winds
const [iwNodeStamDisp, iwNodeStam] = activeCharBuff(
  input.charKey,
  greaterEq(teamSize, 4, greaterEq(tally.anemo, 2, percent(-0.15))),
  { path: 'staminaDec_' }
)
const [iwNodeMoveDisp, iwNodeMove] = activeCharBuff(
  input.charKey,
  greaterEq(teamSize, 4, greaterEq(tally.anemo, 2, percent(0.1))),
  { path: 'moveSPD_' }
)
const [iwNodeCDDisp, iwNodeCD] = activeCharBuff(
  input.charKey,
  greaterEq(teamSize, 4, greaterEq(tally.anemo, 2, percent(-0.05))),
  { path: 'cdRed_' }
)
const impetuousWinds: IResonance = {
  name: tr('ImpetuousWinds.name'),
  desc: tr('ImpetuousWinds.desc'),
  icon: (
    <span>
      <AnemoIcon {...iconInlineProps} /> <AnemoIcon {...iconInlineProps} />
    </span>
  ),
  canShow: (data: UIData) =>
    data.get(tally.anemo).value >= 2 && data.get(teamSize).value >= 4,
  sections: [
    {
      teamBuff: true,
      fields: [
        {
          node: iwNodeStamDisp,
        },
        {
          node: iwNodeMoveDisp,
        },
        {
          node: iwNodeCDDisp,
        },
      ],
    },
  ],
}

// Enduring Rock
const condERShieldPath = ['resonance', 'EnduringRock']
const condERShield = condReadNode(condERShieldPath)
const condERHitPath = ['resonance', 'EnduringRockHit']
const condERHit = condReadNode(condERHitPath)
const [erNodeshield_disp, erNodeshield_] = activeCharBuff(
  input.charKey,
  greaterEq(teamSize, 4, greaterEq(tally.geo, 2, percent(0.15))),
  { path: 'shield_' }
)
const [erNodeDMG_resonanceDisp, erNodeDMG_resonance] = activeCharBuff(
  input.charKey,
  greaterEq(
    teamSize,
    4,
    greaterEq(tally.geo, 2, equal(condERShield, 'on', percent(0.15)))
  ),
  { path: 'all_dmg_' }
)
const [, erNodeDMG_] = activeCharBuff(target.charKey, erNodeDMG_resonance, {
  path: 'all_dmg_',
})
const [erNodeRes_disp, erNodeRes_] = activeCharBuff(
  input.charKey,
  greaterEq(
    teamSize,
    4,
    greaterEq(tally.geo, 2, equal(condERHit, 'on', percent(-0.2)))
  ),
  { path: 'geo_enemyRes_' }
)
const enduringRock: IResonance = {
  name: tr('EnduringRock.name'),
  desc: tr('EnduringRock.desc'),
  icon: (
    <span>
      <GeoIcon {...iconInlineProps} /> <GeoIcon {...iconInlineProps} />
    </span>
  ),
  canShow: (data: UIData) =>
    data.get(tally.geo).value >= 2 && data.get(teamSize).value >= 4,
  sections: [
    {
      teamBuff: true,
      text: tr('EnduringRock.desc'),
      fields: [
        {
          node: erNodeshield_disp,
        },
      ],
    },
    {
      teamBuff: true,
      path: condERShieldPath,
      value: condERShield,
      header: {
        title: tr('EnduringRock.name'),
        icon: <GeoIcon />,
      },
      name: st('protectedByShield'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(erNodeDMG_resonanceDisp, { isTeamBuff: false }),
            },
          ],
        },
      },
    },
    {
      teamBuff: true,
      path: condERHitPath,
      value: condERHit,
      header: {
        title: tr('EnduringRock.name'),
        icon: <GeoIcon />,
      },
      name: trm('EnduringRock.hitCond'),
      states: {
        on: {
          fields: [
            {
              node: erNodeRes_disp,
            },
            {
              text: stg('duration'),
              value: 15,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}

// Sprawling Greenery
const condSG2elePath = ['resonance', 'SprawlingCanopy2ele']
const condSG2ele = condReadNode(condSG2elePath)
const condSG3elePath = ['resonance', 'SprawlingCanopy3ele']
const condSG3ele = condReadNode(condSG3elePath)
const [sgBase_eleMasDisp, sgBase_eleMas] = activeCharBuff(
  input.charKey,
  greaterEq(teamSize, 4, greaterEq(tally.dendro, 2, 50)),
  { path: 'eleMas' }
)
const [sg2ele_eleMasDisp, sg2ele_eleMas] = activeCharBuff(
  input.charKey,
  greaterEq(
    teamSize,
    4,
    greaterEq(tally.dendro, 2, equal(condSG2ele, 'on', 30))
  ),
  { path: 'eleMas' }
)
const [sg3ele_eleMasDisp, sg3ele_eleMas] = activeCharBuff(
  input.charKey,
  greaterEq(
    teamSize,
    4,
    greaterEq(tally.dendro, 2, equal(condSG3ele, 'on', 20))
  ),
  { path: 'eleMas' }
)
const sprawlingGreenery: IResonance = {
  name: tr('SprawlingGreenery.name'),
  desc: tr('SprawlingGreenery.desc'),
  icon: (
    <span>
      <DendroIcon {...iconInlineProps} /> <DendroIcon {...iconInlineProps} />
    </span>
  ),
  canShow: (data: UIData) =>
    data.get(tally.dendro).value >= 2 && data.get(teamSize).value >= 4,
  sections: [
    {
      teamBuff: true,
      text: tr('SprawlingGreenery.desc'),
      fields: [{ node: sgBase_eleMasDisp }],
    },
    {
      teamBuff: true,
      path: condSG2elePath,
      value: condSG2ele,
      header: {
        title: tr('SprawlingGreenery.name'),
        icon: <DendroIcon />,
      },
      name: trm('SprawlingGreenery.cond2ele'),
      states: {
        on: {
          fields: [
            {
              node: sg2ele_eleMasDisp,
            },
            {
              text: stg('duration'),
              value: 6,
              unit: 's',
            },
          ],
        },
      },
    },
    {
      teamBuff: true,
      path: condSG3elePath,
      value: condSG3ele,
      header: {
        title: tr('SprawlingGreenery.name'),
        icon: <DendroIcon />,
      },
      name: trm('SprawlingGreenery.cond3ele'),
      states: {
        on: {
          fields: [
            {
              node: sg3ele_eleMasDisp,
            },
            {
              text: stg('duration'),
              value: 6,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}

export function getMoonsignSheet(uiData: UIData | undefined): IResonance {
  return {
    name: tr('Moonsign.name'),
    desc: tr('Moonsign.desc'),
    icon: (
      <Box
        component={NextImage ? NextImage : 'img'}
        src={imgAssets.resonance.moonsign}
        width="2em"
        height="auto"
      />
    ),
    canShow: (data) => data.get(tally.moonsign).value >= 1,
    sections: [
      {
        teamBuff: true,
        header: {
          title: tr('Moonsign.nascentGleam.name'),
          icon: (
            <Box
              component={NextImage ? NextImage : 'img'}
              src={imgAssets.resonance.moonsign}
              width="2em"
              height="auto"
            />
          ),
        },
        fields: [
          {
            text: tr('Moonsign.nascentGleam.desc'),
          },
        ],
      },
      {
        teamBuff: true,
        canShow: greaterEq(tally.moonsign, 2, 1),
        header: {
          title: tr('Moonsign.ascendantGleam.name'),
          description: tr('Moonsign.ascendantGleam.desc'),
          icon: (
            <Box display="flex">
              <Box
                component={NextImage ? NextImage : 'img'}
                src={imgAssets.resonance.moonsign}
                width="2em"
                height="auto"
              />
              <Box
                component={NextImage ? NextImage : 'img'}
                src={imgAssets.resonance.moonsign}
                width="2em"
                height="auto"
              />
            </Box>
          ),
        },
        // We handle the moonsign conditionals per-character in TeamComponents.tsx,
        // using MoonsignConditionalSection below, this just shows the buff
        // Grabbed using UIData funkiness
        fields: uiData
          ? allLunarReactionKeys.map((lr) => ({
              node: infoMut(
                percent(uiData.getDisplay()['moonsign']![`${lr}_dmg_`].value),
                {
                  path: `${lr}_dmg_`,
                  isTeamBuff: true,
                }
              ),
            }))
          : [],
      },
    ],
  }
}

export const hexereiSheet: IResonance = {
  name: tr('Hexerei.name'),
  desc: tr('Hexerei.desc'),
  icon: (
    <>
      <Box
        component={NextImage ? NextImage : 'img'}
        src={imgAssets.resonance.hexerei}
        width="2em"
        height="auto"
      />
      <Box
        component={NextImage ? NextImage : 'img'}
        src={imgAssets.resonance.hexerei}
        width="2em"
        height="auto"
      />
    </>
  ),
  canShow: (data) => data.get(tally.hexerei).value >= 2,
  sections: [
    {
      teamBuff: true,
      header: {
        title: tr('Hexerei.name'),
        icon: (
          <>
            <Box
              component={NextImage ? NextImage : 'img'}
              src={imgAssets.resonance.hexerei}
              width="2em"
              height="auto"
            />
            <Box
              component={NextImage ? NextImage : 'img'}
              src={imgAssets.resonance.hexerei}
              width="2em"
              height="auto"
            />
          </>
        ),
      },
      fields: [
        {
          text: tr('Hexerei.desc'),
        },
      ],
    },
  ],
}

// Conditional section to be inserted into each character sheet display
export function MoonsignConditionalSection(
  key: CharacterKey,
  sheet: CharacterSheet
): IDocumentConditionalExclusive {
  const [condMoonsignAfterSkillBurstPath, condMoonsignAfterSkillBurst] = cond(
    key,
    'moonsignAfterSkillBurst'
  )
  return {
    canShow: greaterEq(tally.moonsign, 2, 1),
    path: condMoonsignAfterSkillBurstPath,
    value: condMoonsignAfterSkillBurst,
    header: {
      title: tr('Moonsign.ascendantGleam.name'),
      description: tr('Moonsign.ascendantGleam.desc'),
      icon: (
        <Box display="flex">
          <Box
            component={NextImage ? NextImage : 'img'}
            src={imgAssets.resonance.moonsign}
            width="2em"
            height="auto"
          />
          <Box
            component={NextImage ? NextImage : 'img'}
            src={imgAssets.resonance.moonsign}
            width="2em"
            height="auto"
          />
        </Box>
      ),
    },
    teamBuff: true,
    name: st('afterUse.skillOrBurst'),
    states: {
      on: {
        fields: [
          ...allLunarReactionKeys.flatMap((lr) => [
            {
              node: sheet.data.display!['moonsign']![`${lr}_dmg_`],
            },
            {
              node: sheet.data.display!['moonsign']![`${lr}_dmg_Inactive`],
            },
          ]),
          {
            text: stg('duration'),
            value: 20,
            unit: 's',
          },
        ],
      },
    },
  }
}

export const resonanceSheets: IResonance[] = [
  protectiveCanopy,
  ferventFlames,
  soothingWaters,
  shatteringIce,
  highVoltage,
  impetuousWinds,
  enduringRock,
  sprawlingGreenery,
]

export const resonanceData = inferInfoMut({
  teamBuff: {
    premod: {
      ...objMap(pcNodes, ([_nodeDisp, node]) => node),
      atk_: ffNode,
      hp_: swNode,
      staminaDec_: iwNodeStam,
      moveSPD_: iwNodeMove,
      cdRed_: iwNodeCD,
      shield_: erNodeshield_,
      geo_enemyRes_: erNodeRes_,
      eleMas: infoMut(sum(sgBase_eleMas, sg2ele_eleMas, sg3ele_eleMas), {
        pivot: true,
      }),
      all_dmg_: erNodeDMG_,
      // ...objKeyValMap(allLunarReactionKeys, (lr) => [
      //   `${lr}_dmg_`,
      //   { ...moonsignBuff },
      // ]),
    },
    total: {
      // TODO: this crit rate is on-hit. Might put it in a `hit.critRate_` namespace later.
      critRate_: siNode,
    },
  },
})
