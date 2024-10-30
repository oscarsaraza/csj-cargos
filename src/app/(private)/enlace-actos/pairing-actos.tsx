'use client'

import { ActoAdministrativo } from '@prisma/client'
import { useEffect, useState } from 'react'
import { Button } from '~/components/ui/button'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { RouterOutputs } from '~/trpc/react'
import { renderActiveFilters } from '../../_components/pairing/active-filters'
import { FilterForm } from '../../_components/pairing/filter-form'
import { type FilterItem, ITEMS_PER_PAGE, type TableColumn } from '../../_components/pairing/types'
import { EnlaceActoForm } from './enlace-acto-form'

type PairingPropTypes = {
  data: RouterOutputs['cargos']['getPairingDataActos']['datosUdae']
  columns: RouterOutputs['cargos']['getPairingDataActos']['columnsUdae']
  actos: ActoAdministrativo[]
}

export function PairingActos({ data, columns, actos }: PairingPropTypes) {
  const [filters, setFilters] = useState<FilterItem[]>([])
  const [page, setPage] = useState(1)

  const filterData = (data: any[], filters: FilterItem[]) => {
    return data.filter((item) =>
      filters.every((filter) => String(item[filter.column]).toLowerCase().includes(filter.value.toLowerCase())),
    )
  }

  useEffect(() => {
    setPage(1)
  }, [filters])

  const filteredData = filterData(data, filters)

  const paginatedData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const addFilter = (filterItem: FilterItem) => {
    setFilters([...filters, filterItem])
  }

  const removeFilter = (filterItem: FilterItem) => {
    setFilters(filters.filter(({ column }) => column !== filterItem.column))
  }

  return (
    <>
      <FilterForm columns={columns} addFilter={addFilter} />
      {renderActiveFilters(filters, removeFilter)}
      {renderTable(columns, paginatedData, page, setPage, actos)}
    </>
  )
}

export const renderTable = (
  columns: TableColumn[],
  data: any[],
  page: number,
  setPage: (page: number) => void,
  actos: ActoAdministrativo[],
) => {
  const filteredColumns = columns.filter(({ name }) => name !== 'id')

  return (
    <div>
      <ScrollArea className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datos de acto administrativo</TableHead>
              {filteredColumns.map(({ name, prettyName }) => (
                <TableHead className="text-nowrap" key={name}>
                  {prettyName}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="w-48">
                  <EnlaceActoForm
                    datosUdaeId={item.id}
                    actosAdministrativosList={actos}
                    registrado={!!item.datosActoAdministrativo}
                  />
                </TableCell>
                {filteredColumns.map(({ name }) => (
                  <TableCell className="text-nowrap" key={name}>
                    {item[name] ? String(item[name]) : '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="mt-2 flex items-center justify-between">
        <Button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
          {'<'}
        </Button>
        <span>Página {page}</span>
        <Button onClick={() => setPage(page + 1)} disabled={data.length < ITEMS_PER_PAGE}>
          {'>'}
        </Button>
      </div>
    </div>
  )
}
