import { redirect } from 'next/navigation'
import { UnauthorizedUserMessage } from '~/app/_components/unauthorized-user'
import { api, HydrateClient } from '~/trpc/server'
import { PairingActos } from './pairing-actos'
import { ToggleMostrarTodos } from './toggle-mostrar-todos'

export default async function EnlaceActosPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const { userId } = await api.users.getLoggedUser()
  if (!userId) redirect('/login')

  const user = await api.users.byId({ userId })
  if (!user) redirect('/login')

  if (user.role !== 'csj' && user.role !== 'deaj') return <UnauthorizedUserMessage email={`${user.username}`} />

  const { actos } = await api.actos.getList()

  const mostrarTodos = Boolean(searchParams?.todos)
  const { datosUdae, columnsUdae } = await api.cargos.getPairingDataActos({ mostrarTodos })

  return (
    <HydrateClient>
      <div className="container mx-auto p-4">
        <div className="mb-4 flex flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0">
          <div className="flex w-full flex-col gap-4">
            <h2 className="text-xl font-bold">Revisión de actos administrativos</h2>
            <ToggleMostrarTodos mostrarTodos={mostrarTodos} />
            <PairingActos actos={actos} data={datosUdae} columns={columnsUdae} />
          </div>
        </div>
      </div>
    </HydrateClient>
  )
}
