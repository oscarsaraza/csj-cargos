'use client'

import { revalidatePath } from 'next/cache'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { api, RouterOutputs } from '~/trpc/react'

type ConfirmacionCargosDespachoFormProps = {
  despacho: NonNullable<RouterOutputs['despachos']['byUsuarioId']>
}

export function ConfirmacionCargosDespachoForm({ despacho }: ConfirmacionCargosDespachoFormProps) {
  const [cargosNoCoinciden, setCargosNoCoinciden] = useState(!!despacho.observacionesListadoCargos)
  const save = api.despachos.saveObservacionesListado.useMutation({
    onSuccess: () => {
      revalidatePath('/actualizacion')
    },
  })

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const observacionesListado = formData.get('observacionesListadoCargos')?.toString()

    if (!observacionesListado) return
    save.mutate({ id: despacho.id, observacionesListado })
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-4 items-center gap-4">
      <div className="col-span-4 flex items-center gap-4">
        <Checkbox
          id="cargosNoCoinciden"
          name="cargosNoCoinciden"
          checked={cargosNoCoinciden}
          onCheckedChange={() => setCargosNoCoinciden(!cargosNoCoinciden)}
        />

        <Label htmlFor="cargosNoCoinciden">
          Los cargos del despacho <span className="font-bold">NO</span> coinciden con los cargos del listado?
        </Label>
      </div>

      {cargosNoCoinciden && (
        <>
          <div className="col-span-4">
            <Label htmlFor="observacionesListadoCargos">Observaciones</Label>
            <Textarea
              id="observacionesListadoCargos"
              name="observacionesListadoCargos"
              rows={8}
              placeholder="Describa las inconsistencias encontradas entre los cargos del despacho y el listado anterior."
              defaultValue={despacho.observacionesListadoCargos || ''}
            />
          </div>

          <div className="col-span-4 text-center">
            <Button variant="default" type="submit" disabled={save.isPending}>
              Guardar
            </Button>
          </div>
        </>
      )}
    </form>
  )
}
