import Pairing from '~/app/_components/pairing'
import { HydrateClient } from '~/trpc/server'

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <Pairing />
        </div>
      </main>
    </HydrateClient>
  )
}
