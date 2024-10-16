import { redirect } from 'next/navigation'
import { UnauthorizedUserMessage } from '~/app/_components/unauthorized-user'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import { cn } from '~/lib/utils'
import { api } from '~/trpc/server'
import { DescargaXlsxButton } from './descarga-xlsx-button'

const bgBymodelName: Record<string, string> = {
  DatosUdae: 'bg-sky-50',
  DatosCsj: 'bg-lime-50',
  DatosDeaj: 'bg-amber-50',
  ActoAdministrativo: 'bg-pink-50',
  DatosActo: 'bg-pink-50',
  DatosEncuesta: 'bg-lime-50',
}

export default async function Consolidado() {
  const { userId } = await api.users.getLoggedUser()
  if (!userId) redirect('/login')

  const user = await api.users.byId({ userId })
  if (!user) redirect('/login')

  if (user.role !== 'csj' && user.role !== 'deaj')
    return <UnauthorizedUserMessage email={`${user.username}@cendoj.ramajudicial.gov.co`} />

  const datosAvance = await api.cargos.getDatosAvance()

  return (
    <div className="w-full max-w-full space-y-4">
      <h1 className="text-2xl font-bold">Consolidado</h1>
      <DescargaXlsxButton />

      <h1 className="text-2xl font-bold">Avance</h1>
      <div className="flex flex-row flex-wrap gap-4">
        <ProgressCard
          title="Emparejamiento CSJ"
          description={`${datosAvance.avanceCsj}/${datosAvance.totalUdae}`}
          progress={datosAvance.porcCsj}
        />
        <ProgressCard
          title="Emparejamiento DEAJ"
          description={`${datosAvance.avanceDeaj}/${datosAvance.totalDeaj}`}
          progress={datosAvance.porcDeaj}
        />
        <ProgressCard
          title="Revisión de actos administrativos"
          description={`${datosAvance.totalActos}/${datosAvance.totalUdae}`}
          progress={datosAvance.porcActos}
        />
        <ProgressCard
          title="Recolección de información personal"
          description={`${datosAvance.totalInfoTrabajadores}/${datosAvance.totalUdae}`}
          progress={datosAvance.porcInfoTrabajadores}
        />
      </div>
    </div>
  )
}

interface ItemProgressCardProps {
  title: string
  description: string
  progress: number
}

function ProgressCard({ title, description, progress }: ItemProgressCardProps) {
  return (
    <Card className="w-[360px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">{description}</p>
          <p className="text-xl font-bold">{progress.toFixed(2)}%</p>
        </div>
      </CardContent>
    </Card>
  )
}
