'use client'

import { TipoActoAdministrativo } from '@prisma/client'
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
import { api } from '~/trpc/react'

type ActoFormProps = {
  actoId?: string
}

export function ActoForm({ actoId }: ActoFormProps) {
  const title = `${actoId ? 'Editar' : 'Nuevo'}`
  const [open, setOpen] = useState(false)
  const { data: acto } = api.actos.byId.useQuery({ id: actoId || '' }, { enabled: !!actoId })
  const router = useRouter()

  const utils = api.useUtils()
  const onSuccess = () => {
    utils.actos.getList.invalidate()
    setOpen(false)
    router.refresh()
  }

  const save = api.actos.save.useMutation({ onSuccess })
  const remove = api.actos.remove.useMutation({ onSuccess })

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    save.mutate({
      id: actoId,
      tipo: data.get('tipo') as TipoActoAdministrativo,
      anio: data.get('anio') as string,
      numero: data.get('numero') as string,
    })
  }

  const onDelete = () => {
    if (!actoId) return
    remove.mutate({ id: actoId })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{title}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Información de actos administrativos</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo" className="text-right">
                Tipo
              </Label>
              <Select name="tipo" value={acto?.tipo} required>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Seleccione el tipo de acto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACUERDO">Acuerdo</SelectItem>
                  <SelectItem value="DECRETO">Decreto</SelectItem>
                  <SelectItem value="LEY">Ley</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="anio" className="text-right">
                Año
              </Label>
              <Input id="anio" name="anio" value={acto?.anio} className="col-span-3" required />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="numero" className="text-right">
                Número
              </Label>
              <Input id="numero" name="numero" value={acto?.numero} className="col-span-3" required />
            </div>
          </div>
          <DialogFooter>
            {actoId && (
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
