import { Button } from '~/components/ui/button'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { ITEMS_PER_PAGE, type TableColumn } from './types'

export const renderTable = (
  columns: TableColumn[],
  data: any[],
  selected: any,
  setSelected: (item: any) => void,
  page: number,
  setPage: (page: number) => void,
) => {
  const filteredColumns = columns.filter(({ name }) => name !== 'id')

  return (
    <div>
      <ScrollArea className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {filteredColumns.map(({ name, prettyName }) => (
                <TableHead className="text-nowrap" key={name}>
                  {prettyName}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={item.id}
                className={selected === item ? 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-800' : ''}
                onClick={() => setSelected(item)}
              >
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
