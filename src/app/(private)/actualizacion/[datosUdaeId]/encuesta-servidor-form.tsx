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
import { profesiones } from '~/lib/utils'
import { api, RouterOutputs } from '~/trpc/react'

type EncuestaServidorFormProps = {
  datosUdaeId: string
  data: RouterOutputs['encuestas']['byId']['data']
  defaults: RouterOutputs['encuestas']['byId']['defaults']
}

export function EncuestaServidorForm({ datosUdaeId, data, defaults }: EncuestaServidorFormProps) {
  const [tieneServidorProv, setTieneServidorProv] = useState(defaults.tieneServidorEnProvisionalidad)
  const [tieneServidorProp, setTieneServidorProp] = useState(defaults.tieneServidorEnPropiedad)
  const router = useRouter()
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

    save.mutate({
      datosUdaeId,
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
        </CardHeader>
        <CardContent className="flex flex-row flex-wrap items-start justify-around gap-8">
          <div className="grid w-full gap-4 py-4 lg:w-5/12">
            <div className="text-center font-bold text-muted-foreground">Datos de servidor en propiedad</div>
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
                  <Input id="nombres" name="nombres" defaultValue={defaults.nombres} className="col-span-3" required />
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
                  <Select name="profesion2" defaultValue={data.datosEncuesta?.profesion2}>
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
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="profesion3" className="text-right">
                    Profesión adicional 2
                  </Label>
                  <Select name="profesion3" defaultValue={data.datosEncuesta?.profesion3}>
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
                </div>
              </>
            )}
          </div>

          <div className="grid w-full gap-4 py-4 lg:w-5/12">
            <div className="text-center font-bold text-muted-foreground">Datos de servidor en provisionalidad</div>
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
                  <Select name="nivelEscolaridadProv" defaultValue={data.datosEncuesta?.nivelEscolaridadProv} required>
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
                  <Select name="profesion2Prov" defaultValue={data.datosEncuesta?.profesion2Prov}>
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
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="profesion3Prov" className="text-right">
                    Profesión adicional 2
                  </Label>
                  <Select name="profesion3Prov" defaultValue={data.datosEncuesta?.profesion3Prov}>
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
                </div>
              </>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-center gap-4">
          <Button variant="secondary" disabled={save.isPending} onClick={() => router.push('/actualizacion')}>
            Cancelar
          </Button>
          <Button type="submit" variant="default" disabled={save.isPending}>
            Guardar
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
