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

  if (user.role === 'external') return <UnauthorizedUserMessage email={`${user.username}@cendoj.ramajudicial.gov.co`} />

  return (
    <HydrateClient>
      <main className="flex flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          {user.role === 'csj' && <PairingCsj />}
          {user.role === 'deaj' && <PairingDeaj />}
        </div>
      </main>
    </HydrateClient>
  )
}
