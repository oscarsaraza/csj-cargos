'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { RouterOutputs } from '~/trpc/react'

type EncuestaServidorFormProps = {
  data: RouterOutputs['encuestas']['byId']['data']
  defaults: RouterOutputs['encuestas']['byId']['defaults']
}

export function EncuestaServidorForm({ data, defaults }: EncuestaServidorFormProps) {
  const [tieneServidorProv, setTieneServidorProv] = useState(defaults.tieneServidorEnProvisionalidad)

  if (!data) return null

  return (
    <form>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            {data.descripcionCargo} {data.gradoCargo}
          </CardTitle>
          <div className="text-center font-bold text-muted-foreground">{data.nombreDespacho}</div>
        </CardHeader>
        <CardContent className="flex flex-row flex-wrap gap-8">
          <div>
            <div className="text-center font-bold text-muted-foreground">Datos de servidor en propiedad</div>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tipoDocumento" className="text-right">
                  Tipo de Documento
                </Label>
                <Select name="tipoDocumento" defaultValue="Cédula de ciudadanía" required>
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
                <Select name="nivelEscolaridad" required>
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
                  Familiares dependientes
                </Label>
                <Input
                  id="familiaresDependientes"
                  name="familiaresDependientes"
                  className="col-span-3"
                  required
                  type="number"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="profesion1" className="text-right">
                  Profesion 1
                </Label>
                <Input id="profesion1" name="profesion1" className="col-span-3" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="profesion2" className="text-right">
                  Profesion 2
                </Label>
                <Input id="profesion2" name="profesion2" className="col-span-3" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="profesion3" className="text-right">
                  Profesion 3
                </Label>
                <Input id="profesion3" name="profesion3" className="col-span-3" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-3 col-start-2 flex items-center gap-4">
                  <Checkbox
                    id="tieneServidorProv"
                    name="tieneServidorProv"
                    checked={tieneServidorProv}
                    onCheckedChange={() => setTieneServidorProv(!tieneServidorProv)}
                  />
                  <Label htmlFor="tieneServidorProv">El cargo tiene un servidor en provisionalidad</Label>
                </div>
              </div>
            </div>
          </div>

          {tieneServidorProv && (
            <div>
              <div className="text-center font-bold text-muted-foreground">Datos de servidor en provisionalidad</div>

              <div className="grid gap-4 py-4">
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
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nivelEscolaridadProv" className="text-right">
                    Nivel de escolaridad
                  </Label>
                  <Select name="nivelEscolaridadProv" required>
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
                    Familiares dependientes
                  </Label>
                  <Input
                    id="familiaresDependientesProv"
                    name="familiaresDependientesProv"
                    className="col-span-3"
                    type="number"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="profesion1Prov" className="text-right">
                    Profesion 1
                  </Label>
                  <Input id="profesion1Prov" name="profesion1Prov" className="col-span-3" />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="profesion2Prov" className="text-right">
                    Profesion 2
                  </Label>
                  <Input id="profesion2Prov" name="profesion2Prov" className="col-span-3" />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="profesion3Prov" className="text-right">
                    Profesion 3
                  </Label>
                  <Input id="profesion3Prov" name="profesion3Prov" className="col-span-3" />
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          {/* disabled={save.isPending || remove.isPending} */}
          <Button type="submit" variant="default">
            Guardar
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
