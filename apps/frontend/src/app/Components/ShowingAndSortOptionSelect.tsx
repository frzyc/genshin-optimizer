import { Typography } from '@mui/material'
import type { TFunction } from 'i18next'
import { Trans } from 'react-i18next'
import SortByButton from './SortByButton'

type ShowingItemProps = {
  numShowing: number
  total: string
  t: TFunction<[string, string], undefined>
  namespace: string
}

type SortByButtonProps = {
  sortKeys: string[]
  value: string
  onChange: (value: string) => void
  ascending: boolean
  onChangeAsc: (value: boolean) => void
}

export default function ShowingAndSortOptionSelect({
  showingTextProps,
  sortByButtonProps = undefined,
}: {
  showingTextProps: ShowingItemProps
  sortByButtonProps?: SortByButtonProps
}) {
  return (
    <>
      <ShowingItem
        numShowing={showingTextProps.numShowing}
        total={showingTextProps.total}
        t={showingTextProps.t}
        namespace={showingTextProps.namespace}
      />
      {sortByButtonProps && (
        <SortByButton
          sortKeys={sortByButtonProps.sortKeys}
          value={sortByButtonProps.value}
          onChange={(value) => sortByButtonProps.onChange(value)}
          ascending={sortByButtonProps.ascending}
          onChangeAsc={sortByButtonProps.onChangeAsc}
        />
      )}
    </>
  )
}

function ShowingItem({
  numShowing,
  total,
  t,
  namespace,
}: {
  numShowing: number
  total: string
  t: TFunction<[string, string], undefined>
  namespace: string
}) {
  return (
    <Typography color="text.secondary">
      <Trans
        t={t}
        ns={namespace}
        i18nKey="showingNum"
        count={numShowing}
        value={total}
      >
        Showing <b>{{ count: numShowing } as TransObject}</b> out of{' '}
        {{ value: total } as TransObject} Items
      </Trans>
    </Typography>
  )
}
