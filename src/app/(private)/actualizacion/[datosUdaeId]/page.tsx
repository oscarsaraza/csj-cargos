import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { api } from '~/trpc/server'
import { EncuestaServidorForm } from './encuesta-servidor-form'

export default async function EncuestaActualizacionDatosPage({ params }: { params: { datosUdaeId: string } }) {
  const data = await api.encuestas.byId({ id: params.datosUdaeId })

  if (!data) return <div>Ha ocurrido un error al consultar la información del cargo.</div>

  return (
    <div className="flex w-full flex-row flex-wrap justify-center gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Encuesta de actualizacion de datos</CardTitle>
          <div className="text-center font-bold text-muted-foreground">Consolidación de cargos - UDAE</div>
        </CardHeader>
        <CardContent>
          <p className="text-center">
            Esta encuesta de actualización de datos de servidores judiciales es realizada por el{' '}
            <span className="font-bold">Consejo Seccional de la Judicatura de Boyacá y Casanare</span> y la{' '}
            <span className="font-bold">Dirección Ejecutiva Seccional de Administración Judicial de Tunja</span> en
            desarrollo del proyecto de validación de cargos en cabeza de la{' '}
            <span className="font-bold">Unidad de Desarrollo y Análisis Estádistico</span>.
          </p>
        </CardContent>
      </Card>

      <EncuestaServidorForm datosUdaeId={params.datosUdaeId} data={data.data} defaults={data.defaults} />
    </div>
  )
}
