import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { Document } from '@genshin-optimizer/game-opt/sheet-ui'
import { DocumentDisplay } from '@genshin-optimizer/game-opt/sheet-ui'
import { useCharacterContext } from '@genshin-optimizer/zzz/db-ui'
import {
  Banyue,
  Manato,
  Soldier0Anby,
  StarlightBilly,
  Yidhari,
  Yixuan,
} from '@genshin-optimizer/zzz/formula'
import {
  CharMechanicsGroupedDisplay,
  TagDisplay,
} from '@genshin-optimizer/zzz/formula-ui'
import { Box } from '@mui/material'

export function CharSheetSection() {
  const { key: characterKey } = useCharacterContext()!
  return (
    <Box>
      {characterKey === 'Yixuan' && <MinimalYixuanSheet />}
      {characterKey === 'Soldier0Anby' && <MinimalS0AnbySheet />}
      {characterKey === 'Manato' && <MinimalManatoSheet />}
      {characterKey === 'Yidhari' && <MinimalYidhariSheet />}
      {characterKey === 'Banyue' && <MinimalBanyueSheet />}
      {characterKey === 'StarlightBilly' && <MinimalStarlightBillySheet />}
      {shouldShowDevComponents && (
        <CharMechanicsGroupedDisplay charKey={characterKey} />
      )}
    </Box>
  )
}

const yixuanDocs: Document[] = [
  {
    type: 'text',
    text: "We automatically convert Yixuan's HP to Sheer Force at a ratio of 1:0.1. Everything else in her kit is not factored, such as the DMG Bonus % added in her Core skill",
  },
  {
    type: 'fields',
    fields: [
      {
        title: <TagDisplay tag={Yixuan.buffs.core_hpSheerForce.tag} />,
        fieldRef: Yixuan.buffs.core_hpSheerForce.tag,
      },
    ],
  },
]
function MinimalSheetDocs({ docs }: { docs: Document[] }) {
  return (
    <>
      {docs.map((doc, index) => (
        <DocumentDisplay key={index} document={doc} />
      ))}
    </>
  )
}
function MinimalYixuanSheet() {
  return <MinimalSheetDocs docs={yixuanDocs} />
}

const s0AnbyDocs: Document[] = [
  {
    type: 'text',
    text: "Enabling this checkbox will add additional CRIT DMG to Aftershock attacks, based on Soldier 0 - Anby's CRIT DMG, at a ratio matching her Core Skill level scaling. Everything else in her kit is not factored, such as the DMG Bonus % added in her Core skill for enemies marked with Silver Star.",
  },
  {
    type: 'conditional',
    conditional: {
      metadata: Soldier0Anby.conditionals.markedWithSilverStar,
      label: 'Enemy marked with Silver Star',
      fields: [
        {
          title: (
            <TagDisplay
              tag={Soldier0Anby.buffs.core_markedWithSilverStar_crit_dmg_.tag}
            />
          ),
          fieldRef: Soldier0Anby.buffs.core_markedWithSilverStar_crit_dmg_.tag,
        },
      ],
    },
  },
]
function MinimalS0AnbySheet() {
  return <MinimalSheetDocs docs={s0AnbyDocs} />
}

const manatoDocs: Document[] = [
  {
    type: 'text',
    text: "We automatically convert Manato's HP to Sheer Force at a ratio of 1:0.1. Everything else in his kit is not factored",
  },
  {
    type: 'fields',
    fields: [
      {
        title: <TagDisplay tag={Manato.buffs.core_hpSheerForce.tag} />,
        fieldRef: Manato.buffs.core_hpSheerForce.tag,
      },
    ],
  },
]
function MinimalManatoSheet() {
  return <MinimalSheetDocs docs={manatoDocs} />
}

const yidhariDocs: Document[] = [
  {
    type: 'text',
    text: "We automatically convert Yidhari's HP to Sheer Force at a ratio of 1:0.1. Everything else in her kit is not factored",
  },
  {
    type: 'fields',
    fields: [
      {
        title: <TagDisplay tag={Yidhari.buffs.core_hpSheerForce.tag} />,
        fieldRef: Yidhari.buffs.core_hpSheerForce.tag,
      },
    ],
  },
]
function MinimalYidhariSheet() {
  return <MinimalSheetDocs docs={yidhariDocs} />
}

const banyueDocs: Document[] = [
  {
    type: 'text',
    text: "We automatically convert Banyue's HP to Sheer Force at a ratio of 1:0.1. Everything else in his kit is not factored",
  },
  {
    type: 'fields',
    fields: [
      {
        title: <TagDisplay tag={Banyue.buffs.core_hpSheerForce.tag} />,
        fieldRef: Banyue.buffs.core_hpSheerForce.tag,
      },
    ],
  },
]
function MinimalBanyueSheet() {
  return <MinimalSheetDocs docs={banyueDocs} />
}

const starlightBillyDocs: Document[] = [
  {
    type: 'text',
    text: "We automatically convert Starlight - Billy's HP to Sheer Force at a ratio of 1:0.1. Everything else in his kit is not factored",
  },
  {
    type: 'fields',
    fields: [
      {
        title: <TagDisplay tag={StarlightBilly.buffs.core_hpSheerForce.tag} />,
        fieldRef: StarlightBilly.buffs.core_hpSheerForce.tag,
      },
    ],
  },
]
function MinimalStarlightBillySheet() {
  return <MinimalSheetDocs docs={starlightBillyDocs} />
}
