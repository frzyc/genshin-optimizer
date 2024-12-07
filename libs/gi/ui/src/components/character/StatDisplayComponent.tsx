import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardHeaderCustom,
  CardThemed,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import type { CalcResult } from '@genshin-optimizer/gi/uidata'
import type { DisplaySub } from '@genshin-optimizer/gi/wr'
import type { MasonryProps } from '@mui/lab'
import { Masonry } from '@mui/lab'
import { Box, Button, Divider, ListItem } from '@mui/material'
import type { FC } from 'react'
import { useContext, useMemo } from 'react'
import { DataContext, OptTargetContext } from '../../context'
import { getDisplayHeader, getDisplaySections } from '../../util'
import { FieldDisplayList, NodeFieldDisplay } from '../FieldDisplay'

type EditorModalProps = {
  open: boolean
  onClose: () => void
}
export function StatDisplayComponent({
  columns = { xs: 1, sm: 2, md: 3, xl: 4 },
  BonusStatEditor,
  CustomMTargetEditor,
}: {
  columns?: MasonryProps['columns']
  BonusStatEditor?: FC<EditorModalProps>
  CustomMTargetEditor?: FC<EditorModalProps>
}) {
  const { data, compareData } = useContext(DataContext)
  const dataDisplaySections = useMemo(() => getDisplaySections(data), [data])
  const compareDataDisplaySections = useMemo(
    () => compareData && getDisplaySections(compareData),
    [compareData]
  )
  const sections = useMemo(
    () =>
      dataDisplaySections.filter(
        ([key, ns]) =>
          (BonusStatEditor && key === 'bounsStats') ||
          (CustomMTargetEditor && key === 'custom') ||
          Object.values(ns).some((n) => !n.isEmpty)
      ),
    [dataDisplaySections, BonusStatEditor, CustomMTargetEditor]
  )
  const compareSections = useMemo(
    () =>
      compareDataDisplaySections &&
      compareDataDisplaySections.filter(([, ns]) =>
        Object.values(ns).some((n) => !n.isEmpty)
      ),
    [compareDataDisplaySections]
  )
  const sectionKeys = useMemo(() => {
    const sectionKeys = sections.map(([key]) => key)
    if (compareSections && compareSections.length >= sectionKeys.length)
      for (const [key] of compareSections)
        if (!sectionKeys.includes(key)) sectionKeys.push(key)
    return sectionKeys
  }, [sections, compareSections])
  return (
    <Box sx={{ mr: -1, mb: -1 }}>
      <Masonry columns={columns} spacing={1}>
        {sectionKeys.map((key) => (
          <Section
            key={key}
            displayNs={sections.find(([k]) => k === key)?.[1]}
            compareDisplayNs={compareSections?.find(([k]) => k === key)?.[1]}
            sectionKey={key}
            Editor={
              key === 'bounsStats'
                ? BonusStatEditor
                : key === 'custom'
                ? CustomMTargetEditor
                : undefined
            }
          />
        ))}
      </Masonry>
    </Box>
  )
}

function Section({
  displayNs,
  compareDisplayNs,
  sectionKey,
  Editor,
}: {
  displayNs?: DisplaySub<CalcResult>
  compareDisplayNs?: DisplaySub<CalcResult>
  sectionKey: string
  Editor?: FC<EditorModalProps>
}) {
  const [show, onShow, onHide] = useBoolState() // for editor modals
  const { target: optimizationTarget } = useContext(OptTargetContext)
  const { data, compareData } = useContext(DataContext)
  const database = useDatabase()
  const header = useMemo(
    () =>
      getDisplayHeader(data, sectionKey, database) ??
      (compareData && getDisplayHeader(compareData, sectionKey, database)),
    [database, data, compareData, sectionKey]
  )
  const keys = useMemo(() => {
    const keySet = new Set<string>()
    if (displayNs) Object.keys(displayNs).map((k) => keySet.add(k))
    if (compareDisplayNs)
      Object.keys(compareDisplayNs).map((k) => keySet.add(k))
    return Array.from(keySet)
  }, [compareDisplayNs, displayNs])

  if (!header) return null
  if (!keys.length) return null
  // Don't show character section unless there is a comparasion, a bandaid fix for the FIXME below.
  if (sectionKey === 'character' && !compareData) return null

  const { title, icon, action } = header
  const fields = keys.map((key) => (
    <NodeFieldDisplay
      key={key}
      calcRes={displayNs?.[key]}
      compareCalcRes={compareDisplayNs?.[key]}
      component={ListItem}
      emphasize={
        JSON.stringify(optimizationTarget) === JSON.stringify([sectionKey, key])
      }
      showZero={
        (sectionKey === 'basic' && key === 'eleMas') ||
        (sectionKey === 'basic' && key.endsWith('dmg_')) ||
        (sectionKey === 'basic' && key === 'heal_')
      }
    />
  ))
  // do not render empty sections
  // FIXME: there doesn't seem to be a "safe" way to determine if a section is empty without introducing issues in rendering
  // if (fields.every((t) => t.type(t.props) === null)) return null
  return (
    <CardThemed>
      {Editor && <Editor open={show} onClose={onHide} />}
      <CardHeaderCustom
        avatar={icon}
        title={title}
        action={
          Editor ? (
            <Button size="small" color="info" onClick={onShow}>
              EDIT
            </Button>
          ) : (
            action && <SqBadge>{action}</SqBadge>
          )
        }
      />
      <Divider />
      <FieldDisplayList sx={{ m: 0 }}>{fields}</FieldDisplayList>
    </CardThemed>
  )
}
