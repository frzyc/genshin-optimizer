import {
  Pagination,
  Typography,
} from '@mui/material'
import React, {
  Suspense,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { TFunction } from 'i18next'
import { Trans } from 'react-i18next'
import SortByButton from '../Components/SortByButton'

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
  sortKeys: string[]
  value: string
  onChange: (value: string) => void
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
          onChange={(sortType) => sortButtonProps.onChange(sortType)}
          ascending={sortButtonProps.ascending}
          onChangeAsc={(ascending) => sortButtonProps.onChangeAsc(ascending)}
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
