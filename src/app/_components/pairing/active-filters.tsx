import { X } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { FilterItem } from './types'

export const renderActiveFilters = (filters: FilterItem[], onRemoveFilter: (filter: FilterItem) => void) => (
  <div className="mt-2 flex flex-wrap gap-2">
    {filters.map((filter, index) => (
      <div key={index} className="flex items-center rounded bg-secondary px-2 py-1 text-secondary-foreground">
        <span>
          {filter.column}: {filter.value}
        </span>
        <Button variant="ghost" size="sm" className="ml-2 h-4 w-4 p-0" onClick={() => onRemoveFilter(filter)}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    ))}
  </div>
)
