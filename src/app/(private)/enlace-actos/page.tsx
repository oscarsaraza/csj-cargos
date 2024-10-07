import { redirect } from 'next/navigation'
import { UnauthorizedUserMessage } from '~/app/_components/unauthorized-user'
import { api, HydrateClient } from '~/trpc/server'
import { PairingActos } from './pairing-actos'

export default async function EnlaceActosPage() {
  const { userId } = await api.users.getLoggedUser()
  if (!userId) redirect('/login')

  const user = await api.users.byId({ userId })
  if (!user) redirect('/login')

  if (user.role !== 'csj' && user.role !== 'deaj')
    return <UnauthorizedUserMessage email={`${user.username}@cendoj.ramajudicial.gov.co`} />

  const { actos } = await api.actos.getList()

  return (
    <HydrateClient>
      <PairingActos actos={actos} />
    </HydrateClient>
  )
}
