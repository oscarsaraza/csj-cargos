'use client'

import { ActoAdministrativo } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import { api } from '~/trpc/react'

type ActoFormProps = {
  datosUdaeId: string
  actosAdministrativosList: ActoAdministrativo[]
}

export function EnlaceActoForm({ datosUdaeId, actosAdministrativosList }: ActoFormProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const { data: datosEnlace, refetch } = api.enlaceActos.datosFormularioEdicion.useQuery({ datosUdaeId })

  const utils = api.useUtils()
  const onSuccess = () => {
    utils.actos.getList.invalidate()
    setOpen(false)
    refetch()
    router.refresh()
  }

  const save = api.enlaceActos.save.useMutation({ onSuccess })
  const remove = api.enlaceActos.remove.useMutation({ onSuccess })

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    save.mutate({
      datosUdaeId: datosUdaeId,
      actoAdministrativoId: data.get('actoAdministrativoId') as string,
      articulo: data.get('articulo') as string,
      literal: data.get('literal') as string,
      numeral: data.get('numeral') as string,
      perfilCargo: data.get('perfilCargo') as string,
    })
  }

  const onDelete = () => {
    if (!datosEnlace?.datosActoAdministrativo?.id) return
    remove.mutate({ id: datosEnlace.datosActoAdministrativo.id })
  }

  const title = `${datosEnlace?.datosActoAdministrativo?.id ? 'Editar' : 'Registrar'}`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{title}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Información de acto administrativo de creación del cargo</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="actoAdministrativoId" className="text-right">
                Acto
              </Label>
              <Select
                name="actoAdministrativoId"
                defaultValue={datosEnlace?.datosActoAdministrativo?.actoAdministrativoId}
                required
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Seleccione el acto administrativo" />
                </SelectTrigger>
                <SelectContent>
                  {actosAdministrativosList?.map((acto) => (
                    <SelectItem value={acto.id} key={acto.id}>
                      {acto.anio}: {acto.tipo} {acto.numero}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="articulo" className="text-right">
                Artículo
              </Label>
              <Input
                id="articulo"
                name="articulo"
                defaultValue={datosEnlace?.datosActoAdministrativo?.articulo}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="literal" className="text-right">
                Literal
              </Label>
              <Input
                id="literal"
                name="literal"
                defaultValue={datosEnlace?.datosActoAdministrativo?.literal || undefined}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="numeral" className="text-right">
                Numeral
              </Label>
              <Input
                id="numeral"
                name="numeral"
                defaultValue={datosEnlace?.datosActoAdministrativo?.numeral || undefined}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="perfilCargo" className="text-right">
                Perfil del cargo
              </Label>
              <Textarea
                id="perfilCargo"
                name="perfilCargo"
                defaultValue={datosEnlace?.datosActoAdministrativo?.perfilCargo || ''}
                className="col-span-3"
                required
                placeholder="Incluir todas las profesiones que solicita el perfil del cargo del acto administrativo."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            {datosEnlace?.datosActoAdministrativo?.id && (
              <Button variant="destructive" onClick={onDelete} disabled={save.isPending || remove.isPending}>
                Eliminar
              </Button>
            )}
            <Button type="submit" variant="default" disabled={save.isPending || remove.isPending}>
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
