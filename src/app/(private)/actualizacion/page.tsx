import { CheckIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { UnauthorizedUserMessage } from '~/app/_components/unauthorized-user'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { cn } from '~/lib/utils'
import { api } from '~/trpc/server'

export default async function ActualizacionPage() {
  const { userId } = await api.users.getLoggedUser()
  if (!userId) redirect('/login')

  const user = await api.users.byId({ userId })
  if (!user) redirect('/login')

  if (user.role !== 'office') return <UnauthorizedUserMessage email={`${user.username}@cendoj.ramajudicial.gov.co`} />

  const { cargosDespacho } = await api.encuestas.listaCargosDespacho()

  return (
    <div className="flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Encuesta de actualización de datos</CardTitle>
          <div className="text-center font-bold text-muted-foreground">Consolidación de cargos - UDAE</div>
        </CardHeader>
        <CardContent>
          {cargosDespacho.map((cargo) => (
            <Link key={cargo.id} href={`/actualizacion/${cargo.id}`} className="flex flex-row gap-2">
              <CheckIcon
                className={cn('h-6 w-6', {
                  'text-slate-200': !cargo.datosEncuesta,
                  'text-green-800': cargo.datosEncuesta,
                })}
              />
              <p className="grow text-sm">{cargo.descripcionCargo}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
