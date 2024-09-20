'use client'

import { useMemo, useState } from 'react'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { renderActiveFilters } from './active-filters'
import { renderFilterForm } from './filter-form'
import { renderTable } from './table'
import { DatosCsjRow, DatosUdaeRow, FilterItem, ITEMS_PER_PAGE, TableColumn } from './types'

type PairingPropTypes = {
  leftData: DatosUdaeRow[]
  leftColumns: TableColumn[]
  rightData: DatosCsjRow[]
  rightColumns: TableColumn[]
}

export default function Pairing({ leftData, leftColumns, rightData, rightColumns }: PairingPropTypes) {
  const [leftFilters, setLeftFilters] = useState<FilterItem[]>([])
  const [rightFilters, setRightFilters] = useState<FilterItem[]>([])
  const [selectedLeft, setSelectedLeft] = useState<DatosUdaeRow | null>(null)
  const [selectedRight, setSelectedRight] = useState<DatosCsjRow | null>(null)
  const [pairs, setPairs] = useState<{ left: DatosUdaeRow; right: DatosCsjRow }[]>([])
  const [leftPage, setLeftPage] = useState(1)
  const [rightPage, setRightPage] = useState(1)

  if (!leftData) return null

  const filterData = (data: any[], filters: FilterItem[]) => {
    return data.filter((item) =>
      filters.every((filter) => String(item[filter.column]).toLowerCase().includes(filter.value.toLowerCase())),
    )
  }

  const filteredLeftData = useMemo(() => filterData(leftData, leftFilters), [leftFilters])
  const filteredRightData = useMemo(() => filterData(rightData, rightFilters), [rightFilters])

  const paginatedLeftData = filteredLeftData.slice((leftPage - 1) * ITEMS_PER_PAGE, leftPage * ITEMS_PER_PAGE)
  const paginatedRightData = filteredRightData.slice((rightPage - 1) * ITEMS_PER_PAGE, rightPage * ITEMS_PER_PAGE)

  const handlePair = () => {
    if (selectedLeft && selectedRight) {
      setPairs([...pairs, { left: selectedLeft, right: selectedRight }])
      setSelectedLeft(null)
      setSelectedRight(null)
    }
  }

  const addLeftFilter = (filterItem: FilterItem) => {
    setLeftFilters([...leftFilters, filterItem])
  }
  const addRightFilter = (filterItem: FilterItem) => {
    setRightFilters([...rightFilters, filterItem])
  }
  const removeLeftFilter = (filterItem: FilterItem) => {
    setLeftFilters(leftFilters.filter(({ column }) => column !== filterItem.column))
  }
  const removeRightFilter = (filterItem: FilterItem) => {
    setRightFilters(rightFilters.filter(({ column }) => column !== filterItem.column))
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0">
        <div className="w-full lg:w-1/2">
          <h2 className="mb-2 text-xl font-bold">Datos UDAE</h2>
          {renderFilterForm(leftColumns, addLeftFilter)}
          {renderActiveFilters(leftFilters, removeLeftFilter)}
          {renderTable(leftColumns, paginatedLeftData, selectedLeft, setSelectedLeft, leftPage, setLeftPage)}
        </div>
        <div className="w-full lg:w-1/2">
          <h2 className="mb-2 text-xl font-bold">Datos CSJ</h2>
          {renderFilterForm(rightColumns, addRightFilter)}
          {renderActiveFilters(rightFilters, removeRightFilter)}
          {renderTable(rightColumns, paginatedRightData, selectedRight, setSelectedRight, rightPage, setRightPage)}
        </div>
      </div>
      <div className="mb-4 flex justify-center">
        <Button onClick={handlePair} disabled={!selectedLeft || !selectedRight}>
          Emparejar
        </Button>
      </div>
      <div>
        <h2 className="mb-2 text-xl font-bold">Registros emparejados</h2>
        <ScrollArea className="h-48 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>UDAE</TableHead>
                <TableHead>CSJ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pairs.map((pair, index) => (
                <TableRow key={index}>
                  <TableCell>{pair.left.descripcionCargo}</TableCell>
                  <TableCell>{pair.right.cargo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  )
}
