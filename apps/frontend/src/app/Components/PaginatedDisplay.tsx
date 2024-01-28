import {
  Pagination,
  Typography,
} from '@mui/material'
import type { TFunction } from 'i18next'
import { Trans } from 'react-i18next'
import SortByButton from '../Components/SortByButton'
import type { ArtifactSortKey, artifactSortKeys } from '../PageArtifact/ArtifactSort'
import type { WeaponSortKey, weaponSortKeys } from '../Util/WeaponSort'
import type { CharacterSortKey, characterSortKeys } from '../Util/CharacterSort'

type PaginationProps = {
  count: number
  page: number
  onChange: (_: any, value: number) => void
}

type ShowingItemProps = {
  numShowing: number
  total: string
  t: TFunction<[string, string], undefined>
}

type SortByButtonProps = {
  sortKeys: (typeof artifactSortKeys)[] | (typeof weaponSortKeys)[] | (typeof characterSortKeys)[]
  value: ArtifactSortKey | WeaponSortKey | CharacterSortKey
  onChange: (_: any, value: string) => void
  ascending: boolean
  onChangeAsc: (value: boolean) => void
}

export default function PaginatedDisplay({
  paginationProps,
  showingTextProps,
  displaySort = false,
  sortButtonProps = undefined,
} : {
  paginationProps: PaginationProps
  showingTextProps: ShowingItemProps
  displaySort?: boolean
  sortButtonProps?: SortByButtonProps
}) {
  return (
    <>
      <Pagination
        count={paginationProps.count}
        page={paginationProps.page}
        onChange={paginationProps.onChange}
      />
      <ShowingItem
        numShowing={showingTextProps.numShowing}
        total={showingTextProps.total}
        t={showingTextProps.t}
      />
      {displaySort && (
        <SortByButton
          sortKeys={sortButtonProps.sortKeys}
          value={sortButtonProps.value}
          onChange={sortButtonProps.onChange}
          ascending={sortButtonProps.ascending}
          onChangeAsc={sortButtonProps.onChangeAsc}
        />
      )}
    </>
  )
}

function ShowingItem({
  numShowing,
  total,
  t
} : {
  numShowing: number
  total: string
  t: TFunction<[string, string], undefined>
}) {
  return (
    <Typography color="text.secondary">
      <Trans t={t} i18nKey="showingNum" count={numShowing} value={total}>
        Showing <b>{{ count: numShowing } as TransObject}</b> out of{' '}
        {{ value: total } as TransObject} Items
      </Trans>
    </Typography>
  )
}
