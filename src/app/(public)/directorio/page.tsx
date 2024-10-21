import { api } from '~/trpc/server'
import ListaDespachos from './lista-despachos'

export default async function DirectorioPage() {
  const despachos = await api.despachos.list()

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Directorio de despachos</h1>
      <ListaDespachos despachos={despachos} />
    </div>
  )
}
