import {
  Pagination,
  Typography,
} from '@mui/material'
import { Trans } from 'react-i18next'
import SortByButton from '../Components/SortByButton'

export default function PaginatedDisplay({
  numPages,
  currentPageIndex,
  setPage,
  itemIdsToShow,
  totalShowing,
  t,
  displaySort = false,
  sortKeys = null,
  sortType = null,
  ascending = false,
  onChange = null,
  onChangeAsc = null
}) {
  return (
    <>
      <Pagination
        count={numPages}
        page={currentPageIndex + 1}
        onChange={setPage}
      />
      <ShowingItem
        numShowing={itemIdsToShow.length}
        total={totalShowing}
        t={t}
      />
      {displaySort && (
        <SortByButton
          sortKeys={[sortKeys]}
          value={sortType}
          onChange={onChange}
          ascending={ascending}
          onChangeAsc={onChangeAsc}
        />
      )}
    </>
  )
}

function ShowingItem({ numShowing, total, t }) {
  return (
    <Typography color="text.secondary">
      <Trans t={t} i18nKey="showingNum" count={numShowing} value={total}>
        Showing <b>{{ count: numShowing } as TransObject}</b> out of{' '}
        {{ value: total } as TransObject} Items
      </Trans>
    </Typography>
  )
}
