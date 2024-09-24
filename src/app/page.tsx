import { api, HydrateClient } from '~/trpc/server'
import Pairing from './_components/pairing'
import { lucia, validateSession } from '~/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Home() {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? ''
  const result = await validateSession(sessionId)

  if (!result.session) redirect('/login')

  const { datosUdae, columnsUdae, datosCsj, columnsCsj } = await api.cargos.getPairingData()

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <Pairing leftData={datosUdae} leftColumns={columnsUdae} rightData={datosCsj} rightColumns={columnsCsj} />
        </div>
      </main>
    </HydrateClient>
  )
}
