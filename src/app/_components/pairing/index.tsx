'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { api } from '~/trpc/react'
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

export default function Pairing() {
  const { data, error } = api.cargos.getPairingDataCsj.useQuery()
  if (!data || error) return null

  const { datosUdae, columnsUdae, datosCsj, columnsCsj } = data
  return <PairingDumb leftData={datosUdae} leftColumns={columnsUdae} rightData={datosCsj} rightColumns={columnsCsj} />
}

function PairingDumb({ leftData, leftColumns, rightData, rightColumns }: PairingPropTypes) {
  const [leftFilters, setLeftFilters] = useState<FilterItem[]>([])
  const [rightFilters, setRightFilters] = useState<FilterItem[]>([])
  const [selectedLeft, setSelectedLeft] = useState<DatosUdaeRow | null>(null)
  const [selectedRight, setSelectedRight] = useState<DatosCsjRow | null>(null)
  const [leftPage, setLeftPage] = useState(1)
  const [rightPage, setRightPage] = useState(1)

  const utils = api.useUtils()
  const { mutate } = api.cargos.savePairUdaeCsj.useMutation({
    onSuccess: () => {
      utils.cargos.getPairingDataCsj.invalidate()
      setSelectedLeft(null)
      setSelectedRight(null)
    },
    onError: (error) => {
      console.log(error)
    },
  })

  const filterData = (data: any[], filters: FilterItem[]) => {
    return data.filter((item) =>
      filters.every((filter) => String(item[filter.column]).toLowerCase().includes(filter.value.toLowerCase())),
    )
  }

  const filteredLeftData = filterData(leftData, leftFilters)
  const filteredRightData = filterData(rightData, rightFilters)

  const paginatedLeftData = filteredLeftData.slice((leftPage - 1) * ITEMS_PER_PAGE, leftPage * ITEMS_PER_PAGE)
  const paginatedRightData = filteredRightData.slice((rightPage - 1) * ITEMS_PER_PAGE, rightPage * ITEMS_PER_PAGE)

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

  const handlePair = () => {
    selectedLeft && selectedRight && mutate({ udaeRowId: selectedLeft.id, csjId: selectedRight.id })
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
    </div>
  )
}
