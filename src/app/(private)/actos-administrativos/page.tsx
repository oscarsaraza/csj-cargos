import { FileTextIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { UnauthorizedUserMessage } from '~/app/_components/unauthorized-user'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { api } from '~/trpc/server'
import { ActoForm } from './acto-form'

export default async function Consolidado() {
  const { actos, columns } = await api.actos.getList()

  const filteredColumns = columns.filter((column) => column.name !== 'id' && column.name !== 'enlacesUdae')

  const { userId } = await api.users.getLoggedUser()
  if (!userId) redirect('/login')

  const user = await api.users.byId({ userId })
  if (!user) redirect('/login')

  if (user.role !== 'csj' && user.role !== 'deaj') return <UnauthorizedUserMessage email={`${user.username}`} />

  return (
    <div className="w-full max-w-lg space-y-4">
      <h1>Actos administrativos</h1>

      <ActoForm />

      <ScrollArea className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {filteredColumns.map(({ name, prettyName }) => (
                <TableHead className="text-nowrap" key={name}>
                  {prettyName}
                </TableHead>
              ))}
              <TableHead className="text-nowrap">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actos.map((acto) => (
              <TableRow key={acto.id}>
                {filteredColumns.map(({ name }) => (
                  <TableCell className="text-nowrap" key={name}>
                    {(name === 'id' || name === 'tipo' || name === 'anio' || name === 'numero') && acto[name]
                      ? String(acto[name])
                      : ''}
                    {name === 'enlace' && acto[name] ? (
                      <Link href={String(acto[name])} target="_blank" rel="noopener noreferrer">
                        <FileTextIcon className="h-4 w-4" />
                      </Link>
                    ) : (
                      ''
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-nowrap">
                  <ActoForm actoId={acto.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
