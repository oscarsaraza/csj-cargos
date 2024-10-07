import { redirect } from 'next/navigation'
import { UnauthorizedUserMessage } from '~/app/_components/unauthorized-user'
import { api } from '~/trpc/server'

export default async function ActualizacionPage() {
  const { userId } = await api.users.getLoggedUser()
  if (!userId) redirect('/login')

  const user = await api.users.byId({ userId })
  if (!user) redirect('/login')

  if (user.role !== 'office') return <UnauthorizedUserMessage email={`${user.username}@cendoj.ramajudicial.gov.co`} />

  return <div>Encuesta de actualización de datos</div>
}
