import { Typography } from '@mui/material'
import type { TFunction } from 'i18next'
import { Trans } from 'react-i18next'
import { SortByButton } from './SortByButton'

type ShowingItemProps = {
  numShowing: number
  total: string
  t: TFunction<[string, string], undefined>
  namespace: string
}

type SortByButtonProps<T extends string> = {
  sortKeys: T[]
  value: T
  onChange: (value: T) => void
  ascending: boolean
  onChangeAsc: (value: boolean) => void
}

export function ShowingAndSortOptionSelect<T extends string>({
  showingTextProps,
  sortByButtonProps = undefined,
}: {
  showingTextProps: ShowingItemProps
  sortByButtonProps?: SortByButtonProps<T>
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
        Showing <b>{{ count: numShowing } as any}</b> out of{' '}
        {{ value: total } as any} Items
      </Trans>
    </Typography>
  )
}
