'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { FilterItem, TableColumn } from './types'

export const renderFilterForm = (columns: TableColumn[], addFilter: (filterItem: FilterItem) => void) => {
  const [selectedColumn, setSelectedColumn] = useState('')
  const [selectedValue, setSelectedValue] = useState('')

  const onAddFilter = () => {
    if (selectedColumn && selectedValue) {
      addFilter({ column: selectedColumn, value: selectedValue })
      setSelectedColumn('')
      setSelectedValue('')
    }
  }

  return (
    <div className="grid grid-cols-[1fr_1fr_120px] gap-2">
      <Select value={selectedColumn} onValueChange={setSelectedColumn}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por..." />
        </SelectTrigger>
        <SelectContent>
          {columns.map(({ name, prettyName }) => (
            <SelectItem key={name} value={name}>
              {prettyName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="Valor de filtro..."
        value={selectedValue}
        onChange={(e) => setSelectedValue(e.currentTarget.value)}
      />

      <Button onClick={() => onAddFilter()}>Agregar filtro</Button>
    </div>
  )
}
