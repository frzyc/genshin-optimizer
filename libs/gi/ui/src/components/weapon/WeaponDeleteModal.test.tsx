// @vitest-environment jsdom
import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { ArtCharDatabase, initialWeapon } from '@genshin-optimizer/gi/db'
import type { DatabaseContextObj } from '@genshin-optimizer/gi/db-ui'
import { DatabaseContext } from '@genshin-optimizer/gi/db-ui'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WeaponDeleteModal } from './WeaponDeleteModal'

describe('WeaponDeleteModal', () => {
  let database: ArtCharDatabase
  let weaponId: string

  beforeEach(() => {
    database = new ArtCharDatabase(1, createTestDBStorage('go'))
    weaponId = database.weapons.new(initialWeapon('FavoniusSword'))
    const otherWeaponId = database.weapons.new(initialWeapon('FavoniusSword'))
    database.builds.new({
      characterKey: 'Bennett',
      name: 'Support Build',
      weaponId,
    })
    database.builds.new({
      characterKey: 'Xingqiu',
      name: 'Burst Build',
      weaponId,
    })
    database.builds.new({
      characterKey: 'Bennett',
      name: 'Other Weapon Build',
      weaponId: otherWeaponId,
    })
  })
  afterEach(cleanup)

  function renderModal(onDelete = () => {}) {
    const context: DatabaseContextObj = {
      databases: [database],
      setDatabase: () => {},
      database,
    }
    render(
      <DatabaseContext.Provider value={context}>
        <Suspense fallback={false}>
          <WeaponDeleteModal
            weaponId={weaponId}
            show
            onHide={() => {}}
            onDelete={onDelete}
          />
        </Suspense>
      </DatabaseContext.Provider>
    )
  }

  it('lists the builds that use the weapon', async () => {
    renderModal()
    expect(
      await screen.findByText(': Support Build', { exact: false })
    ).toBeTruthy()
    expect(screen.getByText(': Burst Build', { exact: false })).toBeTruthy()
    expect(
      screen.queryByText(': Other Weapon Build', { exact: false })
    ).toBeNull()
  })

  it('calls onDelete when the delete button is clicked', async () => {
    const onDelete = vi.fn()
    renderModal(onDelete)
    fireEvent.click(await screen.findByText('weaponDelModal.delBtn'))
    expect(onDelete).toHaveBeenCalledOnce()
  })
})
