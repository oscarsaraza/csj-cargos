import { api, HydrateClient } from '~/trpc/server'
import Pairing from '~/app/_components/pairing'

export default async function Home() {
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
