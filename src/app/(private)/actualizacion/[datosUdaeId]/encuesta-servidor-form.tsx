'use client'

import { revalidatePath } from 'next/cache'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import { profesiones } from '~/lib/utils'
import { api, RouterOutputs } from '~/trpc/react'

type EncuestaServidorFormProps = {
  datosUdaeId: string
  data: RouterOutputs['encuestas']['byId']['data']
  defaults: RouterOutputs['encuestas']['byId']['defaults']
}

const opcionesCargoExiste = ['Si', 'No', 'Si con novedad'] as const
type OpcionesCargoExiste = (typeof opcionesCargoExiste)[number]

export function EncuestaServidorForm({ datosUdaeId, data, defaults }: EncuestaServidorFormProps) {
  const [cargoExiste, setCargoExiste] = useState<OpcionesCargoExiste>(
    (data?.datosEncuesta?.cargoExiste as OpcionesCargoExiste) || 'Si',
  )
  const [tipoNovedad, setTipoNovedad] = useState(data?.datosEncuesta?.tipoNovedad || '')
  const [tieneServidorProv, setTieneServidorProv] = useState(defaults.tieneServidorEnProvisionalidad)
  const [tieneServidorProp, setTieneServidorProp] = useState(defaults.tieneServidorEnPropiedad)
  const router = useRouter()

  const { data: despachos } = api.despachos.list.useQuery()
  const { data: actos } = api.actos.getList.useQuery()
  const save = api.encuestas.save.useMutation({
    onSuccess: () => {
      router.push('/actualizacion')
      revalidatePath('/actualizacion')
    },
  })

  if (!data) return null

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    const servidorPropiedad = tieneServidorProp
      ? {
          tipoDocumento: data.get('tipoDocumento')?.toString() || '',
          documento: data.get('documento')?.toString() || '',
          nombres: data.get('nombres')?.toString() || '',
          apellidos: data.get('apellidos')?.toString() || '',
          nivelEscolaridad: data.get('nivelEscolaridad')?.toString() || '',
          familiaresDependientes: data.get('familiaresDependientes')?.toString() || '0',
          profesion1: data.get('profesion1')?.toString() || '',
          profesion2: data.get('profesion2')?.toString() || '',
          profesion3: data.get('profesion3')?.toString() || '',
        }
      : null

    const servidorProvisionalidad = tieneServidorProv
      ? {
          tipoDocumentoProv: data.get('tipoDocumentoProv')?.toString() || '',
          documentoProv: data.get('documentoProv')?.toString() || '',
          nombresProv: data.get('nombresProv')?.toString() || '',
          apellidosProv: data.get('apellidosProv')?.toString() || '',
          nivelEscolaridadProv: data.get('nivelEscolaridadProv')?.toString() || '',
          familiaresDependientesProv: data.get('familiaresDependientesProv')?.toString() || '0',
          profesion1Prov: data.get('profesion1Prov')?.toString() || '',
          profesion2Prov: data.get('profesion2Prov')?.toString() || '',
          profesion3Prov: data.get('profesion3Prov')?.toString() || '',
        }
      : null

    const tipoTraslado = data.get('tipoTraslado')?.toString() || ''
    const despachoTrasladoDestinoId = data.get('despachoTrasladoDestinoId')?.toString() || undefined
    const actoTrasladoId = data.get('actoTrasladoId')?.toString() || undefined
    const observacionesNovedad = data.get('observacionesNovedad')?.toString() || ''
    const observacionesDespacho = data.get('observacionesDespacho')?.toString() || ''
    const observacionesClasificacion = data.get('observacionesClasificacion')?.toString() || ''

    save.mutate({
      datosUdaeId,
      cargoExiste,
      tipoNovedad,
      tipoTraslado,
      despachoTrasladoDestinoId,
      actoTrasladoId,
      observacionesNovedad,
      observacionesDespacho,
      observacionesClasificacion,
      tieneServidorProp,
      servidorPropiedad,
      tieneServidorProv,
      servidorProvisionalidad,
    })
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            {data.descripcionCargo} {data.gradoCargo}
          </CardTitle>
          <div className="text-center font-bold text-muted-foreground">{data.nombreDespacho}</div>
          {data.numeroActoAdministrativo && data.anioActoAdministrativo && data.tipoActoAdministrativo && (
            <div className="text-center font-bold text-muted-foreground">
              {data.tipoActoAdministrativo} {data.numeroActoAdministrativo}-{data.anioActoAdministrativo}
            </div>
          )}
        </CardHeader>
        <CardContent className="flex flex-row flex-wrap items-start justify-around gap-8">
          <div className="grid w-full gap-4 py-4 lg:w-5/12">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cargoExiste">El cargo existe en el despacho?</Label>
              <Select
                name="cargoExiste"
                value={cargoExiste}
                onValueChange={(value) => setCargoExiste(value as OpcionesCargoExiste)}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {opcionesCargoExiste.map((cargoExiste) => (
                    <SelectItem key={cargoExiste} value={cargoExiste}>
                      {cargoExiste}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {cargoExiste === 'Si con novedad' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tipoNovedad">Tipo de novedad</Label>
                  <Select name="tipoNovedad" value={tipoNovedad} onValueChange={setTipoNovedad} required>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Traslado">Traslado</SelectItem>
                      <SelectItem value="Supresión">Supresión</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {tipoNovedad === 'Traslado' && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="tipoTraslado">Tipo de traslado</Label>
                      <Select name="tipoTraslado" required>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Transitorio">Transitorio</SelectItem>
                          <SelectItem value="Permanente">Permanente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="despachoTrasladoDestinoId">Despacho de destino</Label>
                      <Select name="despachoTrasladoDestinoId" required>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {despachos?.map((despacho) => (
                            <SelectItem key={despacho.id} value={despacho.id}>
                              {despacho.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="actoTrasladoId">Acto administrativo</Label>
                  <Select name="actoTrasladoId" required>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actos?.actos.map((acto) => (
                        <SelectItem value={acto.id} key={acto.id}>
                          {acto.anio}: {acto.tipo} {acto.numero}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="observacionesNovedad">Observaciones de la novedad</Label>
                  <Textarea
                    name="observacionesNovedad"
                    className="col-span-3"
                    placeholder="Observaciones de la novedad (traslado o supresión)."
                  ></Textarea>
                </div>
              </>
            )}
          </div>

          <div className="grid w-full gap-4 py-4 lg:w-5/12">
            {(cargoExiste === 'Si' || cargoExiste === 'No') && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observacionesDespacho">Observaciones del cargo</Label>
                <Textarea
                  name="observacionesDespacho"
                  className="col-span-3"
                  placeholder="Describa las novedades que considere pertinente apuntar en relación con el nombre del despacho, cargo y grado."
                  rows={4}
                ></Textarea>
              </div>
            )}

            {cargoExiste === 'Si' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observacionesClasificacion">Observaciones de clasificación</Label>
                <Textarea
                  name="observacionesClasificacion"
                  className="col-span-3"
                  placeholder="Escriba las anotaciones que considere pertinentes respecto de la clasificacion, provisión del cargo y profesiones de los servidores."
                  rows={4}
                ></Textarea>
              </div>
            )}
          </div>

          {(cargoExiste === 'Si' || cargoExiste === 'Si con novedad') && (
            <>
              <div className="grid w-full gap-4 py-4 lg:w-5/12">
                <div className="font-bold text-muted-foreground">Datos de servidor en propiedad</div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-span-3 flex items-center gap-4">
                    <Checkbox
                      id="tieneServidorProp"
                      name="tieneServidorProp"
                      checked={tieneServidorProp}
                      onCheckedChange={() => setTieneServidorProp(!tieneServidorProp)}
                    />
                    <Label htmlFor="tieneServidorProp">El cargo tiene un servidor en propiedad</Label>
                  </div>
                </div>

                {tieneServidorProp && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="tipoDocumento" className="text-right">
                        Tipo de Documento
                      </Label>
                      <Select
                        name="tipoDocumento"
                        defaultValue={defaults.nombres ? 'Cédula de ciudadanía' : undefined}
                        required
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cédula de ciudadanía">Cédula de ciudadanía</SelectItem>
                          <SelectItem value="Cédula de extranjería">Cédula de extranjería</SelectItem>
                          <SelectItem value="Número Único de Identificación Personal (NUIP)">
                            Número Único de Identificación Personal (NUIP)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="documento" className="text-right">
                        Documento
                      </Label>
                      <Input
                        id="documento"
                        name="documento"
                        defaultValue={defaults.documento}
                        className="col-span-3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="nombres" className="text-right">
                        Nombres
                      </Label>
                      <Input
                        id="nombres"
                        name="nombres"
                        defaultValue={defaults.nombres}
                        className="col-span-3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="apellidos" className="text-right">
                        Apellidos
                      </Label>
                      <Input
                        id="apellidos"
                        name="apellidos"
                        defaultValue={defaults.apellidos}
                        className="col-span-3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="nivelEscolaridad" className="text-right">
                        Nivel de escolaridad
                      </Label>
                      <Select name="nivelEscolaridad" required defaultValue={data.datosEncuesta?.nivelEscolaridad}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={<span className="text-muted-foreground">Escolaridad</span>} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bachiller">Bachiller</SelectItem>
                          <SelectItem value="Tecnólogo">Tecnólogo</SelectItem>
                          <SelectItem value="Técnico">Técnico</SelectItem>
                          <SelectItem value="Profesional">Profesional</SelectItem>
                          <SelectItem value="Pos grado">Pos grado</SelectItem>
                          <SelectItem value="Doctorado">Doctorado</SelectItem>
                          <SelectItem value="Pos doctorado">Pos doctorado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="familiaresDependientes" className="text-right">
                        Dependientes
                      </Label>
                      <Input
                        id="familiaresDependientes"
                        name="familiaresDependientes"
                        defaultValue={data.datosEncuesta?.familiaresDependientes || undefined}
                        className="col-span-3"
                        type="number"
                        required
                      />
                      <div className="col-span-3 col-start-2 text-sm text-muted-foreground">
                        Número de familiares dependientes (hijos, cónyugue o padres) con los que convive.
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="profesion1" className="text-right">
                        Profesión
                      </Label>
                      <Select name="profesion1" defaultValue={data.datosEncuesta?.profesion1} required>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={<span className="text-muted-foreground">Seleccionar...</span>} />
                        </SelectTrigger>
                        <SelectContent>
                          {profesiones.map((profesion) => (
                            <SelectItem key={profesion} value={profesion}>
                              {profesion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="col-span-3 col-start-2 text-sm text-muted-foreground">
                        Profesión que aplica para el perfil del cargo
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="profesion2" className="text-right">
                        Profesión adicional 1
                      </Label>
                      <Select name="profesion2" defaultValue={data.datosEncuesta?.profesion2 || 'N/A'}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={<span className="text-muted-foreground">Seleccionar...</span>} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="N/A">N/A</SelectItem>
                          {profesiones.map((profesion) => (
                            <SelectItem key={profesion} value={profesion}>
                              {profesion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="profesion3" className="text-right">
                        Profesión adicional 2
                      </Label>
                      <Select name="profesion3" defaultValue={data.datosEncuesta?.profesion3 || 'N/A'}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={<span className="text-muted-foreground">Seleccionar...</span>} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="N/A">N/A</SelectItem>
                          {profesiones.map((profesion) => (
                            <SelectItem key={profesion} value={profesion}>
                              {profesion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              <div className="grid w-full gap-4 py-4 lg:w-5/12">
                <div className="font-bold text-muted-foreground">Datos de servidor en provisionalidad</div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-span-3 flex items-center gap-4">
                    <Checkbox
                      id="tieneServidorProv"
                      name="tieneServidorProv"
                      checked={tieneServidorProv}
                      onCheckedChange={() => setTieneServidorProv(!tieneServidorProv)}
                    />
                    <Label htmlFor="tieneServidorProv">El cargo tiene un servidor en provisionalidad</Label>
                  </div>
                </div>

                {tieneServidorProv && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="tipoDocumentoProv" className="text-right">
                        Tipo de Documento
                      </Label>
                      <Select
                        name="tipoDocumentoProv"
                        defaultValue={defaults.nombresProv ? 'Cédula de ciudadanía' : undefined}
                        required
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={<span className="text-muted-foreground">Tipo de Documento</span>} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cédula de ciudadanía">Cédula de ciudadanía</SelectItem>
                          <SelectItem value="Cédula de extranjería">Cédula de extranjería</SelectItem>
                          <SelectItem value="Número Único de Identificación Personal (NUIP)">
                            Número Único de Identificación Personal (NUIP)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="documentoProv" className="text-right">
                        Documento
                      </Label>
                      <Input
                        id="documentoProv"
                        name="documentoProv"
                        defaultValue={defaults.documentoProv}
                        className="col-span-3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="nombresProv" className="text-right">
                        Nombres
                      </Label>
                      <Input
                        id="nombresProv"
                        name="nombresProv"
                        defaultValue={defaults.nombresProv}
                        className="col-span-3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="apellidosProv" className="text-right">
                        Apellidos
                      </Label>
                      <Input
                        id="apellidosProv"
                        name="apellidosProv"
                        defaultValue={defaults.apellidosProv}
                        className="col-span-3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="nivelEscolaridadProv" className="text-right">
                        Nivel de escolaridad
                      </Label>
                      <Select
                        name="nivelEscolaridadProv"
                        defaultValue={data.datosEncuesta?.nivelEscolaridadProv}
                        required
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={<span className="text-muted-foreground">Escolaridad</span>} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bachiller">Bachiller</SelectItem>
                          <SelectItem value="Tecnólogo">Tecnólogo</SelectItem>
                          <SelectItem value="Técnico">Técnico</SelectItem>
                          <SelectItem value="Profesional">Profesional</SelectItem>
                          <SelectItem value="Pos grado">Pos grado</SelectItem>
                          <SelectItem value="Doctorado">Doctorado</SelectItem>
                          <SelectItem value="Pos doctorado">Pos doctorado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="familiaresDependientesProv" className="text-right">
                        Dependientes
                      </Label>
                      <Input
                        id="familiaresDependientesProv"
                        name="familiaresDependientesProv"
                        defaultValue={data.datosEncuesta?.familiaresDependientesProv || undefined}
                        className="col-span-3"
                        type="number"
                        required
                      />
                      <div className="col-span-3 col-start-2 text-sm text-muted-foreground">
                        Número de familiares dependientes (hijos, cónyugue o padres) con los que convive.
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="profesion1Prov" className="text-right">
                        Profesión
                      </Label>
                      <Select name="profesion1Prov" defaultValue={data.datosEncuesta?.profesion1Prov} required>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={<span className="text-muted-foreground">Seleccionar...</span>} />
                        </SelectTrigger>
                        <SelectContent>
                          {profesiones.map((profesion) => (
                            <SelectItem key={profesion} value={profesion}>
                              {profesion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="col-span-3 col-start-2 text-sm text-muted-foreground">
                        Profesión que aplica para el perfil del cargo
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="profesion2Prov" className="text-right">
                        Profesión adicional 1
                      </Label>
                      <Select name="profesion2Prov" defaultValue={data.datosEncuesta?.profesion2Prov || 'N/A'}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={<span className="text-muted-foreground">Seleccionar...</span>} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="N/A">N/A</SelectItem>
                          {profesiones.map((profesion) => (
                            <SelectItem key={profesion} value={profesion}>
                              {profesion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="profesion3Prov" className="text-right">
                        Profesión adicional 2
                      </Label>
                      <Select name="profesion3Prov" defaultValue={data.datosEncuesta?.profesion3Prov || 'N/A'}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={<span className="text-muted-foreground">Seleccionar...</span>} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="N/A">N/A</SelectItem>
                          {profesiones.map((profesion) => (
                            <SelectItem key={profesion} value={profesion}>
                              {profesion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <div className="flex justify-center gap-4">
            <Button variant="secondary" disabled={save.isPending} onClick={() => router.push('/actualizacion')}>
              Cancelar
            </Button>
            <Button type="submit" variant="default" disabled={save.isPending}>
              Guardar
            </Button>
          </div>
          <div className="font-bold text-red-500">{save.error?.message}</div>
        </CardFooter>
      </Card>
    </form>
  )
}
