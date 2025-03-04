import { redirect } from 'next/navigation'
import { PairingCsj } from '~/app/_components/pairing/pairing-csj'
import { PairingDeaj } from '~/app/_components/pairing/pairing-deaj'
import { UnauthorizedUserMessage } from '~/app/_components/unauthorized-user'
import { api, HydrateClient } from '~/trpc/server'

export default async function Home() {
  const { userId } = await api.users.getLoggedUser()
  if (!userId) redirect('/login')

  const user = await api.users.byId({ userId })
  if (!user) redirect('/login')

  if (user.role === 'office') redirect('/actualizacion')

  if (user.role !== 'csj' && user.role !== 'deaj') return <UnauthorizedUserMessage email={`${user.username}`} />

  return (
    <HydrateClient>
      {user.role === 'csj' && <PairingCsj />}
      {user.role === 'deaj' && <PairingDeaj />}
    </HydrateClient>
  )
}
